import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Dumbbell,
  Video,
  Link2,
  Trash2,
  CheckCircle2,
  Calendar,
  Target,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { HealthPlan, ExerciseAction } from '../types';

interface Props {
  plan: HealthPlan;
}

const HealthPlanDetail = ({ plan }: Props) => {
  const { updateExerciseAction, deleteHealthPlan, addTask, updateHealthPlan } = useAppStore();
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [addedToTasks, setAddedToTasks] = useState(false);

  // 获取动作 by id
  const getAction = (id: string) => plan.actions.find((a) => a.id === id);

  // 保存视频链接
  const handleSaveVideo = (actionId: string) => {
    if (!videoUrlInput.trim()) return;
    updateExerciseAction(plan.id, actionId, { videoUrl: videoUrlInput.trim() });
    setVideoUrlInput('');
    setEditingActionId(null);
  };

  // 删除视频链接
  const handleRemoveVideo = (actionId: string) => {
    updateExerciseAction(plan.id, actionId, { videoUrl: undefined });
  };

  // 一键将计划写入每日提醒任务
  const handleAddToTasks = () => {
    const today = new Date();

    plan.dailySchedule.forEach((schedule) => {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const dueDate = new Date(today);
      dueDate.setHours(hours, minutes, 0, 0);

      const actionNames = schedule.actionIds
        .map((id) => getAction(id)?.name)
        .filter(Boolean)
        .join(' + ');

      const actionDetails = schedule.actionIds
        .map((id) => {
          const a = getAction(id);
          if (!a) return '';
          const sets = `${a.sets}组×${a.reps || `${a.duration}秒`}`;
          return `${a.name} ${sets}`;
        })
        .filter(Boolean)
        .join('\n');

      addTask({
        title: `锻炼：${actionNames}`,
        description: actionDetails,
        category: 'life',
        priority: 'high',
        dueDate: dueDate.toISOString(),
        isCompleted: false,
        repeat: 'daily',
        reminderEnabled: true,
      });
    });

    setAddedToTasks(true);
    setTimeout(() => setAddedToTasks(false), 3000);
  };

  // 归档计划
  const handleArchive = () => {
    if (confirm('确定要归档这个计划吗？归档后可在历史记录中查看。')) {
      updateHealthPlan(plan.id, { status: 'archived' });
    }
  };

  // 删除计划
  const handleDelete = () => {
    if (confirm('确定要删除这个计划吗？此操作不可撤销。')) {
      deleteHealthPlan(plan.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* 计划头部信息 */}
      <div className="bg-neutral-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium opacity-60">AI 生成计划</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
            <p className="text-sm opacity-60 leading-relaxed">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>第 {plan.currentWeek} / {plan.weekCount} 周</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" />
            <span>{plan.actions.length} 个动作</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{plan.dailySchedule.length} 个时间点</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs opacity-50 mb-1">针对问题</p>
          <p className="text-sm font-medium">{plan.problem}</p>
        </div>
      </div>

      {/* 一键写入任务按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToTasks}
          className={`flex-1 py-3.5 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2 ${
            addedToTasks
              ? 'bg-[#34C759] text-white'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {addedToTasks ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              已写入每日提醒！
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              一键写入每日提醒任务
            </>
          )}
        </button>
        <button
          onClick={handleArchive}
          className="px-4 py-3.5 rounded-2xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          title="归档计划"
        >
          归档
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-3.5 rounded-2xl border border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
          title="删除计划"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 每日时间安排 */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/60">
        <h4 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-500" />
          每日时间安排
        </h4>
        <div className="space-y-2">
          {plan.dailySchedule.map((schedule, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-lg font-semibold text-primary-500">{schedule.time}</div>
              </div>
              <div className="flex-1 space-y-1">
                {schedule.actionIds.map((actionId) => {
                  const action = getAction(actionId);
                  if (!action) return null;
                  return (
                    <div key={actionId} className="text-sm text-neutral-700">
                      • {action.name}{' '}
                      <span className="text-neutral-400">
                        ({action.sets}组×{action.reps || `${action.duration}秒`})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 动作详情列表 */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/60">
        <h4 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary-500" />
          动作详情
        </h4>
        <div className="space-y-4">
          {plan.actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isEditing={editingActionId === action.id}
              videoUrlInput={videoUrlInput}
              onEditVideo={() => {
                setEditingActionId(action.id);
                setVideoUrlInput(action.videoUrl || '');
              }}
              onCancelEdit={() => {
                setEditingActionId(null);
                setVideoUrlInput('');
              }}
              onVideoUrlChange={setVideoUrlInput}
              onSaveVideo={() => handleSaveVideo(action.id)}
              onRemoveVideo={() => handleRemoveVideo(action.id)}
            />
          ))}
        </div>
      </div>

      {/* 提示 */}
      <div className="flex items-start gap-2 p-4 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">使用提示</p>
          <ul className="text-xs space-y-1 opacity-90">
            <li>• 点击"一键写入每日提醒任务"会把锻炼安排加入任务列表并开启提醒</li>
            <li>• 可以给每个动作添加视频链接（抖音、B站、YouTube 等均可）</li>
            <li>• 坚持记录，2 周后回顾效果，必要时重新生成新计划</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// 动作卡片子组件
interface ActionCardProps {
  action: ExerciseAction;
  isEditing: boolean;
  videoUrlInput: string;
  onEditVideo: () => void;
  onCancelEdit: () => void;
  onVideoUrlChange: (v: string) => void;
  onSaveVideo: () => void;
  onRemoveVideo: () => void;
}

const ActionCard = ({
  action,
  isEditing,
  videoUrlInput,
  onEditVideo,
  onCancelEdit,
  onVideoUrlChange,
  onSaveVideo,
  onRemoveVideo,
}: ActionCardProps) => {
  return (
    <div className="p-4 rounded-xl border border-neutral-200/60 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-semibold text-neutral-800">{action.name}</h5>
          <p className="text-xs text-neutral-500 mt-0.5">
            {action.sets} 组 × {action.reps ? `${action.reps} 次` : `${action.duration} 秒`}
          </p>
        </div>
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed mb-2">{action.description}</p>

      {action.notes && (
        <p className="text-xs text-[#FF9500] bg-[#FF9500]/10 rounded-lg p-2 mb-2">
          {action.notes}
        </p>
      )}

      {/* 视频链接区域 */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrlInput}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              placeholder="粘贴视频链接..."
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              autoFocus
            />
            <button
              onClick={onSaveVideo}
              className="px-3 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600"
            >
              保存
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-500 text-sm"
            >
              取消
            </button>
          </div>
        ) : action.videoUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={action.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] text-sm hover:bg-[#FF3B30]/20 transition-colors"
            >
              <Video className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{action.videoUrl}</span>
            </a>
            <button
              onClick={onEditVideo}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              title="修改视频"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRemoveVideo}
              className="p-2 rounded-lg text-[#FF3B30] hover:bg-[#FF3B30]/10"
              title="删除视频"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEditVideo}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary-500 transition-colors"
          >
            <Video className="w-4 h-4" />
            添加视频链接
          </button>
        )}
      </div>
    </div>
  );
};

export default HealthPlanDetail;
