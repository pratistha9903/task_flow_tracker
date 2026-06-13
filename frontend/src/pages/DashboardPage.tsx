import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />;
}
