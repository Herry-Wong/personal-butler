import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Heart,
  MessageCircle,
  Settings,
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
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white/72 backdrop-blur-xl border-r border-neutral-200/60 flex-col z-50">
      <div className="px-6 py-7">
        <h1 className="text-xl font-semibold text-neutral-800 tracking-tight">
          个人管家
        </h1>
        <p className="text-xs text-neutral-400 mt-1">智能生活助手</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-200/60">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[15px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span>设置</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
