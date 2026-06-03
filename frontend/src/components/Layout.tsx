import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Outlet />;

  return (
    <div className="layout">
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
