import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Food {
  id?: number;
  nombre: string;
  calorias_por_100g: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
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

  async create(food: Food): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO foods (nombre, calorias_por_100g, proteinas, carbohidratos, grasas) VALUES (?, ?, ?, ?, ?)',
      [food.nombre, food.calorias_por_100g, food.proteinas, food.carbohidratos, food.grasas]
    );
    return result.insertId;
  }
};
