import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

interface Coach {
  id: number;
  nombre: string;
  telefono: string;
  created_at: string;
}

export const CoachProfilePage = () => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const res = await api.get('/coaches/my-coach');
        setCoach(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoach();
  }, []);

  const handleWhatsApp = () => {
    if (!coach?.telefono) return;
    // Limpiar número (quitar espacios, etc)
    const cleanPhone = coach.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <>
      
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Mi Coach</h1>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando información...</div>
          ) : !coach ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No tienes un coach asignado actualmente.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontWeight: 800
              }}>
                {coach.nombre.charAt(0)}
              </div>
              
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>{coach.nombre}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Tu entrenador personal en FitApp</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-bg)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Teléfono</span>
                  <span style={{ fontWeight: 700 }}>{coach.telefono}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-bg)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>En FitApp desde</span>
                  <span style={{ fontWeight: 700 }}>{new Date(coach.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                onClick={handleWhatsApp}
                className="btn-primary"
                style={{ width: '100%', padding: '16px' }}
              >
                <span style={{ fontSize: '1.2rem' }}>💬</span> Enviar mensaje por WhatsApp
              </button>
              
              <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Tu coach está disponible para resolver tus dudas sobre rutinas y alimentación.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
