import { Response } from 'express';
import { PaymentModel, Payment } from '../models/paymentModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let payments;

    if (user.rol === 'cliente') {
      payments = await PaymentModel.findAllByClient(user.id);
    } else {
      payments = await PaymentModel.findAllByCoach(user.id);
    }

    return res.status(200).json({ success: true, data: payments, message: 'Pagos listados con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const { client_id, monto, fecha, concepto, estado } = req.body;

    if (!client_id || !monto || !fecha) {
      return res.status(400).json({ success: false, data: null, message: 'Cliente, monto y fecha son obligatorios' });
    }

    const payment: Payment = { client_id: parseInt(client_id, 10), coach_id, monto: parseFloat(monto), fecha, concepto, estado };
    const newId = await PaymentModel.create(payment);

    return res.status(201).json({ success: true, data: { id: newId }, message: 'Pago registrado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment_id = parseInt(req.params.id, 10);
    const coach_id = req.user!.id;
    const isAdmin = req.user!.rol === 'sysadmin';

    const deleted = await PaymentModel.delete(payment_id, coach_id, isAdmin);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: 'Pago no encontrado o sin permisos' });
    }

    return res.status(200).json({ success: true, data: null, message: 'Registro de pago eliminado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
