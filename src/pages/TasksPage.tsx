import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, Calendar, Clock, Flag, Repeat, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatTime, formatDate, formatRelativeTime } from '../utils/dateUtils';
import { CATEGORY_LABELS, PRIORITY_LABELS, REPEAT_LABELS } from '../types';
import type { TaskCategory, Task } from '../types';
import TaskFormModal from '../components/TaskFormModal';

const TasksPage = () => {
  const { tasks, toggleTaskComplete, deleteTask } = useAppStore();
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
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-green-400',
  };

  const priorityBgColors = {
    high: 'bg-red-50 text-red-600',
    medium: 'bg-amber-50 text-amber-600',
    low: 'bg-green-50 text-green-600',
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted).length;
  const completedTasks = filteredTasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-1">
            任务提醒
          </h1>
          <p className="text-sm text-neutral-500">
            {pendingTasks} 个待完成，{completedTasks} 个已完成
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建任务
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 gradient-primary rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{categoryLabels[cat]}</span>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-neutral-300" />
              </div>
              <p className="text-neutral-400 mb-4">暂无任务</p>
              <button
                onClick={handleAdd}
                className="text-primary-500 font-medium hover:text-primary-600"
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`bg-white rounded-2xl p-5 shadow-card card-hover relative overflow-hidden ${
                  task.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityColors[task.priority]}`}
                />
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      task.isCompleted
                        ? 'gradient-primary border-transparent'
                        : 'border-neutral-300 hover:border-primary-400'
                    }`}
                  >
                    {task.isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-lg mb-1 transition-all ${
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
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                        <Clock className="w-3 h-3" />
                        {formatTime(task.dueDate)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityBgColors[task.priority]}`}>
                        <Flag className="w-3 h-3" />
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.repeat !== 'none' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-mint/10 text-xs text-secondary-mint">
                          <Repeat className="w-3 h-3" />
                          {REPEAT_LABELS[task.repeat]}
                        </span>
                      )}
                      {task.reminderEnabled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-xs text-primary-500">
                          <Bell className="w-3 h-3" />
                          提醒
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
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
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        className="fixed right-8 bottom-8 w-14 h-14 rounded-full gradient-primary shadow-xl shadow-primary-500/40 flex items-center justify-center text-white z-40"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      <TaskFormModal isOpen={showForm} onClose={handleClose} editTask={editTask} />
    </div>
  );
};

export default TasksPage;
