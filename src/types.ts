export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodorosEst: number;
  pomodorosAct: number;
  createdAt: number;
}

export interface TimerSettings {
  pomodoro: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundVolume: number; // 0 to 1
  soundType: 'zen' | 'chime' | 'digital' | 'synth';
  customBackgroundGlow: boolean;
}

export interface Stats {
  completedSessions: number;
  totalMinutesFocus: number;
  streak: number;
  lastSessionDate: string | null; // YYYY-MM-DD
}

export interface DailyHistory {
  date: string; // YYYY-MM-DD
  count: number; // number of completed sessions
  minutes: number; // total minutes
}
