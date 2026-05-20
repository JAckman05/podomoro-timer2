import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Sparkles, Coffee, Palmtree, Target } from 'lucide-react';
import { TimerMode, TimerSettings, Task } from '../types';

interface TimerProps {
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  mode: TimerMode;
  settings: TimerSettings;
  activeTask: Task | null;
  onToggleStartStop: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSelectMode: (mode: TimerMode) => void;
}

export default function Timer({
  timeLeft,
  totalDuration,
  isRunning,
  mode,
  settings,
  activeTask,
  onToggleStartStop,
  onReset,
  onSkip,
  onSelectMode,
}: TimerProps) {
  // Format MM:SS
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVGs Circular Progress calculations
  const radius = 120;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Guard progress division by zero
  const safeTotal = totalDuration > 0 ? totalDuration : 1;
  const progressRatio = timeLeft / safeTotal;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const getModeColorConfig = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'pomodoro':
        return {
          title: 'Sesi Fokus',
          tagline: 'Singkirkan gangguan, saatnya berkonsentrasi',
          icon: <Flame className="h-5 w-5 text-rose-400" />,
          strokeClass: 'text-rose-500',
          glowClass: 'shadow-rose-600/30',
          badgeText: 'FOKUS 🍅',
          buttonActiveBg: 'bg-rose-500/20 border-rose-500 text-white',
          buttonInactiveBg: 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
          accentColor: '#ef4444',
          ambientCircleGlow: 'rgba(239, 68, 68, 0.15)',
        };
      case 'shortBreak':
        return {
          title: 'Istirahat Pendek',
          tagline: 'Istirahatkan mata sejenak, ambil napas dalam-dalam',
          icon: <Coffee className="h-5 w-5 text-emerald-400" />,
          strokeClass: 'text-emerald-500',
          glowClass: 'shadow-emerald-600/30',
          badgeText: 'ISTIRAHAT ☕',
          buttonActiveBg: 'bg-emerald-500/20 border-emerald-500 text-white',
          buttonInactiveBg: 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
          accentColor: '#10b981',
          ambientCircleGlow: 'rgba(16, 185, 129, 0.15)',
        };
      case 'longBreak':
        return {
          title: 'Istirahat Panjang',
          tagline: 'Isi ulang energi penuh sebelum memulai kembali',
          icon: <Palmtree className="h-5 w-5 text-blue-400" />,
          strokeClass: 'text-blue-500',
          glowClass: 'shadow-blue-600/30',
          badgeText: 'RELAX 🌴',
          buttonActiveBg: 'bg-blue-500/20 border-blue-500 text-white',
          buttonInactiveBg: 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
          accentColor: '#3b82f6',
          ambientCircleGlow: 'rgba(59, 130, 246, 0.15)',
        };
    }
  };

  const modeConfig = getModeColorConfig(mode);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center" id="pomodoro-timer-core">
      
      {/* Mode Selectors */}
      <div className="mb-8 flex items-center justify-center gap-2.5 rounded-full bg-slate-950/40 p-1.5 border border-white/10 shadow-inner max-w-sm w-full">
        {(['pomodoro', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => {
          const cfg = getModeColorConfig(m);
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => onSelectMode(m)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-300 border cursor-pointer ${
                isActive ? cfg.buttonActiveBg : cfg.buttonInactiveBg
              }`}
              id={`select-mode-${m}-btn`}
            >
              {m === 'pomodoro' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
            </button>
          );
        })}
      </div>

      {/* Main Glassmorphic Countdown Dial */}
      <div className="relative mb-8 flex h-72 w-72 items-center justify-center" id="dial-container">
        
        {/* Subtle Ambient Behind-Circle Pulsating Glow in running state */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl transition-all duration-1000 -z-10"
          style={{
            backgroundColor: isRunning ? modeConfig.ambientCircleGlow : 'rgba(255,255,255,0.01)',
            transform: isRunning ? 'scale(1.1)' : 'scale(0.95)',
          }}
        />

        {/* Circular Clock SVG Wrapper */}
        <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
          {/* Static Track Gray Circle */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progressive Dynamic Colored Stroke */}
          <motion.circle
            cx="144"
            cy="144"
            r={radius}
            fill="transparent"
            stroke={modeConfig.accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: isRunning ? 0.95 : 0.4, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Context Area */}
        <div className="z-10 flex flex-col items-center justify-center text-white px-6">
          {/* Minimal Mode Indicator Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 mb-1 shadow-inner">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span className="font-mono text-[9px] font-bold tracking-widest text-slate-300">
              {modeConfig.badgeText}
            </span>
          </div>

          {/* Time digits */}
          <span className="font-mono text-5xl font-extrabold tracking-tighter text-white drop-shadow-md select-none leading-none mb-1.5">
            {formatTime(timeLeft)}
          </span>

          {/* Active focus task sub-label */}
          {activeTask ? (
            <div className="flex flex-col items-center max-w-[190px]">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold tracking-wider text-rose-400 uppercase leading-none min-h-[12px]">
                <Target className="h-2.5 w-2.5 shrink-0" />
                <span>Target</span>
              </div>
              <span className="text-xs font-semibold text-slate-200 mt-1 line-clamp-2 leading-snug px-1 text-center">
                {activeTask.text}
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 font-sans leading-relaxed tracking-wide opacity-80 max-w-[160px]">
              Ketuk untuk memulai fokus Anda
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="flex items-center gap-4 py-2" id="controls-toolbar">
        {/* Reset */}
        <button
          onClick={onReset}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20 hover:text-white hover:bg-slate-900 focus:outline-none hover:rotate-[-45deg] active:scale-90 transition-all cursor-pointer shadow-lg"
          title="Reset Sesi"
          aria-label="Atur Ulang Waktu"
          id="reset-timer-btn"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>

        {/* Core Play/Pause Toggles */}
        <button
          onClick={onToggleStartStop}
          style={{ backgroundColor: modeConfig.accentColor }}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl hover:brightness-110 active:scale-95 focus:outline-none transition-all cursor-pointer hover:shadow-2xl ${modeConfig.glowClass}`}
          title={isRunning ? 'Pause' : 'Start'}
          aria-label={isRunning ? "Jeda Fokus" : "Mulai Sesi Fokus"}
          id="toggle-timer-btn"
        >
          {isRunning ? (
            <Pause className="h-7 w-7 stroke-[2.5]" />
          ) : (
            <Play className="h-7 w-7 fill-white translate-x-0.5 stroke-[2.5]" />
          )}
        </button>

        {/* Skip to Next Session */}
        <button
          onClick={onSkip}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20 hover:text-white hover:bg-slate-900 focus:outline-none hover:translate-x-0.5 active:scale-90 transition-all cursor-pointer shadow-lg"
          title="Lewati Sesi Ini"
          aria-label="Lewati Sesi"
          id="skip-timer-btn"
        >
          <SkipForward className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Motivational description under countdown */}
      <p className="mt-6 text-sm italic font-sans text-slate-300 max-w-sm" id="timer-motivational-label">
        "{modeConfig.tagline}"
      </p>

    </div>
  );
}
