import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Payment {
  id?: number;
  client_id: number;
  coach_id: number;
  monto: number;
  fecha: string;
  concepto?: string;
  estado?: 'pendiente' | 'completado';
  client_nombre?: string;
  created_at?: Date;
}

export const PaymentModel = {
  async findAllByCoach(coach_id: number): Promise<Payment[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, cl.nombre AS client_nombre 
       FROM payments p 
       JOIN clients cl ON p.client_id = cl.id 
       WHERE p.coach_id = ? 
       ORDER BY p.fecha DESC`,
      [coach_id]
    );
    return rows as Payment[];
  },

  async findAllByClient(client_id: number): Promise<Payment[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM payments WHERE client_id = ? ORDER BY fecha DESC',
      [client_id]
    );
    return rows as Payment[];
  },

  async create(payment: Payment): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO payments (client_id, coach_id, monto, fecha, concepto, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payment.client_id, payment.coach_id, payment.monto, payment.fecha, payment.concepto || null, payment.estado || 'completado']
    );
    return result.insertId;
  },

  async delete(id: number, coach_id: number, isAdmin: boolean): Promise<boolean> {
    let query = 'DELETE FROM payments WHERE id = ?';
    let params: any[] = [id];

    if (!isAdmin) {
      query += ' AND coach_id = ?';
      params.push(coach_id);
    }

    const [result] = await pool.query<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }
};
