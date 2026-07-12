import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-neutral-50 noise-overlay">
      <div className="fixed top-20 right-20 w-72 h-72 bg-primary-300 blob animate-float" style={{ animationDelay: '0s' }} />
      <div className="fixed bottom-20 left-80 w-96 h-96 bg-secondary-mint blob animate-float" style={{ animationDelay: '2s', opacity: 0.25 }} />
      <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-secondary-lavender blob animate-float" style={{ animationDelay: '4s', opacity: 0.2 }} />

      <Sidebar />

      <main className="lg:ml-64 min-h-screen relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;
