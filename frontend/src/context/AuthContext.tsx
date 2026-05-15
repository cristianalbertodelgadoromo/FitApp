import React, { createContext, useContext, useState, useEffect } from 'react';
import { Rol, RolType } from '../types/roles';

interface User {
  id: number;
  nombre: string;
  telefono: string;
  rol: RolType;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  esAdmin: () => boolean;
  esCoach: () => boolean;
  esCliente: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string) => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      const userData: User = {
        id: decodedPayload.id,
        nombre: decodedPayload.nombre || '', // El backend puede no enviarlo en el payload, pero lo guardamos si viene
        telefono: decodedPayload.telefono,
        rol: decodedPayload.rol,
        token
      };

      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error decodificando token:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const esAdmin = () => user?.rol === Rol.SysAdmin;
  const esCoach = () => user?.rol === Rol.Coach;
  const esCliente = () => user?.rol === Rol.Cliente;

  return (
    <AuthContext.Provider value={{ user, login, logout, esAdmin, esCoach, esCliente }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
