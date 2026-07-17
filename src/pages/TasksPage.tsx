import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, Calendar, Clock, Flag, Repeat, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { formatTime, formatDate, formatRelativeTime } from '../utils/dateUtils';
import { CATEGORY_LABELS, PRIORITY_LABELS, REPEAT_LABELS } from '../types';
import type { TaskCategory, Task } from '../types';
import TaskFormModal from '../components/TaskFormModal';

const TasksPage = () => {
  const { tasks, toggleTaskComplete, deleteTask } = useAppStore();
  const { addToast } = useToastStore();
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const categories: (TaskCategory | 'all')[] = ['all', 'work', 'life', 'study', 'other'];
  const categoryLabels = { all: '全部', ...CATEGORY_LABELS };

  const filteredTasks = tasks
    .filter((task) => activeCategory === 'all' || task.category === activeCategory)
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const priorityColors = {
    high: 'bg-[#FF3B30]',
    medium: 'bg-[#FF9500]',
    low: 'bg-[#34C759]',
  };

  const priorityBgColors = {
    high: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    medium: 'bg-[#FF9500]/10 text-[#FF9500]',
    low: 'bg-[#34C759]/10 text-[#34C759]',
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditTask(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(null);
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

  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted).length;
  const completedTasks = filteredTasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* 标题区 - 苹果大标题 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight mb-1">
            任务提醒
          </h1>
          <p className="text-[15px] text-neutral-500">
            {pendingTasks} 个待完成 · {completedTasks} 个已完成
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建
        </button>
      </div>

      {/* 分类标签 - 苹果 Segmented Control 风格 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200/60 hover:bg-neutral-50'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-neutral-200/60"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-neutral-400 mb-4 text-sm">暂无任务</p>
              <button
                onClick={handleAdd}
                className="text-primary-500 font-medium text-sm hover:text-primary-600"
              >
                创建第一个任务
              </button>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/60 card-hover relative overflow-hidden ${
                  task.isCompleted ? 'opacity-50' : ''
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColors[task.priority]}`}
                />
                <div className="flex items-start gap-3 sm:gap-4">
                  <button
                    onClick={() => {
  toggleTaskComplete(task.id);
  const action = task.isCompleted ? '标记为未完成' : '已完成';
  addToast({ type: task.isCompleted ? 'info' : 'success', message: `「${task.title}」${action}` });
}}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      task.isCompleted
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-neutral-300 hover:border-primary-400'
                    }`}
                  >
                    {task.isCompleted && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-[15px] mb-1 transition-all ${
                        task.isCompleted
                          ? 'text-neutral-400 line-through'
                          : 'text-neutral-800'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-neutral-600">
                        <Clock className="w-3 h-3" />
                        {formatTime(task.dueDate)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-neutral-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${priorityBgColors[task.priority]}`}>
                        <Flag className="w-3 h-3" />
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.repeat !== 'none' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#5856D6]/10 text-xs text-[#5856D6]">
                          <Repeat className="w-3 h-3" />
                          {REPEAT_LABELS[task.repeat]}
                        </span>
                      )}
                      {task.reminderEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-xs text-primary-500">
                          <Bell className="w-3 h-3" />
                          提醒
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-neutral-600">
                        {CATEGORY_LABELS[task.category]}
                      </span>
                    </div>
                    {!task.isCompleted && (
                      <p className="text-xs text-neutral-400 mt-2">
                        {formatRelativeTime(task.dueDate)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-primary-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
  deleteTask(task.id);
  addToast({ type: 'warning', message: `已删除「${task.title}」` });
}}
                      className="p-2 rounded-lg hover:bg-[#FF3B30]/10 text-neutral-400 hover:text-[#FF3B30] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* 移动端浮动按钮 */}
      <button
        onClick={handleAdd}
        className="lg:hidden fixed right-4 bottom-28 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white z-[60] shadow-lg shadow-primary-500/30 hover:bg-primary-600 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TaskFormModal isOpen={showForm} onClose={handleClose} editTask={editTask} />
    </div>
  );
};

export default TasksPage;
