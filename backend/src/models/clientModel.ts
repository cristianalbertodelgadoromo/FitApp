import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Client {
  id?: number;
  coach_id: number;
  nombre: string;
  telefono?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  imc?: number;
  porcentaje_grasa?: number;
  created_at?: Date;
}

export const ClientModel = {
  async findAllByCoach(coach_id: number): Promise<Client[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clients WHERE coach_id = ?', [coach_id]);
    return rows as Client[];
  },

  async findByIdAndCoach(id: number, coach_id: number): Promise<Client | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clients WHERE id = ? AND coach_id = ?', [id, coach_id]);
    if (rows.length === 0) return null;
    return rows[0] as Client;
  },

  async create(client: Client): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO clients (coach_id, nombre, telefono, peso, altura, objetivo, imc, porcentaje_grasa) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [client.coach_id, client.nombre, client.telefono, client.peso, client.altura, client.objetivo, client.imc, client.porcentaje_grasa]
    );
    return result.insertId;
  },

  async update(id: number, coach_id: number, client: Partial<Client>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(client).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id, coach_id);
    const query = `UPDATE clients SET ${fields.join(', ')} WHERE id = ? AND coach_id = ?`;
    
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  },

  async delete(id: number, coach_id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM clients WHERE id = ? AND coach_id = ?', [id, coach_id]);
    return result.affectedRows > 0;
  }
};
