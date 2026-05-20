export interface User {
  id: number;
  role_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  password_hash: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserConRol extends Omit<User, 'password_hash'> {
  rol: string;   // viene de la vista v_users_con_rol o JOIN con roles
}

export interface CoachProfile {
  user_id: number;
  especialidad?: string;
  biografia?: string;
  created_at: Date;
}

export interface ClientProfile {
  user_id: number;
  coach_id: number;
  peso_kg?: number;
  altura_cm?: number;
  objetivo?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NutritionistProfile {
  user_id: number;
  especialidad?: string;
  created_at: Date;
}

// Lo que viaja en el JWT
export interface JwtPayload {
  id: number;
  nombre: string;
  email: string;
  rol: string;        // ← NUEVO: el nombre del rol, no el id
}

// Extensión de Express para req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
