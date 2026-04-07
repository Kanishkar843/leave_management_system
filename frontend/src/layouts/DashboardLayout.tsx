import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard, FileText, Users, ClipboardList, Bell, LogOut, Moon, Sun, Menu, X, ChevronRight,
} from 'lucide-react';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';

const roleLabels: Record<Role, string> = {
  principal: 'Principal',
  hod: 'Head of Department',
  faculty: 'Faculty',
  student: 'Student',
};

const getNavItems = (role: Role) => {
  const items = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Leaves', icon: FileText, path: '/leaves' },
  ];
  if (role !== 'student') {
    items.push({ label: 'Members', icon: Users, path: '/members' });
    items.push({ label: 'Approvals', icon: ClipboardList, path: '/approvals' });
  }
  items.push({ label: 'Audit Log', icon: ClipboardList, path: '/audit' });
  return items;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, logout, darkMode, toggleDarkMode, notifications } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const navItems = getNavItems(currentUser.role);
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card glass-sidebar lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-heading text-lg font-bold gradient-text">LeaveFlow</h2>
            <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && (
                  <motion.div layoutId="activeNav" className="ml-auto">
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="glass-card mb-3 p-3">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground">{currentUser.department}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-heading text-lg font-semibold">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
