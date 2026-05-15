import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, esCliente, esCoach, esAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    color: isActive ? '#10b981' : '#64748b',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const mobileNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    color: isActive ? '#10b981' : '#1e293b',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  });

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', show: esCoach() || esAdmin() },
    { name: 'Diario', path: '/food-log', icon: '🍎', show: true },
    { name: 'Comunidad', path: '/community', icon: '👥', show: true },
    { name: 'Mi Coach', path: '/my-coach', icon: '👨‍🏫', show: esCliente() },
    { name: 'Pagos', path: '/payments', icon: '💳', show: true },
    { name: 'Rutinas', path: esCliente() ? '/my-routine' : '/routines', icon: '🏋️', show: true },



    { name: 'Alimentos', path: '/foods', icon: '🍱', show: esCoach() || esAdmin() },
    { name: 'Ejercicios', path: '/exercises', icon: '💪', show: esCoach() || esAdmin() },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.75rem 1.5rem',
      marginBottom: '2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#10b981',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>G</div>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Fit<span style={{ color: '#10b981' }}>App</span>
          </h2>
        </div>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} className="desktop-nav">
          <div style={{ display: 'flex', gap: '0.25rem', marginRight: '1rem' }}>
            {menuItems.filter(item => item.show).map(item => (
              <NavLink key={item.path} to={item.path} style={navLinkStyle}>
                <span>{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0', marginRight: '1rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }} className="user-info">
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                {user?.nombre || user?.telefono}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user?.rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Cerrar sesión"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
            >
              🚪
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
            color: '#1e293b',
          }}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              backgroundColor: 'white',
              marginTop: '1rem',
            }}
            className="mobile-menu"
          >
            <div style={{ padding: '1rem 0' }}>
              {menuItems.filter(item => item.show).map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={mobileNavLinkStyle}
                  onClick={() => setIsOpen(false)}
                >
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '1rem 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        .nav-text {
          display: inline-block;
        }
        @media (max-width: 992px) {
          .user-info { display: none; }
        }
      `}</style>
    </nav>
  );
};
