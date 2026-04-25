import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface OnlineUser {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
}

export const useRealtimeCollaboration = (groupId: string, userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      query: { groupId, userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('users:update', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('activity:new', (activity: ActivityEvent) => {
      setActivities((prev) => [activity, ...prev].slice(0, 100));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [groupId, userId]);

  const emitActivity = useCallback(
    (action: string, data?: any) => {
      if (socket && isConnected) {
        socket.emit('activity:create', {
          action,
          data,
          timestamp: new Date(),
        });
      }
    },
    [socket, isConnected]
  );

  const updateUserStatus = useCallback(
    (status: 'online' | 'away' | 'offline') => {
      if (socket && isConnected) {
        socket.emit('user:status', { status });
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    onlineUsers,
    activities,
    isConnected,
    emitActivity,
    updateUserStatus,
  };
};
