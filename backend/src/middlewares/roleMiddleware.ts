import { Response, NextFunction } from 'express';
import { Rol, RolType } from '../types/roles';
import { AuthRequest } from './authMiddleware';

export const requireRole = (...rolesPermitidos: Rol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Si no hay req.user -> 401
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    // Cast a unknown primero si typescript da problemas antes del paso 3, 
    // pero idealmente authMiddleware ya tendrá el tipo correcto.
    const rol = (req.user as any).rol as RolType;

    // Si rol es sysadmin -> next() directamente (acceso total)
    if (rol === Rol.SysAdmin) {
      next();
      return;
    }

    // Si rol no está en rolesPermitidos -> 403 con mensaje claro
    if (!rolesPermitidos.includes(rol as Rol)) {
      res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
      return;
    }

    // Si pasa -> next()
    next();
  };
};

export const requireOwnership = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }

  const { id, rol } = req.user as any as { id: number; rol: RolType };

  if (rol === Rol.SysAdmin) {
    next();
    return;
  }

  // Verifica que req.params.id === req.user.id
  if (parseInt(req.params.id, 10) !== id) {
    res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
    return;
  }

  next();
};
