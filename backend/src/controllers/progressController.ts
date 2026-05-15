import { Response } from 'express';
import { ProgressModel, ProgressRecord } from '../models/progressModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getProgressByClient = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId, 10);

    // Cliente solo puede ver su propio avance
    if (user.rol === 'cliente' && user.id !== clientId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permiso para ver el avance de otro cliente'
      });
    }

    const records = await ProgressModel.findAllByClient(clientId);
    return res.status(200).json({ success: true, data: records, message: 'Registros de avance obtenidos' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const compareProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { r1, r2 } = req.query;
    const clientId = parseInt(req.params.clientId, 10);

    if (!r1 || !r2) {
      return res.status(400).json({ success: false, data: null, message: 'Se requieren dos IDs (r1 y r2) para comparar' });
    }

    const id1 = parseInt(r1 as string, 10);
    const id2 = parseInt(r2 as string, 10);

    const record1 = await ProgressModel.findById(id1);
    const record2 = await ProgressModel.findById(id2);

    if (!record1 || !record2) {
      return res.status(404).json({ success: false, data: null, message: 'Uno o ambos registros no encontrados' });
    }

    // Calcular diferencias (record2 - record1)
    const diferencias = {
      peso: Number(record2.peso_kg) - Number(record1.peso_kg),
      grasa: Number(record2.porcentaje_grasa || 0) - Number(record1.porcentaje_grasa || 0),
      cintura: Number(record2.cintura_cm || 0) - Number(record1.cintura_cm || 0),
      cadera: Number(record2.cadera_cm || 0) - Number(record1.cadera_cm || 0),
      pecho: Number(record2.pecho_cm || 0) - Number(record1.pecho_cm || 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        registro1: record1,
        registro2: record2,
        diferencias
      },
      message: 'Comparación generada con éxito'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createProgressRecord = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId, 10);
    const { fecha, peso_kg, porcentaje_grasa, cintura_cm, cadera_cm, pecho_cm, notas } = req.body;

    if (!fecha || !peso_kg) {
      return res.status(400).json({ success: false, data: null, message: 'Fecha y peso son obligatorios' });
    }

    // Obtener URLs de fotos si se subieron
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const getFileUrl = (fieldname: string) => {
      if (files && files[fieldname] && files[fieldname][0]) {
        return `/uploads/${files[fieldname][0].filename}`;
      }
      return undefined;
    };

    const record: ProgressRecord = {
      client_id: clientId,
      coach_id: user.id,
      fecha,
      peso_kg: parseFloat(peso_kg),
      porcentaje_grasa: porcentaje_grasa ? parseFloat(porcentaje_grasa) : undefined,
      cintura_cm: cintura_cm ? parseFloat(cintura_cm) : undefined,
      cadera_cm: cadera_cm ? parseFloat(cadera_cm) : undefined,
      pecho_cm: pecho_cm ? parseFloat(pecho_cm) : undefined,
      foto_frente_url: getFileUrl('foto_frente'),
      foto_espalda_url: getFileUrl('foto_espalda'),
      foto_lateral_url: getFileUrl('foto_lateral'),
      notas
    };

    const newId = await ProgressModel.create(record);
    return res.status(201).json({ success: true, data: { id: newId }, message: 'Registro de avance creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteProgressRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await ProgressModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: 'Registro no encontrado' });
    }

    return res.status(200).json({ success: true, data: null, message: 'Registro eliminado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
