import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Settings, Info, Bell, Clock, RefreshCw, CheckCircle, HelpCircle, Heart } from 'lucide-react';

import { TimerMode, TimerSettings, Task, Stats, DailyHistory } from './types';
import { playNotificationSound } from './utils/audio';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import StatsDashboard from './components/StatsDashboard';
import SettingsModal from './components/SettingsModal';

// DEFAULT CONFIGURATIONS
const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundVolume: 0.5,
  soundType: 'zen',
  customBackgroundGlow: true,
};

const DEFAULT_STATS: Stats = {
  completedSessions: 0,
  totalMinutesFocus: 0,
  streak: 0,
  lastSessionDate: null,
};

export default function App() {
  // --- CORE APP STATES ---
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoro_premium_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('pomodoro_premium_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [history, setHistory] = useState<DailyHistory[]>(() => {
    const saved = localStorage.getItem('pomodoro_premium_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro_premium_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem('pomodoro_premium_active_task_id');
  });

  // --- TIMER ACTIVE STATES ---
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCycleCount, setSessionCycleCount] = useState(0); // Tracks consecutive Pomodoros for long break trigger (target: 4)

  // Modals controllers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Interval Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- SYNCHRONIZATION WITH LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('pomodoro_premium_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_premium_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('pomodoro_premium_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('pomodoro_premium_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem('pomodoro_premium_active_task_id', activeTaskId);
    } else {
      localStorage.removeItem('pomodoro_premium_active_task_id');
    }
  }, [activeTaskId]);

  // Sync TimertimeLeft with Settings duration updates when not running
  useEffect(() => {
    if (!isRunning) {
      const minutes = settings[mode];
      setTimeLeft(minutes * 60);
      setTotalDuration(minutes * 60);
    }
  }, [settings, mode, isRunning]);

  // --- TIMER TICKDOWN LOGIC ---
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Completed Session reached!
            clearInterval(timerIntervalRef.current!);
            handleTimerExpiration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode]);

  // --- UPDATE STREAKS AND DAILY STATS HISTORIES ---
  const registerCompletedSession = (focusMinutes: number) => {
    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Compute updated streak
    let newStreak = stats.streak;
    if (stats.lastSessionDate === yesterdayStr) {
      newStreak += 1;
    } else if (stats.lastSessionDate !== todayStr) {
      // Streak broken (or first ever)
      newStreak = 1;
    }

    // Update global Stats counters
    const updatedStats: Stats = {
      completedSessions: stats.completedSessions + 1,
      totalMinutesFocus: stats.totalMinutesFocus + focusMinutes,
      streak: newStreak,
      lastSessionDate: todayStr,
    };
    setStats(updatedStats);

    // Save Daily Record inside historical chart array
    setHistory((prevHistory) => {
      const matchedIdx = prevHistory.findIndex((h) => h.date === todayStr);
      if (matchedIdx >= 0) {
        const copy = [...prevHistory];
        copy[matchedIdx] = {
          ...copy[matchedIdx],
          count: copy[matchedIdx].count + 1,
          minutes: copy[matchedIdx].minutes + focusMinutes,
        };
        return copy;
      } else {
        return [
          ...prevHistory,
          {
            date: todayStr,
            count: 1,
            minutes: focusMinutes,
          },
        ];
      }
    });

    // Automatically increment actual tomato counter on targeted task!
    if (activeTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.id === activeTaskId) {
            const updatedTask = {
              ...t,
              pomodorosAct: t.pomodorosAct + 1,
            };
            // If actual tomatoes reach or exceed estimated, we can optionally trigger visual cues later
            return updatedTask;
          }
          return t;
        })
      );
    }
  };

  // --- ACTIONS TAKEN WHEN THE COUNTDOWN EXPIRES ---
  const handleTimerExpiration = () => {
    // Play bells synthesized chime immediately!
    playNotificationSound(settings.soundType, settings.soundVolume);

    setIsRunning(false);

    if (mode === 'pomodoro') {
      const actualFocusMinutes = settings.pomodoro;
      registerCompletedSession(actualFocusMinutes);

      const nextCycle = sessionCycleCount + 1;
      setSessionCycleCount(nextCycle);

      // standard sequence: Every 4th focus session is followed by a Long Break, else Short Break
      if (nextCycle > 0 && nextCycle % 4 === 0) {
        setMode('longBreak');
        const duration = settings.longBreak * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 300); // slight buffer to transition UI
        }
      } else {
        setMode('shortBreak');
        const duration = settings.shortBreak * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 300);
        }
      }
    } else {
      // Completed some break! Switch back to Pomodoro Focus mode
      setMode('pomodoro');
      const duration = settings.pomodoro * 60;
      setTimeLeft(duration);
      setTotalDuration(duration);
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 300);
      }
    }
  };

  // --- INTERMEDIATE CONTROL BUTTON HANDLERS ---
  const handleToggleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const minutes = settings[mode];
    setTimeLeft(minutes * 60);
    setTotalDuration(minutes * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    
    // Rotate naturally
    if (mode === 'pomodoro') {
      const nextCycle = sessionCycleCount + 1;
      setSessionCycleCount(nextCycle);
      if (nextCycle > 0 && nextCycle % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
  };

  const handleSelectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const m = settings[newMode];
    setTimeLeft(m * 60);
    setTotalDuration(m * 60);
  };

  // --- TASKS CONTROLLERS ---
  const handleAddTask = (text: string, estTomatoes: number) => {
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      text,
      completed: false,
      pomodorosEst: estTomatoes,
      pomodorosAct: 0,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);

    // If no active task currently selected, auto-set this newly added task as the main focus!
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          // Unselect focal target if it gets marked as completed
          if (newCompleted && activeTaskId === id) {
            setActiveTaskId(null);
          }
          return { ...t, completed: newCompleted };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleSelectActiveTask = (id: string | null) => {
    setActiveTaskId(id);
  };

  const handleEditTask = (id: string, newText: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  // --- STATS CONTROLLERS ---
  const handleClearStats = () => {
    setStats(DEFAULT_STATS);
    setHistory([]);
    setActiveTaskId(null);
    localStorage.removeItem('pomodoro_premium_stats');
    localStorage.removeItem('pomodoro_premium_history');
    localStorage.removeItem('pomodoro_premium_active_task_id');
  };

  // --- DYNAMIC BACKGROUND & GLOW THEMES SELECTOR ---
  const getBackgroundStyles = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          bgClass: 'from-slate-950 via-red-950/70 to-slate-950',
          glowColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/10',
          primaryAccent: 'rose',
        };
      case 'shortBreak':
        return {
          bgClass: 'from-slate-950 via-emerald-950/70 to-slate-950',
          glowColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/10',
          primaryAccent: 'emerald',
        };
      case 'longBreak':
        return {
          bgClass: 'from-slate-950 via-blue-950/70 to-slate-950',
          glowColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/10',
          primaryAccent: 'blue',
        };
    }
  };

  const themeConfig = getBackgroundStyles();

  return (
    <div className={`min-h-screen w-full bg-gradient-to-tr ${themeConfig.bgClass} flex flex-col justify-between text-slate-100 font-sans transition-all duration-1000 overflow-x-hidden relative`}>
      
      {/* Decorative Premium Glow Orbs */}
      {settings.customBackgroundGlow && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
          {/* Top light orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-0 left-1/4 h-96 w-96 rounded-full ${themeConfig.glowColor} blur-[120px] opacity-75`}
          />
          {/* Bottom right trailing orb */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, -50, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute bottom-0 right-1/4 h-96 w-96 rounded-full ${themeConfig.glowColor} blur-[140px] opacity-60`}
          />
        </div>
      )}

      {/* Floating Sparkles Vector Particle Elements for Ambient Vibe */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(12)].map((_, i) => {
          const delay = i * 1.5;
          const leftP = (i * 9) % 100;
          const size = i % 2 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1';
          return (
            <motion.div
              key={i}
              initial={{ y: '110vh', opacity: 0 }}
              animate={{
                y: '-10vh',
                opacity: [0, 0.4, 0.4, 0],
              }}
              transition={{
                duration: 12 + (i % 5) * 4,
                repeat: Infinity,
                delay: delay,
                ease: 'linear',
              }}
              style={{ left: `${leftP}%` }}
              className={`absolute rounded-full bg-white ${size} blur-[0.5px] opacity-0`}
            />
          );
        })}
      </div>

      {/* HEADER BAR */}
      <header className="w-full border-b border-white/5 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo holding customized title */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-spin-slow select-none">🍅</span>
            <div>
              <h1 className="font-sans text-base font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                Podomoro Timer
                <span className="rounded-md bg-gradient-to-r from-amber-500 to-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest shadow-md">
                  Premium
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider leading-none mt-0.5 uppercase">
                Teman Produktivitas Anda
              </p>
            </div>
          </div>

          {/* Settings Trigger & Notification Volume Control status */}
          <div className="flex items-center gap-2">
            
            {/* Quick Helper Button */}
            <button
              onClick={() => setShowInfoBanner(!showInfoBanner)}
              className={`rounded-full p-2 border transition-all cursor-pointer ${
                showInfoBanner 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              id="help-toggle-btn"
              title="Informasi Alur"
              aria-label="Tampilkan Panduan"
            >
              <Info className="h-4.5 w-4.5" />
            </button>

            {/* Main Configuration Settings anchor */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.8 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              id="open-settings-btn"
              title="Konfigurasi Timer"
              aria-label="Buka Pengaturan"
            >
              <Settings className="h-4 w-4 text-slate-400 animate-spin-hover" />
              <span>Pengaturan</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER CONTENT BODY */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* Row 1: Interactive Welcome and Guide Overlay (Dismissible) */}
        {showInfoBanner && (
          <div className="col-span-12" id="info-welcome-banner">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Decorative side accent matching theme mode */}
              <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-${themeConfig.primaryAccent}-500/80`} />
              
              <button
                onClick={() => setShowInfoBanner(false)}
                className="absolute top-3 right-3 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors"
                id="dismiss-banner-btn"
              >
                Sembunyikan
              </button>

              <div className="pl-2">
                <h3 className="font-sans text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  ✨ Selamat datang di Podomoro Timer Premium yang Eksklusif!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  Aplikasi ini dirancang menggunakan desain <b className="text-white">glassmorphic premium</b> untuk melatih kesabaran, disiplin dan tingkat konsentrasi terbaik Anda. 
                  Latar belakang berwarna merah melambangkan <b className="text-rose-400">fokus mendalam</b>, hijau melambangkan <b className="text-emerald-400">istirahat pendek</b>, dan biru melambangkan <b className="text-blue-400">relaksasi panjang</b>. 
                  Pilih tugas di bawah atau buat tugas baru untuk disinkronisasikan sebagai target fokus utama Anda di dalam lingkaran waktu!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-white/10 pt-3.5 mt-3 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🔄</span>
                    <span>Modus Siklik: 4x Fokus kemudian istirahat panjang</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🔊</span>
                    <span>Sinyal Alarm Sintetis berbasis Web Audio API aman</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">💾</span>
                    <span>Penyimpanan otomatis anti-hilang (LocalStorage)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Column Left (Col spans 12 or 5 on desktop): Timer core controls center */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 shadow-xl backdrop-blur-xl relative overflow-hidden" id="timer-box-panel">
            {/* Ambient indicator representing state */}
            <Timer
              timeLeft={timeLeft}
              totalDuration={totalDuration}
              isRunning={isRunning}
              mode={mode}
              settings={settings}
              activeTask={tasks.find((t) => t.id === activeTaskId) || null}
              onToggleStartStop={handleToggleStartStop}
              onReset={handleReset}
              onSkip={handleSkip}
              onSelectMode={handleSelectMode}
            />
          </div>
        </div>

        {/* Column Right (Col spans 12 or 7 on desktop): Tasks catalog & Statistics tracker */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Tasks Panel */}
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onSelectActiveTask={handleSelectActiveTask}
            onEditTask={handleEditTask}
          />

          {/* Stats & Charts tracker */}
          <StatsDashboard
            stats={stats}
            history={history}
            onClearStats={handleClearStats}
            primaryColorClass={mode === 'pomodoro' ? 'text-rose-400' : mode === 'shortBreak' ? 'text-emerald-400' : 'text-blue-400'}
          />
        </div>

      </main>

      {/* MODAL WINDOWS FOR CONFIGURATIONS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* FOOTER METADATA (Visually Clean, humble aesthetic design matching constraints) */}
      <footer className="w-full border-t border-white/5 py-4 bg-slate-950/30 text-center text-xs text-slate-500 relative z-10 font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="h-3 w-3 text-red-500 animate-pulse fill-red-500" />
            <span>untuk produktivitas optimal Anda.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Volume: <b className="text-slate-400">{Math.round(settings.soundVolume * 100)}%</b></span>
            <span>•</span>
            <span className="capitalize">Alarm: <b className="text-slate-400">{settings.soundType}</b></span>
            <span>•</span>
            <span className="text-slate-400">v1.2.0 Premium</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
