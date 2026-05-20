import { Response } from 'express';
import { ProgressModel, ProgressRecord } from '../models/progressModel';
import { Request } from 'express';

export const getProgressByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId as string, 10);

    // Cliente solo puede ver su propio avance
    if (user.rol === 'client' && user.id !== clientId) {
      res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permiso para ver el avance de otro cliente'
      });
      return;
    }

    const records = await ProgressModel.findAllByClient(clientId);
    res.status(200).json({ success: true, data: records, message: 'Registros de avance obtenidos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const compareProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { r1, r2 } = req.query;
    const clientId = parseInt(req.params.clientId as string, 10);

    if (!r1 || !r2) {
      res.status(400).json({ success: false, data: null, message: 'Se requieren dos IDs (r1 y r2) para comparar' });
      return;
    }

    const id1 = parseInt(r1 as string, 10);
    const id2 = parseInt(r2 as string, 10);

    const record1 = await ProgressModel.findById(id1);
    const record2 = await ProgressModel.findById(id2);

    if (!record1 || !record2) {
      res.status(404).json({ success: false, data: null, message: 'Uno o ambos registros no encontrados' });
      return;
    }

    // Calcular diferencias (record2 - record1)
    const diferencias = {
      peso_kg: parseFloat((Number(record2.peso_kg) - Number(record1.peso_kg)).toFixed(2)),
      porcentaje_grasa: parseFloat((Number(record2.porcentaje_grasa || 0) - Number(record1.porcentaje_grasa || 0)).toFixed(2)),
      masa_muscular_kg: parseFloat((Number(record2.masa_muscular_kg || 0) - Number(record1.masa_muscular_kg || 0)).toFixed(2)),
    };

    res.status(200).json({
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
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createProgressRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId as string, 10);
    const { fecha, peso_kg, altura_cm, porcentaje_grasa, masa_muscular_kg, notas } = req.body;

    if (!fecha || peso_kg === undefined || altura_cm === undefined) {
      res.status(400).json({ success: false, data: null, message: 'Fecha, peso_kg y altura_cm son obligatorios' });
      return;
    }

    const record: ProgressRecord = {
      client_id: clientId,
      fecha,
      peso_kg: parseFloat(peso_kg),
      altura_cm: parseFloat(altura_cm),
      porcentaje_grasa: porcentaje_grasa ? parseFloat(porcentaje_grasa) : null,
      masa_muscular_kg: masa_muscular_kg ? parseFloat(masa_muscular_kg) : null,
      notas: notas || null
    };

    const newId = await ProgressModel.create(record);
    res.status(201).json({ success: true, data: { id: newId }, message: 'Registro de avance creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteProgressRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await ProgressModel.delete(id);

    if (!deleted) {
      res.status(404).json({ success: false, data: null, message: 'Registro no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: null, message: 'Registro eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
