import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationsPage: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  if (!currentUser) return null;

  const myNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  const typeColors = {
    info: 'border-l-primary',
    success: 'border-l-success',
    warning: 'border-l-warning',
    error: 'border-l-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {myNotifs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          myNotifs.map((notif, i) => (
            <motion.div
              key={notif.id}
              className={`glass-card border-l-4 p-4 ${typeColors[notif.type]} ${!notif.read ? 'bg-primary/5' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${!notif.read ? 'font-medium' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(notif.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {!notif.read && (
                  <button onClick={() => markNotificationRead(notif.id)} className="shrink-0 rounded-full p-1 hover:bg-muted">
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
