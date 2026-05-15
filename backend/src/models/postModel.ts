import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Post {
  id?: number;
  coach_id: number;
  titulo: string;
  contenido: string;
  tipo: 'tip' | 'novedad';
  imagen_url?: string;
  created_at?: Date;
  coach_nombre?: string;
}

export const PostModel = {
  async findAll(): Promise<Post[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.nombre AS coach_nombre 
       FROM posts p 
       JOIN coaches c ON p.coach_id = c.id 
       ORDER BY p.created_at DESC`
    );
    return rows as Post[];
  },

  async create(post: Post): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO posts (coach_id, titulo, contenido, tipo, imagen_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [post.coach_id, post.titulo, post.contenido, post.tipo, post.imagen_url || null]
    );
    return result.insertId;
  },

  async delete(id: number, coach_id: number, isAdmin: boolean): Promise<boolean> {
    let query = 'DELETE FROM posts WHERE id = ?';
    let params: any[] = [id];

    if (!isAdmin) {
      query += ' AND coach_id = ?';
      params.push(coach_id);
    }

    const [result] = await pool.query<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }
};
