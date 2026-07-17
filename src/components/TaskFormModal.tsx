import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Bell, Repeat, Flag } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS, PRIORITY_LABELS, REPEAT_LABELS } from '../types';
import type { Task, TaskCategory, TaskPriority, TaskRepeat } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const TaskFormModal = ({ isOpen, onClose, editTask }: TaskFormModalProps) => {
  const { addTask, updateTask, setShowBottomNav } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setShowBottomNav(false);
    }
    return () => {
      setShowBottomNav(true);
    };
  }, [isOpen, setShowBottomNav]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [repeat, setRepeat] = useState<TaskRepeat>('none');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setCategory(editTask.category);
      setPriority(editTask.priority);
      const date = new Date(editTask.dueDate);
      setDueDate(date.toISOString().split('T')[0]);
      setDueTime(date.toTimeString().slice(0, 5));
      setRepeat(editTask.repeat);
      setReminderEnabled(editTask.reminderEnabled);
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      setDueDate(now.toISOString().split('T')[0]);
      setDueTime(now.toTimeString().slice(0, 5));
      setTitle('');
      setDescription('');
      setCategory('work');
      setPriority('medium');
      setRepeat('none');
      setReminderEnabled(true);
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dueDateTime = new Date(`${dueDate}T${dueTime}`).toISOString();

    if (editTask) {
      updateTask(editTask.id, {
        title,
        description,
        category,
        priority,
        dueDate: dueDateTime,
        repeat,
        reminderEnabled,
      });
    } else {
      addTask({
        title,
        description,
        category,
        priority,
        dueDate: dueDateTime,
        isCompleted: false,
        repeat,
        reminderEnabled,
      });
    }

    onClose();
  };

  const categories: TaskCategory[] = ['work', 'life', 'study', 'other'];
  const priorities: TaskPriority[] = ['high', 'medium', 'low'];
  const repeats: TaskRepeat[] = ['none', 'daily', 'weekly', 'monthly'];

  const priorityColors = {
    high: 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30]',
    medium: 'border-[#FF9500] bg-[#FF9500]/10 text-[#FF9500]',
    low: 'border-[#34C759] bg-[#34C759]/10 text-[#34C759]',
  };

  // 表单内容（桌面端和移动端共用）
  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          任务标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务标题..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-base"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          任务描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加任务描述（可选）..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          分类
        </label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            日期
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            时间
          </label>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <Flag className="w-4 h-4 inline mr-1" />
          优先级
        </label>
        <div className="grid grid-cols-3 gap-2">
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`py-2.5 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                priority === p
                  ? priorityColors[p]
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <Repeat className="w-4 h-4 inline mr-1" />
          重复
        </label>
        <div className="grid grid-cols-4 gap-2">
          {repeats.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRepeat(r)}
              className={`py-2.5 px-1.5 rounded-xl text-xs font-medium transition-colors ${
                repeat === r
                  ? 'bg-[#5856D6]/10 text-[#5856D6] border border-[#5856D6]/30'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {REPEAT_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-neutral-800">开启提醒</p>
            <p className="text-xs text-neutral-400">到达时间时发送通知</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setReminderEnabled(!reminderEnabled)}
          className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
            reminderEnabled ? 'bg-primary-500' : 'bg-neutral-300'
          }`}
        >
          <motion.div
            animate={{ x: reminderEnabled ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
          />
        </button>
      </div>
    </form>
  );

  // 底部按钮（共用）
  const ActionButtons = () => (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-3.5 rounded-2xl font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleSubmit}
        className="flex-1 py-3.5 rounded-2xl font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
      >
        {editTask ? '保存修改' : '创建任务'}
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* 桌面端：居中弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="hidden lg:block fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[60]"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-800">
                  {editTask ? '编辑任务' : '新建任务'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <FormContent />
              </div>
              <div className="p-6 border-t border-neutral-100">
                <ActionButtons />
              </div>
            </div>
          </motion.div>

          {/* 移动端：底部弹出 Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* 顶部拖动条 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
            </div>

            {/* 头部 */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-neutral-100 shrink-0">
              <h2 className="text-lg font-semibold text-neutral-800">
                {editTask ? '编辑任务' : '新建任务'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* 表单内容 - 可滚动 */}
            <div className="px-5 py-4 overflow-y-auto flex-1">
              <FormContent />
            </div>

            {/* 底部按钮 - 固定底部 */}
            <div className="px-5 pt-4 border-t border-neutral-100 shrink-0" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              <ActionButtons />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskFormModal;
