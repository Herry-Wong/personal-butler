import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ToastContainer from './Toast';

const Layout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <ToastContainer />

      <main
        className="lg:ml-64 min-h-screen relative z-10 lg:pb-0"
        style={{
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-4 sm:p-5 lg:px-8 lg:py-6 max-w-5xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;
