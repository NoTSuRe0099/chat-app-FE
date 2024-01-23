// ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuth } from '../../auth/AuthSlice';

const ProtectedRoute = ({ children }: any) => {
  const { isAuthenticated } = useSelector(selectAuth);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
