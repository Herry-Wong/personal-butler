import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskRepeat,
  HealthRecord,
  HealthType,
  ChatMessage,
  AppSettings,
} from '../types';

interface AppState {
  tasks: Task[];
  healthRecords: HealthRecord[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt'>) => void;
  deleteHealthRecord: (id: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  getTodayTasks: () => Task[];
  getUpcomingTasks: (limit?: number) => Task[];
  getTodayHealthRecords: (type: HealthType) => HealthRecord[];
  getHealthTrend: (type: HealthType, days?: number) => HealthRecord[];
  requestNotificationPermission: () => Promise<boolean>;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const createMockData = () => {
  const today = getTodayDate();
  const now = new Date();

  const tasks: Task[] = [
    {
      id: generateId(),
      title: '完成项目报告',
      description: '整理本周项目进度，撰写周报',
      category: 'work',
      priority: 'high',
      dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      repeat: 'none',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: '健身房锻炼',
      description: '有氧运动30分钟 + 力量训练',
      category: 'life',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      repeat: 'daily',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: '阅读技术书籍',
      description: '阅读《深入浅出React》第5章',
      category: 'study',
      priority: 'low',
      dueDate: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      repeat: 'daily',
      reminderEnabled: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: '晨间冥想',
      description: '15分钟正念冥想',
      category: 'life',
      priority: 'medium',
      dueDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      isCompleted: true,
      repeat: 'daily',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const healthRecords: HealthRecord[] = [];
  const healthTypes: HealthType[] = ['water', 'exercise', 'sleep', 'weight'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    healthTypes.forEach((type) => {
      let value = 0;
      let unit = '';

      switch (type) {
        case 'water':
          value = 1500 + Math.floor(Math.random() * 1000);
          unit = 'ml';
          break;
        case 'exercise':
          value = 20 + Math.floor(Math.random() * 40);
          unit = '分钟';
          break;
        case 'sleep':
          value = 6 + Math.random() * 3;
          unit = '小时';
          break;
        case 'weight':
          value = 63 + Math.random() * 4;
          unit = 'kg';
          break;
      }

      healthRecords.push({
        id: generateId(),
        type,
        value: Math.round(value * 10) / 10,
        unit,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    });
  }

  const chatMessages: ChatMessage[] = [
    {
      id: generateId(),
      role: 'assistant',
      content: '你好！我是你的个人管家AI助手。我可以帮你管理任务、记录健康数据，还能提供生活建议。有什么我可以帮你的吗？',
      timestamp: new Date().toISOString(),
    },
  ];

  return { tasks, healthRecords, chatMessages };
};

const mockData = createMockData();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: mockData.tasks,
      healthRecords: mockData.healthRecords,
      chatMessages: mockData.chatMessages,
      settings: {
        theme: 'light',
        notificationEnabled: false,
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
          ),
        }));
      },

      addHealthRecord: (record) => {
        const newRecord: HealthRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ healthRecords: [...state.healthRecords, newRecord] }));
      },

      deleteHealthRecord: (id) => {
        set((state) => ({
          healthRecords: state.healthRecords.filter((r) => r.id !== id),
        }));
      },

      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMessage] }));
      },

      clearChatMessages: () => {
        set({
          chatMessages: [
            {
              id: generateId(),
              role: 'assistant',
              content: '对话已清空。有什么我可以帮你的吗？',
              timestamp: new Date().toISOString(),
            },
          ],
        });
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      getTodayTasks: () => {
        const today = getTodayDate();
        return get().tasks.filter((task) => task.dueDate.startsWith(today));
      },

      getUpcomingTasks: (limit = 5) => {
        const now = new Date();
        return get()
          .tasks
          .filter((task) => !task.isCompleted && new Date(task.dueDate) > now)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, limit);
      },

      getTodayHealthRecords: (type) => {
        const today = getTodayDate();
        return get().healthRecords.filter(
          (r) => r.type === type && r.date === today
        );
      },

      getHealthTrend: (type, days = 7) => {
        const now = new Date();
        const startDate = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
        const startDateStr = startDate.toISOString().split('T')[0];

        return get()
          .healthRecords
          .filter((r) => r.type === type && r.date >= startDateStr)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          return false;
        }

        if (Notification.permission === 'granted') {
          get().updateSettings({ notificationEnabled: true });
          return true;
        }

        if (Notification.permission === 'denied') {
          return false;
        }

        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        get().updateSettings({ notificationEnabled: granted });
        return granted;
      },
    }),
    {
      name: 'personal-butler-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        healthRecords: state.healthRecords,
        chatMessages: state.chatMessages,
        settings: state.settings,
      }),
    }
  )
);
