import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Food {
  id?: number;
  nombre: string;
  unidad?: string;
  calorias_por_100g: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
}

export const FoodModel = {
  async findAll(searchQuery?: string): Promise<Food[]> {
    if (searchQuery) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM foods WHERE nombre LIKE ?', 
        [`%${searchQuery}%`]
      );
      return rows as Food[];
    }
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM foods');
    return rows as Food[];
  },

  async findById(id: number): Promise<Food | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM foods WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Food;
  },

  async create(food: Food): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO foods (nombre, unidad, calorias_por_100g, proteinas_g, carbohidratos_g, grasas_g) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        food.nombre,
        food.unidad ?? 'g',
        food.calorias_por_100g,
        food.proteinas_g,
        food.carbohidratos_g,
        food.grasas_g
      ]
    );
    return result.insertId;
  },

  async update(id: number, food: Partial<Food>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(food).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE foods SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM foods WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};
