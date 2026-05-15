import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  titulo: string;
  contenido: string;
  tipo: 'tip' | 'novedad';
  imagen_url?: string;
  created_at: string;
  coach_nombre: string;
}

export const CommunityPage = () => {
  const { esCoach, esAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', contenido: '', tipo: 'tip' as 'tip' | 'novedad', imagen_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar la comunidad');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/posts', formData);
      toast.success('Post creado con éxito');
      setShowForm(false);
      setFormData({ titulo: '', contenido: '', tipo: 'tip', imagen_url: '' });
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post eliminado');
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Comunidad</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Tips de salud y novedades del gimnasio</p>
          </div>
          {(esCoach() || esAdmin()) && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto' }}>
              {showForm ? 'Cancelar' : '+ Nuevo Post'}
            </button>
          )}
        </header>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card"
              style={{ marginBottom: '2rem', padding: '2rem' }}
            >
              <h3 style={{ marginTop: 0 }}>Crear Publicación</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Título de la publicación"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  style={inputStyle}
                  required
                />
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="tip">💡 Tip de Salud/Entrenamiento</option>
                  <option value="novedad">📢 Novedad/Anuncio</option>
                </select>
                <textarea
                  placeholder="Escribe el contenido aquí..."
                  value={formData.contenido}
                  onChange={e => setFormData({ ...formData, contenido: e.target.value })}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                />
                <input
                  type="url"
                  placeholder="URL de imagen (opcional)"
                  value={formData.imagen_url}
                  onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                  style={inputStyle}
                />
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando comunidad...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay publicaciones aún.</p>}
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {post.imagen_url && (
                  <img src={post.imagen_url} alt={post.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: post.tipo === 'tip' ? '#dcfce7' : '#eff6ff',
                      color: post.tipo === 'tip' ? '#16a34a' : '#2563eb',
                      textTransform: 'uppercase'
                    }}>
                      {post.tipo === 'tip' ? '💡 Tip' : '📢 Novedad'}
                    </span>
                    {(esCoach() || esAdmin()) && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>{post.titulo}</h2>
                  <p style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{post.contenido}</p>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Por <strong>{post.coach_nombre}</strong></span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
