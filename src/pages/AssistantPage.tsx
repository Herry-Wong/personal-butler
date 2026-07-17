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
  AlertCircle,
  Settings,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { formatTime } from '../utils/dateUtils';
import { chatWithAI, buildAssistantMessages, parseToolCalls, createToolExecutor } from '../services/deepseek';
import type { ToolResult } from '../services/deepseek';
import type { Task, HealthRecord } from '../types';

const AssistantPage = () => {
  const {
    chatMessages, addChatMessage, clearChatMessages, settings,
    tasks, addTask, updateTask, deleteTask,
    healthRecords, addHealthRecord,
  } = useAppStore();
  const { addToast } = useToastStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping, error]);

  const quickActions = [
    { icon: Plus, label: '创建任务', text: '帮我创建一个明天下午3点的会议任务', color: '#0071E3' },
    { icon: Droplets, label: '健康建议', text: '给我一些保持健康的建议', color: '#007AFF' },
    { icon: CheckSquare, label: '今日任务', text: '我今天有哪些任务？', color: '#34C759' },
    { icon: Heart, label: '运动计划', text: '帮我制定一个本周运动计划', color: '#FF9500' },
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addChatMessage({ role: 'user', content: userMessage });
    setInputValue('');
    setError(null);
    setIsTyping(true);

    if (!settings.deepseekApiKey) {
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: '⚠️ 请先在设置中配置 DeepSeek API Key，才能使用 AI 对话功能哦～\n\n点击右上角设置图标，填入你的 API Key 即可。',
        });
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      const messages = buildAssistantMessages(chatMessages, userMessage);
      const response = await chatWithAI({
        messages,
        apiKey: settings.deepseekApiKey,
      });

      // 解析工具调用
      const { text, toolCalls } = parseToolCalls(response);

      if (toolCalls.length > 0) {
        // 创建工具执行器
        const executor = createToolExecutor(
          () => tasks,
          (task) => addTask(task as unknown as Omit<Task, 'id' | 'createdAt'>),
          (id, updates) => updateTask(id, updates as Partial<Task>),
          deleteTask,
          (record) => addHealthRecord(record as unknown as Omit<HealthRecord, 'id' | 'createdAt'>),
          () => healthRecords,
        );

        // 执行工具调用
        const results: ToolResult[] = toolCalls.map((tc) => executor(tc));

        // 弹出通知
        results.forEach((r) => {
          addToast({ type: r.success ? 'success' : 'error', message: r.message });
        });

        // 构建最终回复
        let finalContent = text;
        if (finalContent) {
          finalContent += '\n\n';
        }
        finalContent += results
          .map((r) => (r.success ? `✅ ${r.message}` : `❌ ${r.message}`))
          .join('\n');

        addChatMessage({ role: 'assistant', content: finalContent });
      } else {
        addChatMessage({ role: 'assistant', content: text || response });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '请求失败，请重试';
      setError(errorMsg);
      addChatMessage({
        role: 'assistant',
        content: `抱歉，出了点问题：${errorMsg}\n\n请检查 API Key 是否正确，或稍后再试。`,
      });
    } finally {
      setIsTyping(false);
    }
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
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-3rem)] flex flex-col">
      {/* 标题 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight mb-1">
            AI 助手
          </h1>
          <p className="text-[15px] text-neutral-500">
            智能对话，帮你管理日常生活
          </p>
        </div>
        {!settings.deepseekApiKey && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl text-xs text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span>未配置 API Key</span>
          </div>
        )}
      </div>

      {/* 对话区 */}
      <div className="flex-1 bg-white rounded-2xl border border-neutral-200/60 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2.5 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary-500'
                        : 'bg-neutral-800'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-md'
                    }`}
                  >
                    <p className="text-[15px] whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        message.role === 'user' ? 'text-white/60' : 'text-neutral-400'
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-neutral-100 rounded-tl-md">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay) => (
                      <motion.span
                        key={delay}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay }}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 快捷指令 */}
        {chatMessages.length <= 1 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-neutral-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              快捷指令
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: action.color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 truncate">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="p-4 border-t border-neutral-100">
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 rounded-xl text-xs text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={clearChatMessages}
              className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="清空对话"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={settings.deepseekApiKey ? '输入消息...' : '请先配置 API Key'}
                rows={1}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 text-[15px] focus:bg-white focus:ring-2 focus:ring-neutral-200 outline-none transition-all resize-none placeholder:text-neutral-400"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={`p-2.5 rounded-xl transition-colors ${
                inputValue.trim() && !isTyping
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
