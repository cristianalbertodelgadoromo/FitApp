import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'coach' | 'client' | 'nutritionist';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  esAdmin: () => boolean;
  esCoach: () => boolean;
  esCliente: () => boolean;
  esNutritionist: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al montar: verificar si hay token guardado y validarlo contra el servidor
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedToken !== 'undefined') {
      // Validar el token contra GET /api/auth/me
      api.get('/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => {
          setToken(savedToken);
          setUser(res.data.user);   // { id, nombre, email, rol }
        })
        .catch(() => {
          // Token inválido o expirado — limpiar
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Obtener perfil real desde el servidor (no decodificar el JWT en el cliente)
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, loading,
      esAdmin:        () => user?.rol === 'admin',
      esCoach:        () => user?.rol === 'coach',
      esCliente:      () => user?.rol === 'client',
      esNutritionist: () => user?.rol === 'nutritionist',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
