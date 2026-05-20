import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ProgressRecord {
  id?: number;
  client_id: number;
  fecha: string;
  peso_kg: number;
  altura_cm: number;
  imc?: number;
  porcentaje_grasa?: number | null;
  masa_muscular_kg?: number | null;
  notas?: string | null;
  created_at?: Date;
}

export const ProgressModel = {
  async findAllByClient(clientId: number): Promise<ProgressRecord[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM v_progress_resumen WHERE client_id = ? ORDER BY fecha DESC',
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
      (client_id, fecha, peso_kg, altura_cm, porcentaje_grasa, masa_muscular_kg, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        record.client_id,
        record.fecha,
        record.peso_kg,
        record.altura_cm,
        record.porcentaje_grasa ?? null,
        record.masa_muscular_kg ?? null,
        record.notas ?? null
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
