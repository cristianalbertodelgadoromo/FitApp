import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface Payment {
  id: number;
  client_id: number;
  monto: number;
  fecha: string;
  concepto: string;
  estado: 'pendiente' | 'completado';
  client_nombre?: string;
  created_at: string;
}

interface Client {
  id: number;
  nombre: string;
}

export const PaymentsPage = () => {
  const { esCoach, esAdmin, esCliente } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ client_id: '', monto: '', fecha: new Date().toISOString().split('T')[0], concepto: 'Mensualidad', estado: 'completado' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data.data || []);
      
      if (esCoach() || esAdmin()) {
        const clientsRes = await api.get('/clients');
        setClients(clientsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/payments', formData);
      toast.success('Pago registrado');
      setShowForm(false);
      setFormData({ client_id: '', monto: '', fecha: new Date().toISOString().split('T')[0], concepto: 'Mensualidad', estado: 'completado' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este registro de pago?')) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Registro eliminado');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar');
    }
  };

  const totalRecaudado = payments.reduce((acc, p) => acc + Number(p.monto), 0);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Pagos y Cobros</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Historial de transacciones</p>
          </div>
          {(esCoach() || esAdmin()) && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto' }}>
              {showForm ? 'Cancelar' : '+ Registrar Pago'}
            </button>
          )}
        </header>

        {(esCoach() || esAdmin()) && (
          <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', borderStyle: 'dashed' }}>
            <span style={{ fontSize: '2rem' }}>💰</span>
            <div>
              <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Total Recaudado</p>
              <h2 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.75rem' }}>${totalRecaudado.toLocaleString()}</h2>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ marginBottom: '2rem' }}
            >
              <h3 style={{ marginTop: 0 }}>Nuevo Registro de Pago</h3>
              <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Cliente</label>
                  <select
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Monto ($)</label>
                  <input
                    type="number"
                    value={formData.monto}
                    onChange={e => setFormData({ ...formData, monto: e.target.value })}
                    style={inputStyle}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Concepto</label>
                  <input
                    type="text"
                    value={formData.concepto}
                    onChange={e => setFormData({ ...formData, concepto: e.target.value })}
                    style={inputStyle}
                    placeholder="Ej. Mensualidad Mayo"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ gridColumn: '1 / -1' }}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando historial...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>Fecha</th>
                    {!esCliente() && <th style={thStyle}>Cliente</th>}
                    <th style={thStyle}>Concepto</th>
                    <th style={thStyle}>Monto</th>
                    <th style={thStyle}>Estado</th>
                    {(esCoach() || esAdmin()) && <th style={thStyle}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay registros de pagos.</td>
                    </tr>
                  )}
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{new Date(p.fecha).toLocaleDateString()}</td>
                      {!esCliente() && <td style={{ ...tdStyle, fontWeight: 700 }}>{p.client_nombre}</td>}
                      <td style={tdStyle}>{p.concepto}</td>
                      <td style={{ ...tdStyle, fontWeight: 800, color: 'var(--color-primary-dark)' }}>${Number(p.monto).toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: p.estado === 'completado' ? '#dcfce7' : '#fef3c7',
                          color: p.estado === 'completado' ? '#16a34a' : '#d97706'
                        }}>
                          {p.estado.toUpperCase()}
                        </span>
                      </td>
                      {(esCoach() || esAdmin()) && (
                        <td style={tdStyle}>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>Eliminar</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const thStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px', fontSize: '0.9rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' };
const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' };
