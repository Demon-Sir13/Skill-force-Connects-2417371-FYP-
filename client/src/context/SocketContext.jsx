import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export const SocketProvider = ({ children, token, userId }) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!token || !userId) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setOnlineUsers(new Set());
      setUnreadCounts({});
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('userOnline', (uid) => {
      setOnlineUsers(prev => new Set([...prev, uid]));
    });

    socket.on('userOffline', (uid) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    });

    socket.on('newMessage', (msg) => {
      const senderId = msg.senderId?.toString?.() ?? msg.senderId;
      // Only increment unread if message is from someone else
      if (senderId !== userId) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, userId]);

  const markRead = useCallback((partnerId) => {
    setUnreadCounts(prev => {
      const next = { ...prev };
      delete next[partnerId];
      return next;
    });
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      onlineUsers,
      unreadCounts,
      totalUnread,
      markRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
