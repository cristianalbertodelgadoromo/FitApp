import { Request, Response } from 'express';
import { FoodModel, Food } from '../models/foodModel';

export const getFoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    const foods = await FoodModel.findAll(query as string);
    res.status(200).json({ success: true, data: foods, message: 'Alimentos listados con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createFood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, unidad, calorias_por_100g, proteinas_g, carbohidratos_g, grasas_g } = req.body;

    if (!nombre || calorias_por_100g === undefined || proteinas_g === undefined || carbohidratos_g === undefined || grasas_g === undefined) {
      res.status(400).json({ success: false, data: null, message: 'Todos los campos nutricionales son obligatorios' });
      return;
    }

    const food: Food = {
      nombre,
      unidad: unidad ?? 'g',
      calorias_por_100g: parseFloat(calorias_por_100g),
      proteinas_g: parseFloat(proteinas_g),
      carbohidratos_g: parseFloat(carbohidratos_g),
      grasas_g: parseFloat(grasas_g)
    };

    const newId = await FoodModel.create(food);

    res.status(201).json({ success: true, data: { id: newId, ...food }, message: 'Alimento creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const updateFood = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updates = req.body;

    const existing = await FoodModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, data: null, message: 'Alimento no encontrado' });
      return;
    }

    const foodUpdates: Partial<Food> = {};
    if (updates.nombre !== undefined) foodUpdates.nombre = updates.nombre;
    if (updates.unidad !== undefined) foodUpdates.unidad = updates.unidad;
    if (updates.calorias_por_100g !== undefined) foodUpdates.calorias_por_100g = parseFloat(updates.calorias_por_100g);
    if (updates.proteinas_g !== undefined) foodUpdates.proteinas_g = parseFloat(updates.proteinas_g);
    if (updates.carbohidratos_g !== undefined) foodUpdates.carbohidratos_g = parseFloat(updates.carbohidratos_g);
    if (updates.grasas_g !== undefined) foodUpdates.grasas_g = parseFloat(updates.grasas_g);

    await FoodModel.update(id, foodUpdates);
    const updated = await FoodModel.findById(id);

    res.status(200).json({ success: true, data: updated, message: 'Alimento actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteFood = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const deleted = await FoodModel.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, data: null, message: 'Alimento no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: null, message: 'Alimento eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
