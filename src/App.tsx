import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { selectAuth } from './auth/AuthSlice';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Home/HomePage';
import LoginForm from './pages/Login/Login';
import Register from './pages/Register/Register';
import { logoutAction } from './Actions/AuthActions';
import { useEffect, useState } from 'react';
import { flushMessages } from './components/ChatBox/chatSlice';
import ChatPage from './components/ChatBox/ChatBox';

const Subscription = () => {
  async function subscribeToNotifications() {
    try {
      const serviceWorker = await navigator.serviceWorker.ready;
      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          'BPDeVcdfBBCjjKYMwhbF_5zDQgebQzujW2KOJgdhPu2aswKRCxMMv9EOlmyJwi_0TDkvAZz1Yx8IIjzTi6T0Tr8',
      });

      await fetch('http://localhost:5000/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Subscription successful');
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  }

  return (
    <div>
      <button className="" onClick={subscribeToNotifications}>
        Subscribe to Notifications
      </button>
    </div>
  );
};

const App: React.FC = (props: any) => {
  const { isAuthenticated } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(0);
  const [isFlushMessagesOn, setIsFlushMessagesOn] = useState(true);

  const flushInterval = 20;

  useEffect(() => {
    if (isFlushMessagesOn) {
      const intervalId = setInterval(() => {
        if (timer === flushInterval) {
          dispatch(flushMessages());
          setTimer(0);
        } else {
          setTimer((prevState) => prevState + 1);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timer, flushInterval]);

  console.log('isAuthenticated', isAuthenticated);
  return (
    <div className="h-screen relative">
      <Toaster position="top-right" reverseOrder={true} />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="/about" element={<h1>About</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </div>
  );
};

export default App;
