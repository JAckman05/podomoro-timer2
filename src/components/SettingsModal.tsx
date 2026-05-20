import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, ShieldAlert, Sparkles, VolumeX } from 'lucide-react';
import { TimerSettings } from '../types';
import { playNotificationSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdateSettings: (settings: TimerSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  const handleChange = (key: keyof TimerSettings, value: unknown) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleTestSound = () => {
    playNotificationSound(settings.soundType, settings.soundVolume);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            id="settings-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 p-6 text-white shadow-2xl backdrop-blur-2xl"
            id="settings-dialog"
          >
            {/* Ambient Background Glow inside modal */}
            <div className="absolute -top-24 -left-24 -z-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 -z-10 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="font-sans text-xl font-bold tracking-tight">
                  Pengaturan Premium
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                id="close-settings-btn"
                aria-label="Tutup Pengaturan"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content inside modal */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Duration Settings */}
              <div>
                <h4 className="mb-3 font-sans text-sm font-semibold text-indigo-300">
                  DURASI WAKTU (MENIT)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Pomodoro</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={settings.pomodoro}
                      onChange={(e) => handleChange('pomodoro', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-center font-mono text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      id="input-duration-pomodoro"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Break Pendek</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.shortBreak}
                      onChange={(e) => handleChange('shortBreak', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-center font-mono text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      id="input-duration-short-break"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Break Panjang</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={settings.longBreak}
                      onChange={(e) => handleChange('longBreak', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-center font-mono text-sm font-semibold text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      id="input-duration-long-break"
                    />
                  </div>
                </div>
              </div>

              {/* Sound Profile Settings */}
              <div>
                <h4 className="mb-3 font-sans text-sm font-semibold text-indigo-300">
                  SUARA NOTIFIKASI
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Tipe Alarm Sintetis (Web Audio API)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'zen', name: 'Zen Bowl (Menenangkan)' },
                        { id: 'chime', name: 'Premium Chime (Cerah)' },
                        { id: 'digital', name: 'Bip Digital (Klasik)' },
                        { id: 'synth', name: 'Chord Synth (Hangat)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleChange('soundType', item.id)}
                          className={`rounded-lg p-2.5 text-left text-xs transition-all border cursor-pointer ${
                            settings.soundType === item.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold shadow-inner'
                              : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                          }`}
                          id={`sound-${item.id}-btn`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Volume Notifikasi</span>
                      <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {settings.soundVolume === 0 ? (
                        <VolumeX className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-indigo-400" />
                      )}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.soundVolume}
                        onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                        className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-500 focus:outline-none transition-all"
                        id="sound-volume-slider"
                      />
                      <button
                        onClick={handleTestSound}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                        id="test-sound-btn"
                      >
                        Uji
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div>
                <h4 className="mb-3 font-sans text-sm font-semibold text-indigo-300">
                  ALUR OTOMATIS (BEHAVIOR)
                </h4>
                <div className="space-y-3 rounded-xl bg-white/5 p-3.5 border border-white/5">
                  <label className="flex items-center justify-between cursor-pointer group" id="label-auto-break">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Mulai Break Otomatis</span>
                      <span className="text-xs text-slate-400">Langsung mulai istirahat setelah sesi fokus selesai</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-500 cursor-pointer"
                      id="checkbox-auto-break"
                    />
                  </label>

                  <div className="h-[1px] bg-white/10 my-1" />

                  <label className="flex items-center justify-between cursor-pointer group" id="label-auto-pomodoro">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Mulai Pomodoro Otomatis</span>
                      <span className="text-xs text-slate-400">Langsung mulai fokus baru setelah sesi istirahat selesai</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-500 cursor-pointer"
                      id="checkbox-auto-pomodoro"
                    />
                  </label>

                  <div className="h-[1px] bg-white/10 my-1" />

                  <label className="flex items-center justify-between cursor-pointer group" id="label-custom-glow">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Efek Pijar Latar Belakang</span>
                      <span className="text-xs text-slate-400">Tambahkan efek warna ambient sesuai mode yang berjalan</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.customBackgroundGlow}
                      onChange={(e) => handleChange('customBackgroundGlow', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-500 cursor-pointer"
                      id="checkbox-custom-glow"
                    />
                  </label>
                </div>
              </div>

              {/* Note */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-200/90 flex gap-2.5 items-start">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Semua pengaturan ini disimpan secara lokal di browser Anda mengunakan <b className="text-amber-300">LocalStorage</b>. Mereka akan tetap aktif setelah tab ditutup atau dimuat ulang.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-600 focus:outline-none active:scale-[0.98] transition-all cursor-pointer"
                id="save-settings-btn"
              >
                Simpan & Terapkan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
