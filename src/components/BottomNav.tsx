import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Heart,
  MessageCircle,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/tasks', label: '任务提醒', icon: CheckSquare },
  { path: '/health', label: '健康管家', icon: Heart },
  { path: '/assistant', label: 'AI助手', icon: MessageCircle },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-200/50 flex items-center justify-around px-2 py-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300"
          >
            {isActive && (
              <motion.div
                layoutId="activeBottomNav"
                className="absolute inset-0 gradient-primary rounded-xl opacity-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-primary-500' : 'text-neutral-400'
                }`}
              />
            </motion.div>
            <span
              className={`text-xs font-medium transition-colors ${
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
