import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles';

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const isAdmin = user.rol === 'admin';

    const query = isAdmin
      ? `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.peso_kg, cp.altura_cm, cp.objetivo, cp.coach_id
         FROM users u 
         JOIN client_profiles cp ON cp.user_id = u.id`
      : `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.peso_kg, cp.altura_cm, cp.objetivo, cp.coach_id
         FROM users u 
         JOIN client_profiles cp ON cp.user_id = u.id
         WHERE cp.coach_id = ?`;

    const params = isAdmin ? [] : [user.id];
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.status(200).json({ success: true, data: rows, message: 'Clientes listados con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = parseInt(req.params.id as string, 10);
    const user = req.user!;
    const isAdmin = user.rol === 'admin';
    const isCoach = user.rol === 'coach';
    const isSelf = user.id === targetId;

    if (!isAdmin && !isCoach && !isSelf) {
      res.status(403).json({ success: false, message: 'Sin permisos' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.peso_kg, cp.altura_cm, cp.objetivo, cp.coach_id, u.created_at
       FROM users u
       JOIN client_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`,
      [targetId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      return;
    }

    const client = rows[0];

    // Si es coach, verificar que sea el coach de este cliente
    if (isCoach && !isAdmin && client.coach_id !== user.id) {
      res.status(403).json({ success: false, message: 'Sin permisos sobre este cliente' });
      return;
    }

    res.status(200).json({ success: true, data: client, message: 'Cliente encontrado' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    const user = req.user!;
    const { nombre, email, telefono, password, peso_kg, altura_cm, objetivo, coach_id } = req.body;

    if (!nombre || !email || !password) {
      res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre, email, password' });
      return;
    }

    // Determinar coach_id asignado
    let assignedCoachId = coach_id;
    if (user.rol === 'coach') {
      assignedCoachId = user.id;
    } else if (user.rol === 'admin' && !assignedCoachId) {
      res.status(400).json({ success: false, message: 'El coach_id es obligatorio para administradores al crear clientes' });
      return;
    }

    // Verificar si el email existe
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
    const roleId = ROLES.CLIENT.id;

    // 1. Insertar en users
    const [userResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO users (role_id, nombre, email, telefono, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [roleId, nombre, email, telefono ?? null, hashedPassword]
    );
    const newUserId = userResult.insertId;

    // 2. Insertar en client_profiles
    await conn.execute(
      `INSERT INTO client_profiles (user_id, coach_id, peso_kg, altura_cm, objetivo)
       VALUES (?, ?, ?, ?, ?)`,
      [
        newUserId,
        assignedCoachId,
        peso_kg !== undefined ? parseFloat(peso_kg) : null,
        altura_cm !== undefined ? parseFloat(altura_cm) : null,
        objetivo ?? null
      ]
    );

    await conn.commit();

    const [created] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, cp.peso_kg, cp.altura_cm, cp.objetivo, cp.coach_id
       FROM users u
       JOIN client_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`,
      [newUserId]
    );

    res.status(201).json({ success: true, data: created[0], message: 'Cliente creado con éxito' });
  } catch (error: any) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;
    const isAdmin = user.rol === 'admin';
    const isCoach = user.rol === 'coach';
    const { nombre, email, telefono, activo, peso_kg, altura_cm, objetivo, coach_id } = req.body;

    const [existing] = await conn.execute<RowDataPacket[]>(
      `SELECT cp.coach_id FROM client_profiles cp WHERE cp.user_id = ?`,
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      return;
    }

    const clientProfile = existing[0];

    // Si es coach, verificar que sea el coach asignado
    if (isCoach && !isAdmin && clientProfile.coach_id !== user.id) {
      res.status(403).json({ success: false, message: 'No tienes permisos para modificar este cliente' });
      return;
    }

    await conn.beginTransaction();

    // 1. Actualizar users
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
    if (activo !== undefined && isAdmin) {
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

    // 2. Actualizar client_profiles
    const profileFields: string[] = [];
    const profileParams: any[] = [];

    if (peso_kg !== undefined) {
      profileFields.push('peso_kg = ?');
      profileParams.push(peso_kg !== null ? parseFloat(peso_kg) : null);
    }
    if (altura_cm !== undefined) {
      profileFields.push('altura_cm = ?');
      profileParams.push(altura_cm !== null ? parseFloat(altura_cm) : null);
    }
    if (objetivo !== undefined) {
      profileFields.push('objetivo = ?');
      profileParams.push(objetivo);
    }
    if (coach_id !== undefined && isAdmin) {
      profileFields.push('coach_id = ?');
      profileParams.push(coach_id);
    }

    if (profileFields.length > 0) {
      profileParams.push(id);
      await conn.execute(
        `UPDATE client_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
        profileParams
      );
    }

    await conn.commit();

    const [updated] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, cp.peso_kg, cp.altura_cm, cp.objetivo, cp.coach_id
       FROM users u
       JOIN client_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`,
      [id]
    );

    res.status(200).json({ success: true, data: updated[0], message: 'Cliente actualizado con éxito' });
  } catch (error: any) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;
    const isAdmin = user.rol === 'admin';

    if (!isAdmin) {
      res.status(403).json({ success: false, message: 'Solo los administradores pueden eliminar clientes' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cliente eliminado con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
