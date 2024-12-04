import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { Socket, io } from 'socket.io-client';
import { AuthState, selectAuth } from '../auth/AuthSlice';
import { store } from '../store';

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

export const SocketProvider: React.FC<{ children: ReactNode; }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const authState: AuthState = store?.getState()?.authState;
  const userState: AuthState = useSelector(selectAuth);

  useEffect(() => {
    if (userState?.isAuthenticated || authState?.isAuthenticated) {
      const token = userState?.access_token || authState?.access_token || '';
      const _socket = io(SERVER_URL, {
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket'], // Specify transports if needed
        auth: {
          access_token: token
        }
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
  }, [userState, authState]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
