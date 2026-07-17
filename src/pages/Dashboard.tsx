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
    water: '#007AFF',
    exercise: '#FF9500',
    sleep: '#5856D6',
    weight: '#34C759',
  };

  const priorityColors = {
    high: 'bg-[#FF3B30]',
    medium: 'bg-[#FF9500]',
    low: 'bg-[#34C759]',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* 顶部问候 - 苹果风格大标题 */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-neutral-400 mb-1">{getFullDateDisplay()}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight mb-1">
          {getGreeting()}
        </h1>
        <p className="text-[15px] text-neutral-500">
          今天有 {totalTasks} 个任务，已完成 {completedTasks} 个
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日任务进度 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-neutral-200/60 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">今日任务</h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary-500 text-sm flex items-center gap-0.5 hover:text-primary-600 transition-colors"
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
                  stroke="#F5F5F7"
                  strokeWidth="10"
                  fill="none"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="54"
                  stroke="#0071E3"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-neutral-800">{completionRate}%</span>
                <span className="text-xs text-neutral-400 mt-0.5">完成率</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-neutral-50 rounded-xl py-3 text-center">
              <p className="text-2xl font-semibold text-neutral-800">{completedTasks}</p>
              <p className="text-xs text-neutral-400 mt-0.5">已完成</p>
            </div>
            <div className="bg-neutral-50 rounded-xl py-3 text-center">
              <p className="text-2xl font-semibold text-neutral-800">{totalTasks - completedTasks}</p>
              <p className="text-xs text-neutral-400 mt-0.5">待完成</p>
            </div>
          </div>
        </motion.div>

        {/* 健康概览 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/60 card-hover"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-neutral-800">健康概览</h3>
            <button
              onClick={() => navigate('/health')}
              className="text-primary-500 text-sm flex items-center gap-0.5 hover:text-primary-600 transition-colors"
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
                  className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/health')}
                >
                  <div
                    className="w-10 h-10 mb-3 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${healthColors[item.type]}15` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: healthColors[item.type] }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-neutral-800">
                    {item.total.toFixed(item.type === 'weight' ? 1 : 0)}
                    <span className="text-xs text-neutral-400 ml-1 font-normal">
                      {item.type === 'water' ? 'ml' : item.type === 'exercise' ? '分钟' : item.type === 'sleep' ? '小时' : 'kg'}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">{HEALTH_LABELS[item.type]}</p>
                  <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: healthColors[item.type] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 即将到来 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-neutral-200/60 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-neutral-800">即将到来</h3>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary-500 text-sm flex items-center gap-0.5 hover:text-primary-600 transition-colors"
            >
              全部任务 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无待办任务</p>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/tasks')}
                >
                  <div className={`w-1 h-8 rounded-full ${priorityColors[task.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate text-[15px]">{task.title}</p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100">
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

        {/* 快捷功能 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-neutral-200/60 card-hover"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-neutral-800">快捷功能</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/tasks')}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">新建任务</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#007AFF' }}>
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">记录饮水</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FF9500' }}>
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-700">记录运动</span>
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
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
