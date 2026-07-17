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
  Sparkles,
  Wand2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { HEALTH_LABELS, HEALTH_UNITS, HEALTH_GOALS } from '../types';
import type { HealthType, HealthPlan } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import HealthPlanGenerator from '../components/HealthPlanGenerator';
import HealthPlanDetail from '../components/HealthPlanDetail';
import SettingsModal from '../components/SettingsModal';

const HealthPage = () => {
  const { addHealthRecord, getTodayHealthRecords, getHealthTrend, healthPlans, settings } = useAppStore();
  const { addToast } = useToastStore();
  const [activeType, setActiveType] = useState<HealthType>('water');
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activePlan, setActivePlan] = useState<HealthPlan | undefined>(
    healthPlans.find((p) => p.status === 'active')
  );

  const healthTypes: HealthType[] = ['water', 'exercise', 'sleep', 'weight'];

  const healthIcons: Record<HealthType, typeof Droplets> = {
    water: Droplets,
    exercise: Dumbbell,
    sleep: Moon,
    weight: Scale,
  };

  // 苹果系统色
  const healthColors: Record<HealthType, string> = {
    water: '#007AFF',
    exercise: '#FF9500',
    sleep: '#5856D6',
    weight: '#34C759',
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
    addToast({ type: 'success', message: `已记录 ${HEALTH_LABELS[type]} +${amount}${HEALTH_UNITS[type]}` });
  };

  const trendData = getHealthTrend(activeType, trendDays).map((record) => ({
    date: record.date.slice(5),
    value: record.value,
    unit: record.unit,
  }));

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

  const activeTypeData = todayData.find((d) => d.type === activeType)!;
  const ActiveIcon = healthIcons[activeType];
  const activeColor = healthColors[activeType];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* 标题区 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800 tracking-tight">
            健康管家
          </h1>
          <p className="text-sm text-neutral-400">
            记录每日健康数据，养成良好习惯
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className={`p-2.5 rounded-xl transition-colors ${
            settings.deepseekApiKey
              ? 'bg-[#34C759]/10 text-[#34C759]'
              : 'bg-[#FF9500]/10 text-[#FF9500]'
          }`}
          title="设置 API Key"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* AI 健康计划区域 */}
      <motion.div variants={itemVariants}>
        {activePlan ? (
          <HealthPlanDetail plan={activePlan} />
        ) : (
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">AI 健康计划生成</h3>
                <p className="text-sm text-white/60 mb-4">
                  描述你的健康问题，AI 自动生成个性化锻炼计划
                </p>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="px-4 py-2 rounded-xl bg-white text-neutral-800 font-medium text-sm hover:bg-white/90 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  生成锻炼计划
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 历史计划列表 */}
      {healthPlans.length > 1 && !activePlan && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/60">
          <h3 className="font-semibold text-neutral-800 mb-3">历史计划</h3>
          <div className="space-y-1">
            {healthPlans.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlan(p)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-neutral-800 text-sm">{p.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{p.problem}</p>
                </div>
                <span className="text-xs text-neutral-400">
                  第{p.currentWeek}/{p.weekCount}周
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 健康数据卡片 */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {todayData.map((item) => {
          const Icon = healthIcons[item.type];
          const isActive = activeType === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setActiveType(item.type)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-white border-neutral-300'
                  : 'bg-white border-neutral-200/60 hover:border-neutral-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${healthColors[item.type]}15` }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: healthColors[item.type] }}
                />
              </div>
              <p className="text-2xl font-semibold text-neutral-800 mb-0.5">
                {item.total.toFixed(item.type === 'weight' ? 1 : 0)}
                <span className="text-sm font-normal text-neutral-400 ml-1">
                  {HEALTH_UNITS[item.type]}
                </span>
              </p>
              <p className="text-sm text-neutral-500 mb-3">{HEALTH_LABELS[item.type]}</p>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: healthColors[item.type] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-2">目标 {item.goal}{HEALTH_UNITS[item.type]}</p>
            </button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-neutral-200/60"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${activeColor}15` }}
              >
                <ActiveIcon className="w-5 h-5" style={{ color: activeColor }} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 text-[15px]">{HEALTH_LABELS[activeType]}趋势</h3>
                <p className="text-xs text-neutral-400">近{trendDays}天数据</p>
              </div>
            </div>
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
              {([7, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setTrendDays(days)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    trendDays === days
                      ? 'bg-white text-neutral-800'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${activeType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#86868B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#86868B' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value} ${HEALTH_UNITS[activeType]}`, HEALTH_LABELS[activeType]]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={activeColor}
                  strokeWidth={2.5}
                  fill={`url(#gradient-${activeType})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 快速记录 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-neutral-200/60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${activeColor}15` }}
            >
              <Plus className="w-5 h-5" style={{ color: activeColor }} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 text-[15px]">快速记录</h3>
              <p className="text-xs text-neutral-400">添加{HEALTH_LABELS[activeType]}数据</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-600">今日已记录</span>
                <span className="text-xl font-semibold text-neutral-800">
                  {activeTypeData.total.toFixed(activeType === 'weight' ? 1 : 0)} {HEALTH_UNITS[activeType]}
                </span>
              </div>
              <div className="flex gap-2">
                {quickAddAmounts[activeType].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAdd(activeType, amount)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
                    style={{ backgroundColor: activeColor }}
                  >
                    +{amount} {HEALTH_UNITS[activeType]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAdd(activeType, quickAddAmounts[activeType][0] * -1)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
                减少
              </button>
              <button
                onClick={() => handleQuickAdd(activeType, quickAddAmounts[activeType][1])}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                自定义
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI 计划生成器弹窗 */}
      <AnimatePresence>
        {showGenerator && (
          <HealthPlanGenerator
            onPlanCreated={(plan) => {
              setActivePlan(plan);
              setShowGenerator(false);
            }}
            onClose={() => setShowGenerator(false)}
          />
        )}
      </AnimatePresence>

      {/* 设置弹窗 */}
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default HealthPage;
