import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface Client {
  id: number;
  nombre: string;
}

interface Routine {
  id: number;
  nombre: string;
  client_id: number;
  client_nombre?: string;
  fecha_inicio: string;
  activa: boolean;
}

export const RoutinesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    client_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/routines');
      setRoutines(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar rutinas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutines();
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.client_id) {
      toast.error('Nombre y cliente son obligatorios');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/routines', {
        nombre: formData.nombre,
        client_id: parseInt(formData.client_id),
        fecha_inicio: formData.fecha_inicio,
      });
      toast.success('Rutina creada con éxito');
      setShowForm(false);
      setFormData({ nombre: '', client_id: '', fecha_inicio: new Date().toISOString().split('T')[0] });
      fetchRoutines();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear rutina');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--color-primary)', margin: 0 }}>📋 Rutinas</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto' }}>
              {showForm ? 'Cancelar' : '+ Nueva Rutina'}
            </button>
          </header>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card"
                style={{ marginBottom: '2rem', padding: '1.5rem', overflow: 'hidden' }}
              >
                <h3 style={{ marginTop: 0 }}>Nueva Rutina</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Nombre de la rutina"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={inputStyle}
                    required
                  />
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    style={inputStyle}
                  />
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Crear Rutina'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando rutinas...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {routines.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No hay rutinas creadas aún.
                </p>
              )}
              {routines.map((routine, i) => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card interactive"
                  onClick={() => navigate(`/routines/${routine.id}`)}
                  style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>{routine.nombre}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      👤 {routine.client_nombre || `Cliente #${routine.client_id}`}
                      &nbsp;·&nbsp; 📅 {routine.fecha_inicio}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '99px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: routine.activa ? '#d1fae5' : '#f1f5f9',
                    color: routine.activa ? '#065f46' : '#64748b',
                  }}>
                    {routine.activa ? '✓ Activa' : 'Inactiva'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
