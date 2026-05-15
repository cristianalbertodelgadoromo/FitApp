import { Request, Response } from 'express';
import { CoachModel } from '../models/coachModel';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Rol } from '../types/roles';
import { pool } from '../config/db';
import { ResultSetHeader } from 'mysql2';

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, telefono, password } = req.body;

    if (!nombre || !telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existingCoach = await CoachModel.findByTelefono(telefono);
    if (existingCoach) {
      return res.status(400).json({ error: 'El teléfono ya está registrado' });
    }

    const password_hash = await hashPassword(password);
    const newCoachId = await CoachModel.create({ nombre, telefono, password_hash });

    const token = generateToken({ id: newCoachId, telefono, rol: Rol.Coach });

    return res.status(201).json({
      message: 'Entrenador registrado exitosamente',
      token,
      coach: { id: newCoachId, nombre, telefono, rol: Rol.Coach }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { telefono, password } = req.body;

    if (!telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const coach = await CoachModel.findByTelefono(telefono);
    if (!coach) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await comparePassword(password, coach.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken({ id: coach.id!, telefono: coach.telefono, rol: coach.rol! });

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      coach: { id: coach.id, nombre: coach.nombre, telefono: coach.telefono, rol: coach.rol }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const coach = await CoachModel.findById(req.user.id);
    if (!coach) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }

    return res.status(200).json({ coach });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { nombre, telefono, password } = req.body;
    const systemSecret = req.headers['x-system-secret'];

    if (systemSecret !== process.env.SYSTEM_SECRET) {
      return res.status(403).json({ error: 'No autorizado para crear administradores' });
    }

    if (!nombre || !telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existingCoach = await CoachModel.findByTelefono(telefono);
    if (existingCoach) {
      return res.status(400).json({ error: 'El teléfono ya está registrado' });
    }

    const password_hash = await hashPassword(password);
    const newAdminId = await pool.query<ResultSetHeader>(
      'INSERT INTO coaches (nombre, telefono, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, telefono, password_hash, Rol.SysAdmin]
    );

    return res.status(201).json({
      message: 'Administrador registrado exitosamente',
      admin: { id: (newAdminId[0] as ResultSetHeader).insertId, nombre, telefono, rol: Rol.SysAdmin }
    });
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
