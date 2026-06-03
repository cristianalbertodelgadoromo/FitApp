import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface ProgressRecord {
  id: number;
  fecha: string;
  peso_kg: number;
  porcentaje_grasa: number;
  cintura_cm: number;
  cadera_cm: number;
  pecho_cm: number;
  foto_frente_url: string;
  foto_espalda_url: string;
  foto_lateral_url: string;
  notas: string;
}

interface Diferencias {
  peso: number;
  grasa: number;
  cintura: number;
  cadera: number;
  pecho: number;
}

const DiffBadge = ({ value, unit = 'kg', invertido = false }: { value: number; unit?: string; invertido?: boolean }) => {
  const mejora = invertido ? value < 0 : value > 0;
  const color = value === 0 ? 'var(--color-text-secondary)' : mejora ? '#16a34a' : '#dc2626';
  const bg = value === 0 ? 'var(--color-border)' : mejora ? '#dcfce7' : '#fee2e2';
  const prefix = value > 0 ? '+' : '';
  return (
    <span style={{ padding: '3px 10px', borderRadius: '99px', backgroundColor: bg, color, fontWeight: 700, fontSize: '0.85rem' }}>
      {prefix}{value.toFixed(1)} {unit}
    </span>
  );
};

const MetricRow = ({ label, v1, v2, diff, unit, invertido }: {
  label: string; v1: number; v2: number; diff: number; unit?: string; invertido?: boolean;
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>{label}</span>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontWeight: 700 }}>{v1 ?? '-'} {unit}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Antes</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontWeight: 700 }}>{v2 ?? '-'} {unit}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Después</span>
      <DiffBadge value={diff} unit={unit} invertido={invertido} />
    </div>
  </div>
);

export const ProgressComparePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const r1Id = searchParams.get('r1');
  const r2Id = searchParams.get('r2');
  const clientId = searchParams.get('clientId');

  const [data, setData] = useState<{ registro1: ProgressRecord; registro2: ProgressRecord; diferencias: Diferencias } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const SERVER_URL = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000';


  useEffect(() => {
    if (!r1Id || !r2Id || !clientId) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await api.get(`/progress/compare/${clientId}?r1=${r1Id}&r2=${r2Id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [r1Id, r2Id, clientId]);

  return (
    <>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 0, marginBottom: '1rem' }}>
            ← Volver
          </button>
          <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>⚖️ Comparación de Avance</h1>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando comparación...</div>
          ) : !data ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No se encontraron los registros para comparar.
            </div>
          ) : (
            <>
              {/* Fotos lado a lado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {[data.registro1, data.registro2].map((record, idx) => (
                  <div key={record.id} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, margin: '0 0 1rem', color: idx === 0 ? 'var(--color-text-secondary)' : 'var(--color-primary)', fontSize: '1rem' }}>
                      {idx === 0 ? '◀ Antes' : 'Después ▶'} · {record.fecha}
                    </p>
                    {record.foto_frente_url ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
                        {[record.foto_frente_url, record.foto_espalda_url, record.foto_lateral_url]
                          .filter(Boolean)
                          .map((url, i) => (
                            <img key={i} src={`${SERVER_URL}${url}`} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                          ))}
                      </div>
                    ) : (

                      <div style={{ height: '100px', backgroundColor: 'var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Sin fotos
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Métricas comparadas */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Métrica</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Antes</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center' }}>Después</span>
                </div>
                <MetricRow label="⚖️ Peso" v1={data.registro1.peso_kg} v2={data.registro2.peso_kg} diff={data.diferencias.peso} unit="kg" invertido />
                <MetricRow label="🔥 % Grasa" v1={data.registro1.porcentaje_grasa} v2={data.registro2.porcentaje_grasa} diff={data.diferencias.grasa} unit="%" invertido />
                <MetricRow label="📏 Cintura" v1={data.registro1.cintura_cm} v2={data.registro2.cintura_cm} diff={data.diferencias.cintura} unit="cm" invertido />
                <MetricRow label="📏 Cadera" v1={data.registro1.cadera_cm} v2={data.registro2.cadera_cm} diff={data.diferencias.cadera} unit="cm" invertido />
                <MetricRow label="📏 Pecho" v1={data.registro1.pecho_cm} v2={data.registro2.pecho_cm} diff={data.diferencias.pecho} unit="cm" />
              </div>

              {/* Notas */}
              {(data.registro1.notas || data.registro2.notas) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  {[data.registro1, data.registro2].map((record) => record.notas ? (
                    <div key={record.id} className="card" style={{ padding: '1rem' }}>
                      <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        💬 {record.notas}
                      </p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{record.fecha}</span>
                    </div>
                  ) : null)}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};
