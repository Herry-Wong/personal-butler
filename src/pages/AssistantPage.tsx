import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Plus,
  Droplets,
  CheckSquare,
  Heart,
  Trash2,
  Bot,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatTime } from '../utils/dateUtils';

const AssistantPage = () => {
  const navigate = useNavigate();
  const { chatMessages, addChatMessage, clearChatMessages, addTask } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const quickActions = [
    { icon: Plus, label: '创建任务', text: '帮我创建一个明天下午3点的会议任务', color: 'from-primary-400 to-primary-600' },
    { icon: Droplets, label: '健康建议', text: '给我一些保持健康的建议', color: 'from-blue-400 to-cyan-400' },
    { icon: CheckSquare, label: '今日任务', text: '我今天有哪些任务？', color: 'from-green-400 to-teal-400' },
    { icon: Heart, label: '运动计划', text: '帮我制定一个本周运动计划', color: 'from-orange-400 to-red-400' },
  ];

  const generateResponse = (message: string): string => {
    const msg = message.toLowerCase();

    if (msg.includes('任务') || msg.includes('todo') || msg.includes('待办')) {
      if (msg.includes('今天') || msg.includes('今日')) {
        const { getTodayTasks } = useAppStore.getState();
        const todayTasks = getTodayTasks();
        const pending = todayTasks.filter((t) => !t.isCompleted);
        if (pending.length === 0) {
          return '恭喜你！今天的任务都完成啦，享受一下悠闲时光吧 ✨';
        }
        return `你今天还有 ${pending.length} 个待办任务：\n\n${pending.map((t, i) => `${i + 1}. ${t.title}（${formatTime(t.dueDate)}）`).join('\n')}\n\n加油，完成它们你就自由了！💪`;
      }
      if (msg.includes('创建') || msg.includes('添加') || msg.includes('新建')) {
        return '好的！我来帮你创建任务。请告诉我：\n\n1. 任务标题是什么？\n2. 什么时候截止？\n3. 需要设置提醒吗？\n\n或者你可以直接去任务页面创建，那里有更多选项哦～';
      }
      return '我可以帮你管理任务哦！你可以问我：\n- "我今天有哪些任务？"\n- "帮我创建一个任务"\n- "明天有什么安排？"\n\n或者直接点击下方快捷指令开始吧～';
    }

    if (msg.includes('健康') || msg.includes('喝水') || msg.includes('饮水') || msg.includes('运动') || msg.includes('睡眠')) {
      if (msg.includes('建议') || msg.includes('建议')) {
        return '以下是一些保持健康的小建议：\n\n🥤 **饮水**：每天至少喝2000ml水，早上起床先喝一杯温水\n\n🏃 **运动**：每周至少运动3次，每次30分钟以上\n\n😴 **睡眠**：保持规律作息，晚上11点前入睡\n\n🥗 **饮食**：多吃蔬菜水果，少吃油腻食物\n\n🧘 **心态**：保持愉快心情，适当放松\n\n需要我帮你记录健康数据吗？可以去健康管家页面看看～';
      }
      if (msg.includes('运动') || msg.includes('锻炼') || msg.includes('健身')) {
        return '好的！为你推荐本周运动计划：\n\n**周一**：有氧运动30分钟（跑步/骑车）\n**周二**：力量训练（上肢）\n**周三**：休息日或瑜伽拉伸\n**周四**：有氧运动30分钟\n**周五**：力量训练（下肢）\n**周六**：户外运动（爬山/游泳）\n**周日**：充分休息\n\n记得循序渐进，贵在坚持！💪';
      }
      return '我是你的健康管家！可以帮你：\n- 记录饮水量\n- 记录运动时长\n- 记录睡眠情况\n- 记录体重变化\n\n去健康管家页面查看详细数据吧～';
    }

    if (msg.includes('你好') || msg.includes('hello') || msg.includes('hi') || msg.includes('嗨')) {
      return '你好呀！👋 我是你的个人AI管家。\n\n我可以帮你：\n📝 管理任务和提醒\n💧 记录健康数据\n💡 提供生活建议\n\n有什么我可以帮你的吗？';
    }

    if (msg.includes('谢谢') || msg.includes('感谢')) {
      return '不客气～能帮到你我很开心！😊\n\n如果还有其他需要，随时告诉我哦～';
    }

    if (msg.includes('你是谁') || msg.includes('介绍')) {
      return '我是你的个人AI管家助手！🤖\n\n我可以帮你管理日常生活的方方面面：\n\n• **任务管理** - 创建、查看、提醒任务\n• **健康记录** - 记录饮水、运动、睡眠、体重\n• **智能建议** - 提供个性化健康建议\n• **日程安排** - 帮你规划时间\n\n点击下方快捷指令开始体验吧～';
    }

    return '我理解你的问题了！让我想想...🤔\n\n作为你的个人AI管家，我目前可以帮你：\n\n📋 **任务管理** - 创建和管理待办事项\n💪 **健康追踪** - 记录运动、饮水、睡眠等\n💡 **生活建议** - 提供健康和效率建议\n\n你可以尝试问我：\n- "我今天有什么任务？"\n- "给我一些健康建议"\n- "帮我创建一个任务"\n\n或者点击下方的快捷指令试试看～';
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addChatMessage({ role: 'user', content: userMessage });
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMessage);
      addChatMessage({ role: 'assistant', content: response });
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-1">
          AI 助手
        </h1>
        <p className="text-sm text-neutral-500">
          智能对话，帮你管理日常生活
        </p>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'gradient-primary'
                        : 'gradient-lavender'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'gradient-primary text-white rounded-tr-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-white/70' : 'text-neutral-400'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full gradient-lavender flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-neutral-100 rounded-tl-sm">
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-neutral-400"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-neutral-400"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chatMessages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-neutral-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              快捷指令
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action.text)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 truncate">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-end gap-3">
            <button
              onClick={clearChatMessages}
              className="p-3 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="清空对话"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-all ${
                inputValue.trim()
                  ? 'gradient-primary text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
