'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  unreadCount: 0,
  setUnreadCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const socketUrl = apiUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket notifications connecté');
      newSocket.emit('register', session.user.id);
    });

    // Écouter les nouvelles notifications
    newSocket.on('newNotification', (notification) => {
      console.log('🔔 Nouvelle notification:', notification);
      setUnreadCount((prev) => prev + 1);
      
      // Invalider les queries pour refresh auto
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Notification navigateur (optionnel)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
        });
      }
    });

    // Écouter les nouveaux messages
    newSocket.on('newMessage', (message) => {
      console.log('💬 Nouveau message:', message);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session?.user?.id, queryClient]);

  return (
    <NotificationContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

