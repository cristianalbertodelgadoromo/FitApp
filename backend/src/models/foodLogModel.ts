import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface FoodLog {
  id?: number;
  client_id: number;
  fecha: string;
  tipo_comida: string;
  food_id: number;
  cantidad_g: number;
  created_at?: Date;
}

export interface FoodLogWithDetails {
  id: number;
  client_id: number;
  cliente: string;
  fecha: string;
  tipo_comida: string;
  cantidad_g: number;
  alimento: string;
  unidad: string;
  calorias_kcal: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  created_at: Date;
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
      `SELECT * FROM v_food_logs_detalle WHERE client_id = ? AND fecha = ?`,
      [clientId, fecha]
    );

    const tiposOrden = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
    const mapaGrupos: Record<string, FoodLogWithDetails[]> = {};

    for (const row of rows as FoodLogWithDetails[]) {
      const tipo = row.tipo_comida || 'Snack';
      if (!mapaGrupos[tipo]) mapaGrupos[tipo] = [];
      mapaGrupos[tipo].push(row);
    }

    const grupos: FoodLogGrouped[] = tiposOrden.map((tipo) => {
      const items = mapaGrupos[tipo] || [];
      const subtotal_calorias = items.reduce(
        (sum, item) => sum + Number(item.calorias_kcal || 0),
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
      'SELECT id FROM foods WHERE id = ?',
      [log.food_id]
    );

    if (foodRows.length === 0) throw new Error('Alimento no encontrado');

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO food_logs (client_id, food_id, fecha, tipo_comida, cantidad_g)
       VALUES (?, ?, ?, ?, ?)`,
      [log.client_id, log.food_id, log.fecha, log.tipo_comida, log.cantidad_g]
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
    // client_profiles no tiene objetivo_calorico, devolvemos un valor estándar (2000 kcal)
    return 2000;
  }
};
