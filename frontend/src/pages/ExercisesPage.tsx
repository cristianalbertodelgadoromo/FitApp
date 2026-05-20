import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export const ExercisesPage = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [grupoFilter, setGrupoFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', grupo_muscular: '', tipo: '', nivel: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchExercises = async (grupo = '', nivel = '') => {
    try {
      let query = '?';
      if (grupo) query += `grupo=${grupo}&`;
      if (nivel) query += `nivel=${nivel}`;
      const res = await api.get(`/exercises${query}`);
      setExercises(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExercises(grupoFilter, nivelFilter);
  }, [grupoFilter, nivelFilter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/exercises', formData);
      toast.success('Ejercicio creado exitosamente');
      setShowForm(false);
      setFormData({ nombre: '', grupo_muscular: '', tipo: '', nivel: '' });
      fetchExercises(grupoFilter, nivelFilter);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el ejercicio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ color: 'var(--color-primary)' }}>Catálogo de Ejercicios</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto' }}>
            {showForm ? 'Cancelar' : '+ Nuevo Ejercicio'}
          </button>
        </header>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Agregar Ejercicio Global</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input required type="text" name="nombre" placeholder="Nombre del Ejercicio" value={formData.nombre} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input type="text" name="grupo_muscular" placeholder="Grupo Muscular (ej. Pecho)" value={formData.grupo_muscular} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input type="text" name="tipo" placeholder="Tipo (ej. Fuerza)" value={formData.tipo} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <select name="nivel" value={formData.nivel} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }}>
                <option value="">Selecciona Nivel...</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
              <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <span className="spinner"></span> : 'Guardar'}</button>
            </form>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Filtrar por grupo muscular..." 
            value={grupoFilter} 
            onChange={(e) => setGrupoFilter(e.target.value)} 
            style={{ flex: 1, minWidth: '200px', padding: '14px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} 
          />
          <select 
            value={nivelFilter} 
            onChange={(e) => setNivelFilter(e.target.value)} 
            style={{ flex: 1, minWidth: '200px', padding: '14px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }}
          >
            <option value="">Todos los niveles</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {exercises.map((exercise, i) => (
            <motion.div key={exercise.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="card interactive" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{exercise.nombre}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Grupo:</strong> {exercise.grupo_muscular || 'N/A'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#636E72', backgroundColor: '#F4F7F6', padding: '4px 8px', borderRadius: '4px' }}>{exercise.tipo || 'General'}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: exercise.nivel === 'Avanzado' ? '#e91e63' : exercise.nivel === 'Intermedio' ? '#ff9800' : 'var(--color-primary)' }}>
                  {exercise.nivel || 'N/A'}
                </span>
              </div>
            </motion.div>
          ))}
          {exercises.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No se encontraron ejercicios con esos filtros.</p>}
        </div>
      </motion.div>
    </>
  );
};
