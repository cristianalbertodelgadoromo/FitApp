import { Response } from 'express';
import { CoachModel } from '../models/coachModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getMyCoach = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.rol !== 'cliente') {
      return res.status(400).json({ success: false, data: null, message: 'Solo los clientes tienen un coach asignado' });
    }

    const coach = await CoachModel.findByClientId(user.id);
    if (!coach) {
      return res.status(404).json({ success: false, data: null, message: 'Coach no encontrado' });
    }

    return res.status(200).json({ success: true, data: coach, message: 'Información del coach obtenida' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
