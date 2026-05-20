import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart2, Flame, Award, Clock, Trash2, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Stats, DailyHistory } from '../types';

interface StatsDashboardProps {
  stats: Stats;
  history: DailyHistory[];
  onClearStats: () => void;
  primaryColorClass: string; // The active theme color to highlight stats
}

export default function StatsDashboard({
  stats,
  history,
  onClearStats,
  primaryColorClass,
}: StatsDashboardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Generate last 7 days of dates for the bar chart
  const getLast7Days = (): { dateLabel: string; fullDate: string; count: number; minutes: number }[] => {
    const list: { dateLabel: string; fullDate: string; count: number; minutes: number }[] = [];
    const daysName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const fullDateStr = `${year}-${month}-${date}`;

      const matchedHistory = history.find((h) => h.date === fullDateStr);

      list.push({
        dateLabel: `${daysName[d.getDay()]} ${d.getDate()}`,
        fullDate: fullDateStr,
        count: matchedHistory ? matchedHistory.count : 0,
        minutes: matchedHistory ? matchedHistory.minutes : 0,
      });
    }

    return list;
  };

  const chartData = getLast7Days();
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 30); // scale chart minimum scale of 30 mins

  const averageMinutes = Math.round(
    chartData.reduce((acc, c) => acc + c.minutes, 0) / 7
  );

  const handleWipeStats = () => {
    onClearStats();
    setShowConfirm(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl" id="stats-panel">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-sans text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
            Statistik Produktivitas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Pantau ketekunan dan kemajuan harian Anda</p>
        </div>

        {/* Delete / Reset stats triggered with warning state */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
            title="Reset Seluruh Statistik"
            id="trigger-reset-stats-btn"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5" id="confirmation-wipe-panel">
            <button
              onClick={handleWipeStats}
              className="rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-500 transition-colors uppercase cursor-pointer"
              id="confirm-reset-stats-btn"
            >
              Hapus!
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase cursor-pointer"
              id="cancel-reset-stats-btn"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Core Session Completed card */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:bg-white/10" id="stat-sessions-card">
          <Award className="mx-auto h-5 w-5 text-amber-400 mb-1" />
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SESI</span>
          <span className="font-mono text-xl font-bold text-white">{stats.completedSessions}</span>
          <span className="block text-[9px] text-slate-500 leading-tight">Mulai & Selesai</span>
        </div>

        {/* Focus timer minutes card */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:bg-white/10" id="stat-minutes-card">
          <Clock className="mx-auto h-5 w-5 text-indigo-400 mb-1" />
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">MENIT</span>
          <span className="font-mono text-xl font-bold text-white">{stats.totalMinutesFocus}</span>
          <span className="block text-[9px] text-slate-500 leading-tight">Total Waktu</span>
        </div>

        {/* Streak counts */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:bg-white/10" id="stat-streak-card">
          <Flame className="mx-auto h-5 w-5 text-rose-500 mb-1 animate-pulse" />
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">STREAK</span>
          <span className="font-mono text-xl font-bold text-white">{stats.streak} hari</span>
          <span className="block text-[9px] text-slate-500 leading-tight">Berturut-turut</span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="rounded-xl border border-white/5 bg-black/20 p-4" id="chart-panel">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Waktu Fokus (7 Hari Terakhir)</span>
          <span className="font-mono text-slate-400">Rerata: <b className="text-indigo-400">{averageMinutes}m</b>/hari</span>
        </div>

        {/* Simple Interactive SVG-based Bar Chart */}
        <div className="relative h-44 w-full">
          {/* Custom SVG Drawing */}
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Horizontal Grid guidelines */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Bars rendering */}
            {chartData.map((d, index) => {
              const xPos = 4 + index * 14; // spacing across the X-axis
              const barHeight = (d.minutes / maxMinutes) * 75; // bar height normalized to max minutes (75% limit of grid height)
              const yPos = 85 - barHeight; // Y axis relative from top (leaves 15% padding at bottom for labels)

              const isToday = new Date().toDateString() === new Date(d.fullDate).toDateString();

              return (
                <g key={d.fullDate} className="group/bar cursor-help">
                  {/* Bar shape */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width="8"
                    height={barHeight || 1} // At least 1px height for 0 min so we see something
                    rx="1.5"
                    fill={isToday ? 'url(#activeGrad)' : (barHeight > 0 ? 'url(#barGrad)' : 'rgba(255, 255, 255, 0.08)')}
                    className="transition-all duration-300 group-hover/bar:brightness-125"
                  />

                  {/* Highlighting border around active/today's bar */}
                  {isToday && (
                    <rect
                      x={xPos - 0.5}
                      y={yPos - 0.5}
                      width="9"
                      height={(barHeight || 1) + 1}
                      rx="2"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="0.5"
                      opacity="0.7"
                    />
                  )}
                </g>
              );
            })}

            {/* Custom Gradients definitions loaded inside SVG */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo-600 */}
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" /> {/* Indigo-450 */}
              </linearGradient>
              <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" /> {/* Rose-600 */}
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.2" /> {/* Rose-400 */}
              </linearGradient>
            </defs>
          </svg>

          {/* absolute positioned labels over the chart */}
          <div className="absolute inset-0 flex select-none pointer-events-none items-end">
            {chartData.map((d, idx) => {
              const leftOffset = 4 + idx * 14;
              const isToday = new Date().toDateString() === new Date(d.fullDate).toDateString();
              return (
                <div
                  key={d.fullDate}
                  style={{ left: `${leftOffset}%`, width: '8%', textAlign: 'center' }}
                  className="absolute bottom-0 text-[8px] font-semibold text-slate-400 transition-colors"
                >
                  <span className={isToday ? `text-rose-400 font-bold` : ''}>{d.dateLabel.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          {/* Hover state minutes counters overlay */}
          <div className="absolute inset-0 flex select-none pointer-events-none items-end mb-4">
            {chartData.map((d, idx) => {
              const leftOffset = 4 + idx * 14;
              return (
                <div
                  key={`val-${d.fullDate}`}
                  style={{ left: `${leftOffset - 4}%`, width: '16%' }}
                  className="absolute text-center opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-white/20 text-[9px] text-white font-mono rounded px-1 py-0.5 pointer-events-none shadow-lg -translate-y-12"
                >
                  {d.minutes}m
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level / Productivity Tier Badge */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-950/40 border border-white/5 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wide">
              {stats.completedSessions >= 20 ? 'Productivity Guru 👑' : stats.completedSessions >= 8 ? 'Master Fokus 🌟' : stats.completedSessions >= 3 ? 'Pembelajar Fokus 🌱' : 'Inisiator Fokus 🚀'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {stats.completedSessions >= 20 ? 'Luar biasa! Tingkat konsentrasi Anda sangat prima.' : stats.completedSessions >= 8 ? 'Anda telah membangun kebiasaan belajar yang sangat baik.' : stats.completedSessions >= 3 ? 'Kerja bagus, pertahankan tren positif fokus Anda!' : 'Selesaikan sesi pertama Anda untuk menaikkan predikat.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
