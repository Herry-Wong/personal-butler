import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Key, ExternalLink, Check, Eye, EyeOff, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface Props {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: Props) => {
  const { settings, updateSettings, setShowBottomNav } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.deepseekApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setShowBottomNav(false);
    return () => setShowBottomNav(true);
  }, [setShowBottomNav]);

  const handleSave = () => {
    updateSettings({ deepseekApiKey: apiKey.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  // 内容（共用）
  const Content = () => (
    <div className="space-y-5">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
          <Key className="w-4 h-4" />
          DeepSeek API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-base font-mono"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            type="button"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <a
          href="https://platform.deepseek.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-primary-500 hover:text-primary-600"
        >
          去 DeepSeek 获取 API Key
          <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-xs text-neutral-400 mt-2">
          Key 只存在你本地浏览器，不会上传服务器。新用户有免费额度。
        </p>
      </div>
    </div>
  );

  // 底部按钮
  const ActionButtons = () => (
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleSave}
        className="flex-1 py-3.5 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            已保存
          </>
        ) : (
          '保存'
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
          className="hidden lg:block w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-neutral-800 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">设置</h2>
                  <p className="text-xs text-neutral-500">配置 AI 功能的 API Key</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-6">
              <Content />
            </div>
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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部拖动条 */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
        </div>

        {/* 头部 */}
        <div className="px-5 pb-4 flex items-center justify-between border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-800">设置</h2>
              <p className="text-xs text-neutral-500">配置 API Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 内容 - 可滚动 */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          <Content />
        </div>

        {/* 底部按钮 - 固定在底部，适配 iPhone 安全区域 */}
        <div
          className="px-5 pt-4 border-t border-neutral-100 shrink-0"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <ActionButtons />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
