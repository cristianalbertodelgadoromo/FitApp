import { Response } from 'express';
import { PostModel, Post } from '../models/postModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await PostModel.findAll();
    return res.status(200).json({ success: true, data: posts, message: 'Posts listados con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const coach_id = req.user!.id;
    const { titulo, contenido, tipo, imagen_url } = req.body;

    if (!titulo || !contenido || !tipo) {
      return res.status(400).json({ success: false, data: null, message: 'Título, contenido y tipo son obligatorios' });
    }

    const post: Post = { coach_id, titulo, contenido, tipo, imagen_url };
    const newId = await PostModel.create(post);

    return res.status(201).json({ success: true, data: { id: newId }, message: 'Post creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post_id = parseInt(req.params.id, 10);
    const coach_id = req.user!.id;
    const isAdmin = req.user!.rol === 'sysadmin';

    const deleted = await PostModel.delete(post_id, coach_id, isAdmin);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: 'Post no encontrado o sin permisos' });
    }

    return res.status(200).json({ success: true, data: null, message: 'Post eliminado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
