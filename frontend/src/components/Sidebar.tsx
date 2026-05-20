import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Users, 
  ClipboardList, 
  Activity, 
  Utensils, 
  FileText, 
  TrendingUp, 
  Settings,
  LogOut,
  X
} from 'lucide-react';
import './Sidebar.css';

// Definición de módulos por rol
const MENU_ADMIN = [
  { section: 'Principal',      items: [{ label: 'Dashboard',        path: '/dashboard',  icon: <LayoutDashboard size={18} /> }] },
  { section: 'Usuarios',       items: [{ label: 'Coaches',          path: '/coaches',    icon: <Dumbbell size={18} /> },
                                        { label: 'Clientes',         path: '/clients',    icon: <Users size={18} /> }] },
  { section: 'Entrenamiento',  items: [{ label: 'Rutinas',          path: '/routines',   icon: <ClipboardList size={18} /> },
                                        { label: 'Ejercicios',       path: '/exercises',  icon: <Activity size={18} /> }] },
  { section: 'Nutrición',      items: [{ label: 'Alimentos',        path: '/foods',      icon: <Utensils size={18} /> },
                                        { label: 'Registro comidas', path: '/food-log',   icon: <FileText size={18} /> }] },
  { section: 'Seguimiento',    items: [{ label: 'Progreso',         path: '/progress',   icon: <TrendingUp size={18} /> }] },
  { section: 'Sistema',        items: [{ label: 'Configuración',    path: '/settings',   icon: <Settings size={18} /> }] },
];

const MENU_COACH = [
  { section: 'Principal',      items: [{ label: 'Dashboard',        path: '/dashboard',  icon: <LayoutDashboard size={18} /> }] },
  { section: 'Mis Clientes',   items: [{ label: 'Clientes',         path: '/clients',    icon: <Users size={18} /> }] },
  { section: 'Entrenamiento',  items: [{ label: 'Rutinas',          path: '/routines',   icon: <ClipboardList size={18} /> },
                                        { label: 'Ejercicios',       path: '/exercises',  icon: <Activity size={18} /> }] },
  { section: 'Nutrición',      items: [{ label: 'Alimentos',        path: '/foods',      icon: <Utensils size={18} /> }] },
  { section: 'Seguimiento',    items: [{ label: 'Progreso',         path: '/progress',   icon: <TrendingUp size={18} /> }] },
];

const MENU_CLIENT = [
  { section: 'Principal',      items: [{ label: 'Dashboard',        path: '/dashboard',  icon: <LayoutDashboard size={18} /> }] },
  { section: 'Mi Plan',        items: [{ label: 'Mi Rutina',        path: '/my-routine', icon: <ClipboardList size={18} /> },
                                        { label: 'Mi Alimentación',  path: '/food-log',   icon: <Utensils size={18} /> }] },
  { section: 'Seguimiento',    items: [{ label: 'Mi Progreso',      path: '/progress',   icon: <TrendingUp size={18} /> }] },
];

const MENU_NUTRITIONIST = [
  { section: 'Principal',      items: [{ label: 'Dashboard',        path: '/dashboard',  icon: <LayoutDashboard size={18} /> }] },
  { section: 'Nutrición',      items: [{ label: 'Alimentos',        path: '/foods',      icon: <Utensils size={18} /> },
                                        { label: 'Registro comidas', path: '/food-log',   icon: <FileText size={18} /> }] },
];

const MENUS: Record<string, typeof MENU_ADMIN> = {
  admin:        MENU_ADMIN,
  coach:        MENU_COACH,
  client:       MENU_CLIENT,
  nutritionist: MENU_NUTRITIONIST,
};

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = MENUS[user?.rol ?? 'client'] ?? [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <span className="sidebar-logo">FitApp</span>
          <span className="sidebar-role">{user?.rol}</span>
        </div>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menu.map(({ section, items }) => (
          <div key={section} className="sidebar-section">
            <span className="sidebar-section-title">{section}</span>
            {items.map(({ label, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                }
              >
                <span className="sidebar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </span>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-user">{user?.nombre}</span>
        <button className="btn-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
