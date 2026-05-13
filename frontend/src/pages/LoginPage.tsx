import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const LoginPage = () => {
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { telefono, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px' }}>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '2.5rem' }}>FitApp</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ingresa con tu número y contraseña</p>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input 
            type="tel" 
            placeholder="Número de Teléfono" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{ padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc', width: '100%' }}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc', width: '100%' }}
            required 
          />
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '16px' }}>Ingresar</button>
        </form>
      </div>
    </div>
  );
};
