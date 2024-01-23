import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { Socket, io } from 'socket.io-client';
import { selectAuth } from '../auth/AuthSlice';

interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

const SERVER_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userState = useSelector(selectAuth);

  useEffect(() => {
    if (userState?.isAuthenticated) {
      const _socket = io(SERVER_URL, {
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket'], // Specify transports if needed
      });

      _socket.on('connect', () => {
        console.log('Connected to the socket server');
      });

      _socket.on('disconnect', () => {
        console.log('Disconnected from the socket server');
      });

      setSocket(_socket);

      return () => {
        _socket.disconnect(); // Disconnect the socket when component unmounts
      };
    }
  }, [userState?.isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
