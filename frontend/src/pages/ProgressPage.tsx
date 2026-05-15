import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

interface ProgressRecord {
  id: number;
  fecha: string;
  peso_kg: number;
  porcentaje_grasa: number;
  cintura_cm: number;
  cadera_cm: number;
  pecho_cm: number;
  foto_frente_url: string;
  notas: string;
}

export const ProgressPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const SERVER_URL = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000';


  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/progress/client/${clientId}`);
        setRecords(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [clientId]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    if (selected.length === 2) {
      navigate(`/progress/compare?r1=${selected[0]}&r2=${selected[1]}&clientId=${clientId}`);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 0, marginBottom: '0.5rem' }}>
                ← Volver
              </button>
              <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>📊 Avance del Cliente</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {selected.length === 2 && (
                <button onClick={handleCompare} style={{ padding: '8px 16px', borderRadius: '8px', border: '2px solid #6366f1', backgroundColor: '#f5f3ff', color: '#6366f1', cursor: 'pointer', fontWeight: 700 }}>
                  ⚖️ Comparar seleccionados
                </button>
              )}
              <button onClick={() => navigate(`/progress/new/${clientId}`)} className="btn-primary" style={{ width: 'auto' }}>
                + Nuevo Registro
              </button>
            </div>
          </header>

          {selected.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '1.5rem', color: '#2563eb', fontSize: '0.9rem' }}>
              {selected.length === 1 ? '1 registro seleccionado. Selecciona otro para comparar.' : '2 registros seleccionados. Listo para comparar.'}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando registros...</div>
          ) : records.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
              <h3>Sin registros de avance</h3>
              <p>Crea el primer registro de avance para este cliente.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {records.map((record, i) => {
                const isSelected = selected.includes(record.id);
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f5f3ff' : '#fff',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleSelect(record.id)}
                  >
                    {record.foto_frente_url && (
                      <img
                        src={`${SERVER_URL}${record.foto_frente_url}`}
                        alt="Frente"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                      />
                    )}

                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1e293b' }}>📅 {record.fecha}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>⚖️ {record.peso_kg} kg</span>
                      {record.porcentaje_grasa && <span style={{ color: '#f59e0b', fontWeight: 600 }}>🔥 {record.porcentaje_grasa}% grasa</span>}
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: '0.5rem', color: '#6366f1', fontWeight: 700, fontSize: '0.85rem' }}>✓ Seleccionado</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
