import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/User';

// 1. Verifica que el token JWT es válido y adjunta req.user
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token no proporcionado' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

// 2. Verifica que req.user tiene uno de los roles permitidos
// Uso: requireRole('admin', 'coach')
export const requireRole = (...rolesPermitidos: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' });
      return;
    }
    next();
  };
