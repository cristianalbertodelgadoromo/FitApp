import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ProgressRecord {
  id?: number;
  client_id: number;
  coach_id?: number;
  fecha: string;
  peso_kg: number;
  porcentaje_grasa?: number;
  cintura_cm?: number;
  cadera_cm?: number;
  pecho_cm?: number;
  foto_frente_url?: string;
  foto_espalda_url?: string;
  foto_lateral_url?: string;
  notas?: string;
  created_at?: Date;
}

export const ProgressModel = {
  async findAllByClient(clientId: number): Promise<ProgressRecord[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM progress_records WHERE client_id = ? ORDER BY fecha DESC',
      [clientId]
    );
    return rows as ProgressRecord[];
  },

  async findById(id: number): Promise<ProgressRecord | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM progress_records WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as ProgressRecord) : null;
  },

  async create(record: ProgressRecord): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO progress_records 
      (client_id, coach_id, fecha, peso_kg, porcentaje_grasa, cintura_cm, cadera_cm, pecho_cm, foto_frente_url, foto_espalda_url, foto_lateral_url, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.client_id,
        record.coach_id || null,
        record.fecha,
        record.peso_kg,
        record.porcentaje_grasa || null,
        record.cintura_cm || null,
        record.cadera_cm || null,
        record.pecho_cm || null,
        record.foto_frente_url || null,
        record.foto_espalda_url || null,
        record.foto_lateral_url || null,
        record.notas || null
      ]
    );
    return result.insertId;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM progress_records WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};
