'use client';

import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  data?: any;
}

interface RealtimeCollaborationProps {
  groupId: string;
  userId: string;
  userName: string;
}

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  groupId,
  userId,
  userName,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      query: { groupId, userId, userName },
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
    });

    newSocket.on('users:online', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('activity:update', (event: ActivityEvent) => {
      setActivityFeed((prev) => [event, ...prev].slice(0, 50));
      setNotifications((prev) => [...prev, event.action].slice(-5));
    });

    newSocket.on('user:joined', (user: OnlineUser) => {
      setOnlineUsers((prev) => [...prev, user]);
      setNotifications((prev) => [...prev, `${user.name} joined`].slice(-5));
    });

    newSocket.on('user:left', (userId: string) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [groupId, userId, userName]);

  const emitActivity = (action: string, data?: any) => {
    if (socket) {
      socket.emit('activity:emit', {
        action,
        data,
        timestamp: new Date(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <OnlinePresenceIndicator users={onlineUsers} />
      <LiveActivityFeed activities={activityFeed} />
      <NotificationCenter notifications={notifications} />
    </div>
  );
};

// Online presence indicator
export const OnlinePresenceIndicator: React.FC<{ users: OnlineUser[] }> = ({ users }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-lg shadow p-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <Users size={18} />
      <h3 className="font-semibold">Online Now ({users.length})</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {users.map((user) => (
        <motion.div
          key={user.id}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded-full text-sm"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              user.status === 'online'
                ? 'bg-green-500'
                : user.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
            }`}
          />
          <span>{user.name}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Live activity feed
export const LiveActivityFeed: React.FC<{ activities: ActivityEvent[] }> = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-lg shadow p-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <Zap size={18} className="text-yellow-500" />
      <h3 className="font-semibold">Live Activity</h3>
    </div>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
          >
            <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.userName}</span>
                <span className="text-gray-600 dark:text-gray-400"> {activity.action}</span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

// Notification center
export const NotificationCenter: React.FC<{ notifications: string[] }> = ({ notifications }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed bottom-4 right-4 space-y-2 max-w-xs"
  >
    {notifications.map((notif, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
      >
        {notif}
      </motion.div>
    ))}
  </motion.div>
);

// Real-time cursor position (for collaborative editing)
export const CollaborativeCursor: React.FC<{
  x: number;
  y: number;
  userName: string;
  color: string;
}> = ({ x, y, userName, color }) => (
  <motion.div
    animate={{ x, y }}
    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    className="fixed pointer-events-none"
    style={{ left: x, top: y }}
  >
    <div className={`w-4 h-4 rounded-full ${color} shadow-lg`} />
    <div className="text-xs font-semibold text-white bg-gray-900 px-2 py-1 rounded mt-1 whitespace-nowrap">
      {userName}
    </div>
  </motion.div>
);
