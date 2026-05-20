import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Request } from 'express';

export const getCoaches = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.especialidad, cp.biografia, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN coach_profiles cp ON u.id = cp.user_id 
       WHERE r.nombre = 'coach'`
    );
    res.status(200).json({ success: true, data: rows, message: 'Entrenadores listados con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getCoachById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;

    if (user.rol !== 'admin' && user.id !== id) {
      res.status(403).json({ success: false, message: 'No tienes permisos para ver este entrenador' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.especialidad, cp.biografia, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN coach_profiles cp ON u.id = cp.user_id 
       WHERE u.id = ? AND r.nombre = 'coach'`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: rows[0], message: 'Entrenador encontrado' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateCoach = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;
    const { nombre, email, telefono, activo, especialidad, biografia } = req.body;

    if (user.rol !== 'admin' && user.id !== id) {
      res.status(403).json({ success: false, message: 'No tienes permisos para actualizar este entrenador' });
      return;
    }

    const [existing] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND r.nombre = 'coach'`,
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
      return;
    }

    await conn.beginTransaction();

    // 1. Actualizar tabla users
    const userFields: string[] = [];
    const userParams: any[] = [];

    if (nombre !== undefined) {
      userFields.push('nombre = ?');
      userParams.push(nombre);
    }
    if (email !== undefined) {
      userFields.push('email = ?');
      userParams.push(email);
    }
    if (telefono !== undefined) {
      userFields.push('telefono = ?');
      userParams.push(telefono);
    }
    if (activo !== undefined && user.rol === 'admin') {
      userFields.push('activo = ?');
      userParams.push(activo);
    }

    if (userFields.length > 0) {
      userParams.push(id);
      await conn.execute(
        `UPDATE users SET ${userFields.join(', ')} WHERE id = ?`,
        userParams
      );
    }

    // 2. Actualizar coach_profiles
    const profileFields: string[] = [];
    const profileParams: any[] = [];

    if (especialidad !== undefined) {
      profileFields.push('especialidad = ?');
      profileParams.push(especialidad);
    }
    if (biografia !== undefined) {
      profileFields.push('biografia = ?');
      profileParams.push(biografia);
    }

    if (profileFields.length > 0) {
      profileParams.push(id);
      await conn.execute(
        `UPDATE coach_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
        profileParams
      );
    }

    await conn.commit();

    const [updated] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.especialidad, cp.biografia, u.created_at 
       FROM users u 
       LEFT JOIN coach_profiles cp ON u.id = cp.user_id 
       WHERE u.id = ?`,
      [id]
    );

    res.status(200).json({ success: true, data: updated[0], message: 'Entrenador actualizado con éxito' });
  } catch (error: any) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};
