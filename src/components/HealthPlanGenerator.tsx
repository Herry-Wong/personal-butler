import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, Wand2, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateHealthPlan } from '../services/deepseek';
import type { HealthPlan } from '../types';

interface Props {
  onPlanCreated: (plan: HealthPlan) => void;
  onClose: () => void;
}

const COMMON_PROBLEMS = [
  '骨盆前倾，腰经常痛',
  '颈椎不适，久坐肩颈僵硬',
  '视力下降，眼睛干涩',
  '圆肩驼背，体态不佳',
];

const SEVERITY_OPTIONS = [
  { value: '轻微不适，偶尔发作', label: '轻微' },
  { value: '经常感到不适，影响专注', label: '经常' },
  { value: '持续疼痛，已影响工作生活', label: '严重' },
];

const DURATION_OPTIONS = [
  { value: '5分钟', label: '5分钟' },
  { value: '10分钟', label: '10分钟' },
  { value: '15分钟', label: '15分钟' },
  { value: '20分钟', label: '20分钟' },
];

const HealthPlanGenerator = ({ onPlanCreated, onClose }: Props) => {
  const { settings, addHealthPlan } = useAppStore();
  const [problem, setProblem] = useState('');
  const [severity, setSeverity] = useState(SEVERITY_OPTIONS[1].value);
  const [duration, setDuration] = useState(DURATION_OPTIONS[1].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!problem.trim()) {
      setError('请描述你的健康问题');
      return;
    }

    if (!settings.deepseekApiKey) {
      setError('请先在设置中填入 DeepSeek API Key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateHealthPlan({
        problem: problem.trim(),
        severity,
        duration,
        apiKey: settings.deepseekApiKey,
      });

      const planId = addHealthPlan({
        problem: problem.trim(),
        title: result.title,
        description: result.description,
        weekCount: result.weekCount,
        currentWeek: 1,
        actions: result.actions,
        dailySchedule: result.dailySchedule,
        status: 'active',
      });

      const newPlan: HealthPlan = {
        ...result,
        id: planId,
        problem: problem.trim(),
        currentWeek: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      onPlanCreated(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 表单内容（共用）
  const FormContent = () => (
    <div className="space-y-5">
      {/* 问题输入 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          你的健康问题
        </label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="例如：骨盆前倾，久坐腰痛..."
          className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-base"
          rows={3}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_PROBLEMS.map((p) => (
            <button
              key={p}
              onClick={() => setProblem(p)}
              className="px-3 py-1.5 rounded-full bg-neutral-100 text-xs text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 严重程度 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          严重程度
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSeverity(opt.value)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                severity === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 可用时间 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          每次可用时间
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                duration === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key 缺失提示 */}
      {!settings.deepseekApiKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FF9500]/10 text-[#FF9500] text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>需要在设置中填入 DeepSeek API Key 才能使用 AI 生成功能</span>
        </div>
      )}
    </div>
  );

  // 底部按钮（共用）
  const ActionButtons = () => (
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleGenerate}
        disabled={loading || !problem.trim() || !settings.deepseekApiKey}
        className="flex-[2] py-3.5 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 生成中...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            生成锻炼计划
          </>
        )}
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {/* 遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* 桌面端：居中弹窗 */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="hidden lg:block w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* 头部 */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-500 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">AI 健康计划生成</h2>
                  <p className="text-xs text-neutral-500">描述你的问题，AI 生成个性化锻炼计划</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* 表单 */}
            <div className="p-6">
              <FormContent />
            </div>

            {/* 底部按钮 */}
            <div className="p-6 border-t border-neutral-100">
              <ActionButtons />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 移动端：底部 Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部拖动条 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
        </div>

        {/* 头部 */}
        <div className="px-5 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-800">AI 健康计划</h2>
              <p className="text-xs text-neutral-500">生成个性化锻炼计划</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
          <FormContent />
        </div>

        {/* 底部按钮 - 适配 iPhone 安全区域 */}
        <div
          className="px-5 pt-4 border-t border-neutral-100"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <ActionButtons />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HealthPlanGenerator;
