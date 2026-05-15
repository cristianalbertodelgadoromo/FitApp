import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { RolType } from '../types/roles';

export interface Coach {
  id?: number;
  nombre: string;
  telefono: string;
  rol?: RolType;
  password_hash: string;
  created_at?: Date;
}

export const CoachModel = {
  async findByTelefono(telefono: string): Promise<Coach | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coaches WHERE telefono = ?', [telefono]);
    if (rows.length === 0) return null;
    return rows[0] as Coach;
  },

  async findById(id: number): Promise<Omit<Coach, 'password_hash'> | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nombre, telefono, rol, created_at FROM coaches WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0] as Omit<Coach, 'password_hash'>;
  },

  async create(coach: Coach): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO coaches (nombre, telefono, password_hash) VALUES (?, ?, ?)',
      [coach.nombre, coach.telefono, coach.password_hash]
    );
    return result.insertId;
  }
};
