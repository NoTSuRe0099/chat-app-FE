import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import ChatPage from './components/ChatBox/ChatBox';
import { flushMessages } from './components/ChatBox/chatSlice';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './pages/Login/Login';
import Register from './pages/Register/Register';
import { selectUIState } from './reducers/UISlice';
import Loader from './components/Shared/loader';

const App: React.FC = (props: any) => {
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(0);
  const [isFlushMessagesOn, setIsFlushMessagesOn] = useState(false);
  const { isLoading } = useSelector(selectUIState);

  const flushInterval = 120; // 40 sec

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

  return (
    <div className="h-screen relative">
      {isLoading && (
        <Loader />
      )}
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
          path="/chat/:chatType/:id"
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
