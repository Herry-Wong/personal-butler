import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Heart,
  MessageCircle,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/tasks', label: '任务提醒', icon: CheckSquare },
  { path: '/health', label: '健康管家', icon: Heart },
  { path: '/assistant', label: 'AI助手', icon: MessageCircle },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-neutral-200/50 flex flex-col z-50">
      <div className="p-6 border-b border-neutral-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-neutral-800">
              个人管家
            </h1>
            <p className="text-xs text-neutral-400">AI 智能助手</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 gradient-primary rounded-xl shadow-lg shadow-primary-500/25"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary-500'
                }`}
              />
              <span
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-white' : 'text-neutral-700 group-hover:text-primary-600'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span>设置</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
