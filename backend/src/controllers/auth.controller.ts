import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, telefono, password } = req.body;
    const identifier = email || telefono;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
      return;
    }

    const [userRows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.*, r.nombre AS rol 
       FROM users u 
       JOIN roles r ON r.id = u.role_id 
       WHERE u.email = ? OR u.telefono = ?`,
      [identifier, identifier]
    );

    if (userRows.length === 0) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const user = userRows[0];

    if (!user.activo) {
      res.status(403).json({ success: false, message: 'Usuario inactivo' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
      }
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const [userRows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, r.nombre AS rol 
       FROM users u 
       JOIN roles r ON r.id = u.role_id 
       WHERE u.id = ?`,
      [user.id]
    );

    if (userRows.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const userData = userRows[0];

    res.status(200).json({
      success: true,
      user: { ...userData }
    });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
