import { Response } from 'express';
import { ClientModel, Client } from '../models/clientModel';
import { AuthRequest } from '../middlewares/authMiddleware';

const calculateIMC = (peso?: number, altura?: number): number | undefined => {
  if (peso && altura && altura > 0) {
    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);
    return parseFloat(imc.toFixed(2));
  }
  return undefined;
};

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const clients = await ClientModel.findAllByCoach(coach_id);
    return res.status(200).json({ success: true, data: clients, message: 'Clientes listados con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const client_id = parseInt(req.params.id, 10);
    const client = await ClientModel.findByIdAndCoach(client_id, coach_id);
    
    if (!client) {
      return res.status(404).json({ success: false, data: null, message: 'Cliente no encontrado' });
    }
    
    return res.status(200).json({ success: true, data: client, message: 'Cliente encontrado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const { nombre, telefono, peso, altura, objetivo, porcentaje_grasa } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, data: null, message: 'El nombre es obligatorio' });
    }

    const imc = calculateIMC(peso, altura);

    const client: Client = {
      coach_id,
      nombre,
      telefono,
      peso,
      altura,
      objetivo,
      imc,
      porcentaje_grasa
    };

    const newId = await ClientModel.create(client);
    const newClient = await ClientModel.findByIdAndCoach(newId, coach_id);

    return res.status(201).json({ success: true, data: newClient, message: 'Cliente creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const client_id = parseInt(req.params.id, 10);
    const updates = req.body;

    // Check if client exists
    const existingClient = await ClientModel.findByIdAndCoach(client_id, coach_id);
    if (!existingClient) {
      return res.status(404).json({ success: false, data: null, message: 'Cliente no encontrado' });
    }

    // Recalculate IMC if peso or altura is updated
    const finalPeso = updates.peso !== undefined ? updates.peso : existingClient.peso;
    const finalAltura = updates.altura !== undefined ? updates.altura : existingClient.altura;
    
    if (updates.peso !== undefined || updates.altura !== undefined) {
      updates.imc = calculateIMC(finalPeso, finalAltura) || existingClient.imc;
    }

    const updated = await ClientModel.update(client_id, coach_id, updates);
    if (!updated) {
      return res.status(400).json({ success: false, data: null, message: 'No se pudo actualizar el cliente' });
    }

    const updatedClient = await ClientModel.findByIdAndCoach(client_id, coach_id);
    return res.status(200).json({ success: true, data: updatedClient, message: 'Cliente actualizado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const client_id = parseInt(req.params.id, 10);
    
    const deleted = await ClientModel.delete(client_id, coach_id);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: 'Cliente no encontrado' });
    }

    return res.status(200).json({ success: true, data: null, message: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
