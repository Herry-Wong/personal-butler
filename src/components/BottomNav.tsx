import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/tasks', label: '任务', icon: CheckSquare },
  { path: '/health', label: '健康', icon: Heart },
  { path: '/assistant', label: 'AI', icon: MessageCircle },
];

const BottomNav = () => {
  const location = useLocation();
  const { showBottomNav } = useAppStore();

  if (!showBottomNav) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-neutral-200/60 flex items-center justify-around px-2 z-50"
      style={{
        paddingTop: '0.5rem',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
          >
            <Icon
              className={`w-6 h-6 transition-colors ${
                isActive ? 'text-primary-500' : 'text-neutral-400'
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary-500' : 'text-neutral-400'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
