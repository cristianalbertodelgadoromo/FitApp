import { Response } from 'express';
import { FoodLogModel } from '../models/foodLogModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getFoodLogs = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId, 10);
    const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];

    // Cliente solo puede ver sus propios registros
    if (user.rol === 'cliente' && user.id !== clientId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permiso para ver los registros de otro cliente'
      });
    }

    const { grupos, total_calorias } = await FoodLogModel.findByClientAndDate(clientId, fecha);
    const objetivo_calorico = await FoodLogModel.getClientObjetivoCalorico(clientId);

    return res.status(200).json({
      success: true,
      data: {
        fecha,
        client_id: clientId,
        objetivo_calorico,
        total_calorias,
        porcentaje: parseFloat(((total_calorias / objetivo_calorico) * 100).toFixed(1)),
        grupos
      },
      message: 'Registros del día obtenidos con éxito'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createFoodLog = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { client_id, fecha, tipo_comida, food_id, cantidad_g } = req.body;

    if (!client_id || !fecha || !tipo_comida || !food_id || !cantidad_g) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos requeridos: client_id, fecha, tipo_comida, food_id, cantidad_g'
      });
    }

    const tiposValidos = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
    if (!tiposValidos.includes(tipo_comida)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'tipo_comida debe ser: Desayuno, Almuerzo, Cena o Snack'
      });
    }

    // Cliente solo puede registrar para sí mismo
    if (user.rol === 'cliente' && user.id !== parseInt(client_id, 10)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No puedes registrar alimentos para otro cliente'
      });
    }

    const newId = await FoodLogModel.create({
      client_id: parseInt(client_id, 10),
      fecha,
      tipo_comida,
      food_id: parseInt(food_id, 10),
      cantidad_g: parseFloat(cantidad_g)
    });

    return res.status(201).json({
      success: true,
      data: { id: newId },
      message: 'Alimento registrado con éxito'
    });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Alimento no encontrado') {
      return res.status(404).json({ success: false, data: null, message: 'Alimento no encontrado en el catálogo' });
    }
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteFoodLog = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const logId = parseInt(req.params.id, 10);

    const log = await FoodLogModel.findById(logId);
    if (!log) {
      return res.status(404).json({ success: false, data: null, message: 'Registro no encontrado' });
    }

    // Cliente solo puede eliminar sus propios registros
    if (user.rol === 'cliente' && log.client_id !== user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No puedes eliminar registros de otro cliente'
      });
    }

    await FoodLogModel.deleteById(logId);
    return res.status(200).json({ success: true, data: null, message: 'Registro eliminado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
