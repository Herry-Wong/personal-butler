export type TaskCategory = 'work' | 'life' | 'study' | 'other';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  isCompleted: boolean;
  repeat: TaskRepeat;
  reminderEnabled: boolean;
  createdAt: string;
  reminded?: boolean;
}

export type HealthType = 'water' | 'exercise' | 'sleep' | 'weight';

export interface HealthRecord {
  id: string;
  type: HealthType;
  value: number;
  unit: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
  deepseekApiKey?: string;
}

// 锻炼动作
export interface ExerciseAction {
  id: string;
  name: string;           // 动作名称，如"臀桥"
  description: string;    // 动作描述
  sets: number;           // 组数
  reps: number;           // 每组次数（0 表示按时长）
  duration?: number;      // 持续秒数（静态动作用）
  videoUrl?: string;      // 用户添加的视频链接
  notes?: string;         // 注意事项
}

// 每日时间安排
export interface DailySchedule {
  time: string;           // "07:00"
  actionIds: string[];    // 这个时间点要做的动作 ID
}

// 健康锻炼计划
export interface HealthPlan {
  id: string;
  problem: string;        // 用户描述的问题，如"骨盆前倾"
  title: string;          // 计划标题
  description: string;    // 计划描述
  weekCount: number;      // 持续周数
  currentWeek: number;    // 当前周数（从 1 开始）
  actions: ExerciseAction[];
  dailySchedule: DailySchedule[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: '工作',
  life: '生活',
  study: '学习',
  other: '其他',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const REPEAT_LABELS: Record<TaskRepeat, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
};

export const HEALTH_LABELS: Record<HealthType, string> = {
  water: '饮水',
  exercise: '运动',
  sleep: '睡眠',
  weight: '体重',
};

export const HEALTH_UNITS: Record<HealthType, string> = {
  water: 'ml',
  exercise: '分钟',
  sleep: '小时',
  weight: 'kg',
};

export const HEALTH_GOALS: Record<HealthType, number> = {
  water: 2000,
  exercise: 30,
  sleep: 8,
  weight: 65,
};
