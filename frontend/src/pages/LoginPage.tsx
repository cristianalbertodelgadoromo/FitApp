import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export const LoginPage = () => {
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { telefono, password });
      localStorage.setItem('token', res.data.token);
      toast.success('¡Bienvenido a FitApp!');
      navigate('/dashboard');
    } catch (err: any) {
      setShake(true);
      setTimeout(() => setShake(false), 400); // Remove class after animation
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <motion.div 
        className={`card ${shake ? 'shake' : ''}`} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px' }}
      >
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '2.5rem' }}>FitApp</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ingresa con tu número y contraseña</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input 
            type="tel" 
            placeholder="Número de Teléfono" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{ padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc', width: '100%' }}
            required 
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc', width: '100%' }}
            required 
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '16px' }} disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : 'Ingresar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
