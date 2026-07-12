import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Droplets,
  Dumbbell,
  Moon,
  Scale,
  ChevronRight,
  Plus,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getGreeting, getFullDateDisplay, formatRelativeTime, formatTime } from '../utils/dateUtils';
import { HEALTH_GOALS, HEALTH_LABELS, CATEGORY_LABELS } from '../types';
import type { HealthType } from '../types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { getTodayTasks, getUpcomingTasks, getTodayHealthRecords } = useAppStore();

  const todayTasks = getTodayTasks();
  const completedTasks = todayTasks.filter((t) => t.isCompleted).length;
  const totalTasks = todayTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingTasks = getUpcomingTasks(3);

  const healthTypes: HealthType[] = ['water', 'exercise', 'sleep', 'weight'];

  const healthData = healthTypes.map((type) => {
    const records = getTodayHealthRecords(type);
    const total = records.reduce((sum, r) => sum + r.value, 0);
    const goal = HEALTH_GOALS[type];
    const percentage = Math.min(Math.round((total / goal) * 100), 100);
    return { type, total, goal, percentage };
  });

  const healthIcons: Record<HealthType, typeof Droplets> = {
    water: Droplets,
    exercise: Dumbbell,
    sleep: Moon,
    weight: Scale,
  };

  const healthColors: Record<HealthType, string> = {
    water: 'from-blue-400 to-cyan-400',
    exercise: 'from-orange-400 to-red-400',
    sleep: 'from-purple-400 to-indigo-400',
    weight: 'from-green-400 to-teal-400',
  };

  const priorityColors = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-green-400',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 gradient-primary text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">{getFullDateDisplay()}</p>
          <h1 className="font-display text-3xl font-semibold mb-2">
            {getGreeting()}！
          </h1>
          <p className="text-white/90 text-sm max-w-md">
            今天有 {totalTasks} 个任务等待完成，已完成 {completedTasks} 个。继续加油！
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">今日任务</h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="54"
                  stroke="#F5F2ED"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="54"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF9A56" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-neutral-800">{completionRate}%</span>
                <span className="text-xs text-neutral-400">完成率</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-center">
            <div className="bg-neutral-50 rounded-xl py-3">
              <p className="text-2xl font-semibold text-neutral-800">{completedTasks}</p>
              <p className="text-xs text-neutral-400">已完成</p>
            </div>
            <div className="bg-neutral-50 rounded-xl py-3">
              <p className="text-2xl font-semibold text-neutral-800">{totalTasks - completedTasks}</p>
              <p className="text-xs text-neutral-400">待完成</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card card-hover"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-neutral-800">健康概览</h3>
            <button
              onClick={() => navigate('/health')}
              className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              查看详情 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthData.map((item) => {
              const Icon = healthIcons[item.type];
              return (
                <div
                  key={item.type}
                  className="bg-neutral-50 rounded-xl p-4 text-center hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/health')}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${healthColors[item.type]} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-neutral-800">
                    {item.total.toFixed(item.type === 'weight' ? 1 : 0)}
                    <span className="text-xs text-neutral-400 ml-1">
                      {item.type === 'water' ? 'ml' : item.type === 'exercise' ? '分钟' : item.type === 'sleep' ? '小时' : 'kg'}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">{HEALTH_LABELS[item.type]}</p>
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${healthColors[item.type]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{item.percentage}%</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-neutral-800">即将到来</h3>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              全部任务 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无待办任务</p>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/tasks')}
                >
                  <div className={`w-1 h-10 rounded-full ${priorityColors[task.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate">{task.title}</p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100">
                        {CATEGORY_LABELS[task.category]}
                      </span>
                      <span>{formatRelativeTime(task.dueDate)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-500">
                      {formatTime(task.dueDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-secondary-lavender/20 to-primary-100/50 rounded-2xl p-6 shadow-card card-hover"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-secondary-lavender" />
            <h3 className="font-semibold text-neutral-800">快捷功能</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/tasks')}
              className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">新建任务</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl gradient-mint flex items-center justify-center shadow-lg shadow-secondary-mint/30">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">记录饮水</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">记录运动</span>
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl gradient-lavender flex items-center justify-center shadow-lg shadow-secondary-lavender/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">AI 对话</span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
