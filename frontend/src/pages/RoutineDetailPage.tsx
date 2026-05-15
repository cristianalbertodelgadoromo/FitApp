import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

interface RoutineExercise {
  id: number;
  routine_id: number;
  exercise_id: number | null;
  nombre_libre: string | null;
  series: number | null;
  repeticiones: number | null;
  duracion_min: number | null;
  notas: string | null;
  orden: number;
  nombre?: string;
}

interface Routine {
  id: number;
  nombre: string;
  client_id: number;
  client_nombre?: string;
  fecha_inicio: string;
  activa: boolean;
}

interface ExerciseCatalog {
  id: number;
  nombre: string;
  grupo_muscular: string;
  tipo: string;
}

type AddTab = 'catalogo' | 'libre';

export const RoutineDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routineId = parseInt(id!, 10);

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>('catalogo');

  // Catálogo
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogItems, setCatalogItems] = useState<ExerciseCatalog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseCatalog | null>(null);

  // Form común
  const [exForm, setExForm] = useState({
    nombre_libre: '',
    series: '',
    repeticiones: '',
    duracion_min: '',
    notas: '',
    orden: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoutine = async () => {
    try {
      const res = await api.get(`/routines/${routineId}`);
      setRoutine(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await api.get(`/routines/${routineId}/exercises`);
      setExercises(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchRoutine(), fetchExercises()]);
      setIsLoading(false);
    };
    load();
  }, [routineId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/exercises?query=${catalogSearch}`);
        setCatalogItems(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  const handleToggleActive = async () => {
    if (!routine) return;
    try {
      await api.put(`/routines/${routineId}`, { activa: !routine.activa });
      toast.success(`Rutina marcada como ${!routine.activa ? 'activa' : 'inactiva'}`);
      fetchRoutine();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar rutina');
    }
  };

  const handleAddExercise = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        series: exForm.series ? parseInt(exForm.series) : null,
        repeticiones: exForm.repeticiones ? parseInt(exForm.repeticiones) : null,
        duracion_min: exForm.duracion_min ? parseInt(exForm.duracion_min) : null,
        notas: exForm.notas || null,
        orden: exForm.orden ? parseInt(exForm.orden) : exercises.length + 1,
      };

      if (addTab === 'catalogo' && selectedExercise) {
        payload.exercise_id = selectedExercise.id;
      } else if (addTab === 'libre') {
        if (!exForm.nombre_libre) {
          toast.error('El nombre del ejercicio es obligatorio');
          setIsSubmitting(false);
          return;
        }
        payload.nombre_libre = exForm.nombre_libre;
      } else {
        toast.error('Selecciona un ejercicio del catálogo');
        setIsSubmitting(false);
        return;
      }

      await api.post(`/routines/${routineId}/exercises`, payload);
      toast.success('Ejercicio agregado');
      setShowAddPanel(false);
      setSelectedExercise(null);
      setCatalogSearch('');
      setExForm({ nombre_libre: '', series: '', repeticiones: '', duracion_min: '', notas: '', orden: '' });
      fetchExercises();
    } catch (err) {
      console.error(err);
      toast.error('Error al agregar ejercicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (exId: number) => {
    try {
      await api.delete(`/routines/${routineId}/exercises/${exId}`);
      toast.success('Ejercicio eliminado');
      fetchExercises();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar ejercicio');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Cargando rutina...</div>
      </>
    );
  }

  if (!routine) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Rutina no encontrada.</p>
          <button onClick={() => navigate('/routines')} className="btn-primary" style={{ width: 'auto' }}>Volver</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <button
                onClick={() => navigate('/routines')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 0, marginBottom: '0.5rem' }}
              >
                ← Volver a Rutinas
              </button>
              <h1 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>{routine.nombre}</h1>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                👤 {routine.client_nombre || `Cliente #${routine.client_id}`} &nbsp;·&nbsp; 📅 {routine.fecha_inicio}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleToggleActive}
                style={{
                  padding: '8px 16px',
                  borderRadius: '99px',
                  border: `2px solid ${routine.activa ? '#10b981' : '#94a3b8'}`,
                  backgroundColor: routine.activa ? '#d1fae5' : 'transparent',
                  color: routine.activa ? '#065f46' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                {routine.activa ? '✓ Activa' : 'Marcar Activa'}
              </button>
              <button
                onClick={() => setShowAddPanel(!showAddPanel)}
                className="btn-primary"
                style={{ width: 'auto' }}
              >
                {showAddPanel ? 'Cancelar' : '+ Ejercicio'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Panel agregar ejercicio */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
              style={{ marginBottom: '2rem', marginTop: '1.5rem', padding: '1.5rem', overflow: 'hidden' }}
            >
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {(['catalogo', 'libre'] as AddTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAddTab(tab)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      backgroundColor: addTab === tab ? 'var(--color-primary)' : '#f1f5f9',
                      color: addTab === tab ? '#fff' : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab === 'catalogo' ? '📚 Del Catálogo' : '✏️ Texto Libre'}
                  </button>
                ))}
              </div>

              {addTab === 'catalogo' && (
                <div>
                  <input
                    type="text"
                    placeholder="Buscar ejercicio del catálogo..."
                    value={catalogSearch}
                    onChange={(e) => { setCatalogSearch(e.target.value); setSelectedExercise(null); }}
                    style={{ ...inputStyle, marginBottom: '0.5rem' }}
                  />
                  {!selectedExercise && catalogItems.length > 0 && (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}>
                      {catalogItems.slice(0, 6).map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => { setSelectedExercise(ex); setCatalogSearch(ex.nombre); }}
                          style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', border: 'none', borderBottom: '1px solid #f1f5f9', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span style={{ fontWeight: 500 }}>{ex.nombre}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ex.grupo_muscular} · {ex.tipo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedExercise && (
                    <div style={{ padding: '0.6rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                      ✓ <strong>{selectedExercise.nombre}</strong>
                    </div>
                  )}
                </div>
              )}

              {addTab === 'libre' && (
                <input
                  type="text"
                  placeholder="Nombre del ejercicio (ej. Sentadillas con peso)"
                  value={exForm.nombre_libre}
                  onChange={(e) => setExForm({ ...exForm, nombre_libre: e.target.value })}
                  style={{ ...inputStyle, marginBottom: '1rem' }}
                />
              )}

              {/* Campos comunes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input type="number" min="1" placeholder="Series" value={exForm.series} onChange={(e) => setExForm({ ...exForm, series: e.target.value })} style={inputStyle} />
                <input type="number" min="1" placeholder="Repeticiones" value={exForm.repeticiones} onChange={(e) => setExForm({ ...exForm, repeticiones: e.target.value })} style={inputStyle} />
                <input type="number" min="1" placeholder="Duración (min)" value={exForm.duracion_min} onChange={(e) => setExForm({ ...exForm, duracion_min: e.target.value })} style={inputStyle} />
                <input type="number" min="1" placeholder="Orden" value={exForm.orden} onChange={(e) => setExForm({ ...exForm, orden: e.target.value })} style={inputStyle} />
              </div>
              <textarea
                placeholder="Notas (opcional)..."
                value={exForm.notas}
                onChange={(e) => setExForm({ ...exForm, notas: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }}
              />
              <button onClick={handleAddExercise} disabled={isSubmitting} className="btn-primary" style={{ width: 'auto' }}>
                {isSubmitting ? 'Agregando...' : 'Agregar Ejercicio'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de ejercicios */}
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Ejercicios ({exercises.length})
        </h2>

        {exercises.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No hay ejercicios en esta rutina. ¡Agrega el primero!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...exercises].sort((a, b) => a.orden - b.orden).map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}>
                    {ex.orden}
                  </span>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>
                      {ex.nombre || ex.nombre_libre || `Ejercicio #${ex.exercise_id}`}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {ex.series && <span>🔄 {ex.series} series</span>}
                      {ex.repeticiones && <span>× {ex.repeticiones} reps</span>}
                      {ex.duracion_min && <span>⏱ {ex.duracion_min} min</span>}
                    </div>
                    {ex.notas && (
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        {ex.notas}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  title="Eliminar ejercicio"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem', flexShrink: 0, padding: '2px 4px', borderRadius: '4px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}
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
