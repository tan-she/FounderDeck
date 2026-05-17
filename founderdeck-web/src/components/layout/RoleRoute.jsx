import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function RoleRoute({ children, allowedRole }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // Redirect to their actual dashboard
    if (user.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'entrepreneur') return <Navigate to="/dashboard/entrepreneur" replace />;
    return <Navigate to="/dashboard/investor" replace />;
  }

  return children;
}
