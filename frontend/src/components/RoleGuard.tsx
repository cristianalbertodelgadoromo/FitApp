import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types/roles';

interface RoleGuardProps {
  roles: Rol[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  // Sysadmin siempre tiene acceso
  if (user.rol === Rol.SysAdmin) return <>{children}</>;

  // Verificar si el rol del usuario está en la lista permitida
  if (roles.includes(user.rol as Rol)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
