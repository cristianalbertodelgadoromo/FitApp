import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Request } from 'express';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM v_users_con_rol'
    );
    res.status(200).json({ success: true, data: rows, message: 'Usuarios listados con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;

    if (user.rol !== 'admin' && user.id !== id) {
      res.status(403).json({ success: false, message: 'No tienes permisos para ver este usuario' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM v_users_con_rol WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: rows[0], message: 'Usuario encontrado' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = req.user!;
    const { nombre, email, telefono, activo } = req.body;

    if (user.rol !== 'admin' && user.id !== id) {
      res.status(403).json({ success: false, message: 'No tienes permisos para modificar este usuario' });
      return;
    }

    // Buscar si existe el usuario
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(nombre);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email);
    }
    if (telefono !== undefined) {
      fields.push('telefono = ?');
      params.push(telefono);
    }
    if (activo !== undefined && user.rol === 'admin') {
      fields.push('activo = ?');
      params.push(activo);
    }

    if (fields.length === 0) {
      res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
      return;
    }

    params.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, params);

    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM v_users_con_rol WHERE id = ?',
      [id]
    );

    res.status(200).json({ success: true, data: updated[0], message: 'Usuario actualizado con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Usuario eliminado con éxito' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
