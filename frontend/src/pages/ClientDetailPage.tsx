import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        setClient(res.data.data);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      }
    };
    fetchClient();
  }, [id, navigate]);

  if (!client) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-secondary)', borderRadius: 'var(--border-radius)', color: 'var(--text-primary)' }}>← Volver</button>
          <h1 style={{ color: 'var(--text-primary)' }}>{client.nombre}</h1>
        </div>
        <button style={{ padding: '8px 24px', backgroundColor: 'var(--color-secondary)', color: 'white', borderRadius: 'var(--border-radius)', fontWeight: 600 }}>Editar Cliente</button>
      </header>

      {client.objetivo && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>
          <h3 style={{ opacity: 0.9, marginBottom: '0.5rem', fontSize: '1rem' }}>Objetivo Principal</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{client.objetivo}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', backgroundColor: '#e3f2fd', border: 'none' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Peso</p>
          <h2 style={{ color: 'var(--color-secondary)', fontSize: '2.5rem' }}>{client.peso ? `${client.peso} kg` : '--'}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center', backgroundColor: '#e8f5e9', border: 'none' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Altura</p>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>{client.altura ? `${client.altura} cm` : '--'}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center', backgroundColor: '#fff3e0', border: 'none' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>IMC</p>
          <h2 style={{ color: '#ff9800', fontSize: '2.5rem' }}>{client.imc || '--'}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center', backgroundColor: '#fce4ec', border: 'none' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>% Grasa</p>
          <h2 style={{ color: '#e91e63', fontSize: '2.5rem' }}>{client.porcentaje_grasa ? `${client.porcentaje_grasa}%` : '--'}</h2>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Información de Contacto</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}><strong>Teléfono:</strong> {client.telefono || 'No registrado'}</p>
      </div>
    </div>
  );
};
