import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { RolType } from '../types/roles';

export interface AuthRequest extends Request<any> {
  user?: {
    id: number;
    telefono: string;
    rol: RolType;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
