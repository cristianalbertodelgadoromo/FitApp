import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

export const DashboardPage = () => {
  const [coach, setCoach] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, clientsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/clients')
        ]);
        setCoach(meRes.data.coach);
        setClients(clientsRes.data.data);
      } catch (err) {
        console.error(err);
        if ((err as any).response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const filteredClients = clients.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Hola, {coach?.nombre || 'Coach'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Resumen de tu actividad</p>
        </div>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ flex: '1 1 200px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Clientes</h3>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              <CountUp end={clients.length} duration={1.5} />
            </div>
          </div>
          <div className="card" style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
            <h3 style={{ marginBottom: '1rem' }}>Gestión de Clientes</h3>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, padding: '12px', minWidth: '200px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }}
              />
              <button onClick={() => navigate('/clients/new')} className="btn-primary" style={{ width: 'auto' }}>+ Agregar Cliente</button>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ marginBottom: '1rem' }}>Mis Clientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/clients/${client.id}`} style={{ color: 'inherit', display: 'block', height: '100%' }}>
                  <div className="card interactive" style={{ cursor: 'pointer', height: '100%' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{client.nombre}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Objetivo:</strong> {client.objetivo || 'No definido'}</p>
                    <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <strong>IMC:</strong> <span style={{ color: 'var(--color-secondary)' }}>{client.imc || '--'}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {filteredClients.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay clientes para mostrar.</p>}
          </div>
        </section>
      </motion.div>
    </>
  );
};
