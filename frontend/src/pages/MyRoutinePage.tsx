import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface RoutineExercise {
  id: number;
  nombre?: string;
  nombre_libre?: string;
  exercise_id?: number;
  series?: number;
  repeticiones?: number;
  duracion_min?: number;
  notas?: string;
  orden: number;
}

interface Routine {
  id: number;
  nombre: string;
  client_id: number;
  fecha_inicio: string;
  activa: boolean;
}

export const MyRoutinePage = () => {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/routines/client/${user.id}`);
        const rt: Routine = res.data.data;
        setRoutine(rt);
        if (rt) {
          const exRes = await api.get(`/routines/${rt.id}/exercises`);
          setExercises(exRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>🏋️ Mi Rutina</h1>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Cargando rutina...
            </div>
          ) : !routine ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ color: 'var(--text-secondary)' }}>No tienes rutina asignada</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Tu coach aún no ha creado una rutina para ti. ¡Pronto tendrás una!
              </p>
            </div>
          ) : (
            <>
              {/* Info de rutina */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>{routine.nombre}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    📅 Inicio: {routine.fecha_inicio}
                  </span>
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: '99px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}>
                    ✓ Activa
                  </span>
                </div>
              </div>

              {/* Ejercicios */}
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                Ejercicios ({exercises.length})
              </h2>

              {exercises.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Tu coach aún no ha agregado ejercicios a esta rutina.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[...exercises].sort((a, b) => a.orden - b.orden).map((ex, i) => (
                    <motion.div
                      key={ex.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card"
                      style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
                    >
                      <span style={{
                        minWidth: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), #059669)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}>
                        {ex.orden}
                      </span>
                      <div>
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: '#1e293b' }}>
                          {ex.nombre || ex.nombre_libre || `Ejercicio #${ex.exercise_id}`}
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {ex.series && (
                            <span style={{ backgroundColor: '#f0fdf4', padding: '2px 10px', borderRadius: '99px', color: '#16a34a', fontWeight: 600 }}>
                              {ex.series} series
                            </span>
                          )}
                          {ex.repeticiones && (
                            <span style={{ backgroundColor: '#eff6ff', padding: '2px 10px', borderRadius: '99px', color: '#2563eb', fontWeight: 600 }}>
                              {ex.repeticiones} reps
                            </span>
                          )}
                          {ex.duracion_min && (
                            <span style={{ backgroundColor: '#fef3c7', padding: '2px 10px', borderRadius: '99px', color: '#d97706', fontWeight: 600 }}>
                              ⏱ {ex.duracion_min} min
                            </span>
                          )}
                        </div>
                        {ex.notas && (
                          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                            💬 {ex.notas}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};
