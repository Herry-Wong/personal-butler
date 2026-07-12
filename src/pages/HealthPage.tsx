import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Droplets,
  Dumbbell,
  Moon,
  Scale,
  Plus,
  Minus,
  TrendingUp,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HEALTH_LABELS, HEALTH_UNITS, HEALTH_GOALS } from '../types';
import type { HealthType } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

const HealthPage = () => {
  const { addHealthRecord, getTodayHealthRecords, getHealthTrend } = useAppStore();
  const [activeType, setActiveType] = useState<HealthType>('water');
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  const healthTypes: HealthType[] = ['water', 'exercise', 'sleep', 'weight'];

  const healthIcons: Record<HealthType, typeof Droplets> = {
    water: Droplets,
    exercise: Dumbbell,
    sleep: Moon,
    weight: Scale,
  };

  const healthGradients: Record<HealthType, string> = {
    water: 'from-blue-400 to-cyan-400',
    exercise: 'from-orange-400 to-red-400',
    sleep: 'from-purple-400 to-indigo-400',
    weight: 'from-green-400 to-teal-400',
  };

  const healthBgLights: Record<HealthType, string> = {
    water: 'bg-blue-50',
    exercise: 'bg-orange-50',
    sleep: 'bg-purple-50',
    weight: 'bg-green-50',
  };

  const todayData = healthTypes.map((type) => {
    const records = getTodayHealthRecords(type);
    const total = records.reduce((sum, r) => sum + r.value, 0);
    const goal = HEALTH_GOALS[type];
    const percentage = Math.min(Math.round((total / goal) * 100), 100);
    return { type, total, goal, percentage };
  });

  const handleQuickAdd = (type: HealthType, amount: number) => {
    addHealthRecord({
      type,
      value: amount,
      unit: HEALTH_UNITS[type],
      date: getTodayDateString(),
    });
  };

  const trendData = getHealthTrend(activeType, trendDays).map((record) => ({
    date: record.date.slice(5),
    value: record.value,
    unit: record.unit,
  }));

  const healthSuggestions = [
    {
      icon: Droplets,
      title: '保持水分充足',
      description: '建议每天饮用2000ml水，分次少量饮用效果更佳。早起一杯温水可以唤醒新陈代谢。',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Dumbbell,
      title: '坚持每日运动',
      description: '每天30分钟中等强度运动有助于提升心肺功能。可以从简单的快走开始，循序渐进。',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Moon,
      title: '优质睡眠',
      description: '保持规律的作息时间，睡前1小时远离电子设备。7-8小时的睡眠能让你精力充沛。',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const quickAddAmounts: Record<HealthType, number[]> = {
    water: [200, 500],
    exercise: [10, 30],
    sleep: [1, 2],
    weight: [0.5, 1],
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

  const activeTypeData = todayData.find((d) => d.type === activeType)!;
  const ActiveIcon = healthIcons[activeType];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-1">
          健康管家
        </h1>
        <p className="text-sm text-neutral-500">
          记录每日健康数据，养成良好生活习惯
        </p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {todayData.map((item) => {
          const Icon = healthIcons[item.type];
          const isActive = activeType === item.type;
          return (
            <motion.div
              key={item.type}
              whileHover={{ y: -4 }}
              onClick={() => setActiveType(item.type)}
              className={`relative p-5 rounded-2xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-white shadow-cardHover ring-2 ring-primary-200'
                  : 'bg-white shadow-card hover:shadow-cardHover'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${healthGradients[item.type]} flex items-center justify-center shadow-lg mb-3`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-neutral-800 mb-0.5">
                {item.total.toFixed(item.type === 'weight' ? 1 : 0)}
                <span className="text-sm font-normal text-neutral-400 ml-1">
                  {HEALTH_UNITS[item.type]}
                </span>
              </p>
              <p className="text-sm text-neutral-500 mb-3">{HEALTH_LABELS[item.type]}</p>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${healthGradients[item.type]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-2">目标 {item.goal}{HEALTH_UNITS[item.type]}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${healthBgLights[activeType]} flex items-center justify-center`}>
                <ActiveIcon className={`w-5 h-5 bg-gradient-to-br ${healthGradients[activeType]} bg-clip-text`} style={{ color: activeType === 'water' ? '#3B82F6' : activeType === 'exercise' ? '#F97316' : activeType === 'sleep' ? '#A855F7' : '#22C55E' }} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">{HEALTH_LABELS[activeType]}趋势</h3>
                <p className="text-xs text-neutral-400">近{trendDays}天数据</p>
              </div>
            </div>
            <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
              {([7, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setTrendDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    trendDays === days
                      ? 'bg-white text-neutral-800 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${activeType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        activeType === 'water'
                          ? '#3B82F6'
                          : activeType === 'exercise'
                          ? '#F97316'
                          : activeType === 'sleep'
                          ? '#A855F7'
                          : '#22C55E'
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        activeType === 'water'
                          ? '#3B82F6'
                          : activeType === 'exercise'
                          ? '#F97316'
                          : activeType === 'sleep'
                          ? '#A855F7'
                          : '#22C55E'
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F2ED" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#A8A39D' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#A8A39D' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                  }}
                  formatter={(value: number) => [`${value} ${HEALTH_UNITS[activeType]}`, HEALTH_LABELS[activeType]]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={
                    activeType === 'water'
                      ? '#3B82F6'
                      : activeType === 'exercise'
                      ? '#F97316'
                      : activeType === 'sleep'
                      ? '#A855F7'
                      : '#22C55E'
                  }
                  strokeWidth={3}
                  fill={`url(#gradient-${activeType})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">快速记录</h3>
              <p className="text-xs text-neutral-400">点击按钮添加{HEALTH_LABELS[activeType]}数据</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${healthBgLights[activeType]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-700">今日已记录</span>
                <span className="text-lg font-bold text-neutral-800">
                  {activeTypeData.total.toFixed(activeType === 'weight' ? 1 : 0)} {HEALTH_UNITS[activeType]}
                </span>
              </div>
              <div className="flex gap-2">
                {quickAddAmounts[activeType].map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAdd(activeType, amount)}
                    className={`flex-1 py-3 rounded-xl bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all bg-gradient-to-br ${healthGradients[activeType]} text-white`}
                  >
                    +{amount} {HEALTH_UNITS[activeType]}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAdd(activeType, quickAddAmounts[activeType][0] * -1)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
                减少
              </button>
              <button
                onClick={() => handleQuickAdd(activeType, quickAddAmounts[activeType][1])}
                className="flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 transition-all"
              >
                <Plus className="w-4 h-4" />
                自定义
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary-lavender" />
          <h3 className="font-semibold text-neutral-800">健康建议</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-5 rounded-2xl ${suggestion.bgColor} card-hover cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 ${suggestion.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-neutral-800 mb-2">{suggestion.title}</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">{suggestion.description}</p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium" style={{ color: suggestion.color.includes('blue') ? '#3B82F6' : suggestion.color.includes('orange') ? '#F97316' : '#A855F7' }}>
                  <TrendingUp className="w-4 h-4" />
                  了解更多
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HealthPage;
