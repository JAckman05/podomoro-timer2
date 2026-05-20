import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, Edit2, Play, Flame, CircleDot, ArrowDown } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (text: string, estTomatoes: number) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectActiveTask: (id: string | null) => void;
  onEditTask: (id: string, newText: string) => void;
}

export default function TaskList({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSelectActiveTask,
  onEditTask,
}: TaskListProps) {
  const [inputText, setInputText] = useState('');
  const [estTomatoes, setEstTomatoes] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddTask(inputText.trim(), estTomatoes);
    setInputText('');
    setEstTomatoes(1);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onEditTask(id, editText.trim());
    setEditingId(null);
  };

  // Sort tasks: Active/incomplete tasks first (newest created first), completed tasks at the bottom (newest completed first/creation order)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return b.createdAt - a.createdAt; // newest first
  });

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl" id="task-list-panel">
      {/* Title */}
      <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h3 className="font-sans text-lg font-bold text-white flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-rose-500 animate-pulse" />
            Daftar Fokus & Tugas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Kelola target belajar dan sesi fokus Anda</p>
        </div>
        
        {tasks.length > 0 && (
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 font-mono text-xs text-slate-300">
            Selesai: {tasks.filter(t => t.completed).length}/{tasks.length}
          </span>
        )}
      </div>

      {/* Active Focus Alert */}
      {activeTask && !activeTask.completed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3.5 text-rose-200 flex items-center justify-between"
          id="active-target-banner"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <Flame className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 block leading-tight">
                FOKUS UTAMA SAAT INI
              </span>
              <span className="text-sm font-medium text-white line-clamp-1">{activeTask.text}</span>
            </div>
          </div>
          <button
            onClick={() => onSelectActiveTask(null)}
            className="text-xs rounded px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 hover:text-white transition-all cursor-pointer"
            id="clear-active-target-btn"
          >
            Lepas
          </button>
        </motion.div>
      )}

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl bg-white/5 p-4 border border-white/5" id="task-form">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-input">
            Tugas Baru
          </label>
          <div className="flex gap-2">
            <input
              id="task-input"
              type="text"
              placeholder="Apa yang ingin Anda fokuskan?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Tactile Tomato Token Estimate Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimasi Pomodoro:</span>
            <div className="flex items-center gap-1 bg-black/20 p-1.5 rounded-lg border border-white/5">
              {[1, 2, 3, 4, 5].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setEstTomatoes(token)}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
                    estTomatoes >= token
                      ? 'scale-105 filter-none'
                      : 'opacity-30 grayscale saturate-50 hover:opacity-60'
                  }`}
                  id={`est-tomato-${token}-btn`}
                  title={`${token} Sesi Pomodoro (${token * 25} menit)`}
                >
                  <span className="text-lg">🍅</span>
                </button>
              ))}
              <span className="font-mono text-xs font-bold text-white px-1 ml-1">{estTomatoes}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/10 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
            id="add-task-btn"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </form>

      {/* Task List container */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1" id="task-items-container">
        {tasks.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-white/10 bg-white/5">
            <div className="text-3xl mb-2 animate-pulse">🎯</div>
            <p className="text-sm text-slate-400 font-sans">Belum ada tugas yang ditambahkan.</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan form di atas untuk memulai fokus pertamamu!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sortedTasks.map((task) => {
              const isEditing = editingId === task.id;
              const isSelected = task.id === activeTaskId;

              return (
                <motion.div
                  key={task.id}
                  layoutId={`task-card-${task.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className={`group relative overflow-hidden rounded-xl border p-3.5 transition-all ${
                    task.completed
                      ? 'border-white/5 bg-slate-950/20 opacity-60'
                      : isSelected
                      ? 'border-rose-500/40 bg-rose-500/5 shadow-md shadow-rose-500/5'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                  id={`task-item-${task.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Left: Completed state checkbox & Text content */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'border-white/20 hover:border-white/40 bg-white/5 text-transparent hover:text-white/30'
                        }`}
                        id={`complete-task-${task.id}-btn`}
                        aria-label={task.completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </button>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-grow">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                            onBlur={() => handleSaveEdit(task.id)}
                            autoFocus
                            className="w-full rounded bg-slate-950 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                            id={`edit-task-input-${task.id}`}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium leading-normal truncate ${
                              task.completed
                                ? 'line-through text-slate-500'
                                : 'text-slate-200'
                            }`}
                            onDoubleClick={() => !task.completed && startEditing(task)}
                          >
                            {task.text}
                          </p>
                          
                          {/* Tomato Counter Track: Estimasi vs Aktual */}
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                            <span className="text-rose-400">🍅</span>
                            <span className="text-slate-400">
                              Fokus: <b className="text-white font-medium">{task.pomodorosAct}</b> / {task.pomodorosEst}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Set Active / Select Focus Task trigger */}
                      {!task.completed && !isSelected && (
                        <button
                          onClick={() => onSelectActiveTask(task.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/25 hover:text-rose-400 transition-all cursor-pointer"
                          title="Fokus Utama"
                          id={`select-focus-task-${task.id}-btn`}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Edit Task text */}
                      {!task.completed && !isEditing && (
                        <button
                          onClick={() => startEditing(task)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                          title="Edit Tugas"
                          id={`edit-task-${task.id}-btn`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Delete Task */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 transition-all cursor-pointer"
                        title="Hapus Tugas"
                        id={`delete-task-${task.id}-btn`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Task complete notification banner helper */}
      {tasks.length > 0 && tasks.some(t => t.completed) && (
        <div className="mt-4 flex items-center justify-center gap-1.5 pointer-events-none opacity-40">
          <ArrowDown className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Tugas selesai dipindah ke bawah</span>
        </div>
      )}
    </div>
  );
}
