import { Request, Response } from 'express';
import { FoodModel, Food } from '../models/foodModel';

export const getFoods = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const foods = await FoodModel.findAll(query as string);
    return res.status(200).json({ success: true, data: foods, message: 'Alimentos listados con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { nombre, calorias_por_100g, proteinas, carbohidratos, grasas } = req.body;

    if (!nombre || calorias_por_100g === undefined || proteinas === undefined || carbohidratos === undefined || grasas === undefined) {
      return res.status(400).json({ success: false, data: null, message: 'Todos los campos nutricionales son obligatorios' });
    }

    const food: Food = { nombre, calorias_por_100g, proteinas, carbohidratos, grasas };
    const newId = await FoodModel.create(food);

    return res.status(201).json({ success: true, data: { id: newId, ...food }, message: 'Alimento creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
