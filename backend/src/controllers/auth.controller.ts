import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLES } from '../constants/roles';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const register = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    const { nombre, email, telefono, password, rol, coach_id } = req.body;

    if (!nombre || !email || !password || !rol) {
      res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
      return;
    }

    const lowerRol = rol.toLowerCase();
    if (lowerRol !== 'coach' && lowerRol !== 'client' && lowerRol !== 'nutritionist') {
      res.status(400).json({ success: false, message: 'Rol inválido. Debe ser: coach, client, nutritionist' });
      return;
    }

    // Verificar si existe el email
    const [existing] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      res.status(400).json({ success: false, message: 'El email ya está registrado' });
      return;
    }

    await conn.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleId = ROLES[lowerRol.toUpperCase() as keyof typeof ROLES]?.id;
    if (!roleId) {
      throw new Error('Rol inválido');
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO users (role_id, nombre, email, telefono, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [roleId, nombre, email, telefono ?? null, hashedPassword]
    );
    const userId = result.insertId;

    if (lowerRol === 'coach') {
      await conn.execute(
        'INSERT INTO coach_profiles (user_id) VALUES (?)',
        [userId]
      );
    } else if (lowerRol === 'client') {
      if (!coach_id) {
        throw new Error('coach_id es obligatorio para clientes');
      }
      await conn.execute(
        'INSERT INTO client_profiles (user_id, coach_id) VALUES (?, ?)',
        [userId, coach_id]
      );
    } else if (lowerRol === 'nutritionist') {
      await conn.execute(
        'INSERT INTO nutritionist_profiles (user_id) VALUES (?)',
        [userId]
      );
    }

    await conn.commit();

    const token = jwt.sign(
      { id: userId, nombre, email, rol: lowerRol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, nombre, email, rol: lowerRol }
      }
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('Error en register:', err);
    res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

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
    let profileData: any = null;

    if (userData.rol === 'coach') {
      const [pRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM coach_profiles WHERE user_id = ?',
        [user.id]
      );
      profileData = pRows[0] || null;
    } else if (userData.rol === 'client') {
      const [pRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM client_profiles WHERE user_id = ?',
        [user.id]
      );
      profileData = pRows[0] || null;
    } else if (userData.rol === 'nutritionist') {
      const [pRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM nutritionist_profiles WHERE user_id = ?',
        [user.id]
      );
      profileData = pRows[0] || null;
    }

    res.status(200).json({
      success: true,
      coach: userData.rol === 'coach' ? { ...userData, ...profileData } : null,
      client: userData.rol === 'client' ? { ...userData, ...profileData } : null,
      user: { ...userData, profile: profileData }
    });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
