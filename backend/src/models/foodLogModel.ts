import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface FoodLog {
  id?: number;
  client_id: number;
  fecha: string;
  tipo_comida: string;
  food_id: number;
  cantidad_g: number;
  calorias_consumidas?: number;
}

export interface FoodLogWithDetails extends FoodLog {
  food_nombre: string;
  calorias_por_100g: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface FoodLogGrouped {
  tipo_comida: string;
  items: FoodLogWithDetails[];
  subtotal_calorias: number;
}

export const FoodLogModel = {
  async findByClientAndDate(clientId: number, fecha: string): Promise<{
    grupos: FoodLogGrouped[];
    total_calorias: number;
  }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT fl.id, fl.client_id, fl.fecha, fl.tipo_comida, fl.food_id,
              fl.cantidad_g, fl.calorias_consumidas,
              f.nombre AS food_nombre, f.calorias_por_100g,
              f.proteinas, f.carbohidratos, f.grasas
       FROM food_logs fl
       JOIN foods f ON fl.food_id = f.id
       WHERE fl.client_id = ? AND fl.fecha = ?
       ORDER BY fl.tipo_comida, fl.id`,
      [clientId, fecha]
    );

    const tiposOrden = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
    const mapaGrupos: Record<string, FoodLogWithDetails[]> = {};

    for (const row of rows as FoodLogWithDetails[]) {
      const tipo = row.tipo_comida || 'Snack';
      if (!mapaGrupos[tipo]) mapaGrupos[tipo] = [];
      mapaGrupos[tipo].push(row as FoodLogWithDetails);
    }

    const grupos: FoodLogGrouped[] = tiposOrden.map((tipo) => {
      const items = mapaGrupos[tipo] || [];
      const subtotal_calorias = items.reduce(
        (sum, item) => sum + Number(item.calorias_consumidas || 0),
        0
      );
      return { tipo_comida: tipo, items, subtotal_calorias: parseFloat(subtotal_calorias.toFixed(2)) };
    });

    const total_calorias = parseFloat(
      grupos.reduce((sum, g) => sum + g.subtotal_calorias, 0).toFixed(2)
    );

    return { grupos, total_calorias };
  },

  async create(log: FoodLog): Promise<number> {
    const [foodRows] = await pool.query<RowDataPacket[]>(
      'SELECT calorias_por_100g FROM foods WHERE id = ?',
      [log.food_id]
    );

    if (foodRows.length === 0) throw new Error('Alimento no encontrado');

    const calorias_por_100g = Number(foodRows[0].calorias_por_100g);
    const calorias_consumidas = parseFloat(
      ((log.cantidad_g * calorias_por_100g) / 100).toFixed(2)
    );

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO food_logs (client_id, fecha, tipo_comida, food_id, cantidad_g, calorias_consumidas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [log.client_id, log.fecha, log.tipo_comida, log.food_id, log.cantidad_g, calorias_consumidas]
    );

    return result.insertId;
  },

  async findById(id: number): Promise<FoodLog | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM food_logs WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as FoodLog) : null;
  },

  async deleteById(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM food_logs WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  async getClientObjetivoCalorico(clientId: number): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT objetivo_calorico FROM clients WHERE id = ?',
      [clientId]
    );
    return rows.length > 0 ? Number(rows[0].objetivo_calorico) || 2000 : 2000;
  }
};
