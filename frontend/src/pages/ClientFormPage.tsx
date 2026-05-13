import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ClientFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    peso: '',
    altura: '',
    objetivo: '',
    porcentaje_grasa: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePreviewIMC = () => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura);
    if (peso > 0 && altura > 0) {
      return (peso / Math.pow(altura / 100, 2)).toFixed(2);
    }
    return '--';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clients', {
        nombre: formData.nombre,
        telefono: formData.telefono,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivo: formData.objetivo,
        porcentaje_grasa: formData.porcentaje_grasa ? parseFloat(formData.porcentaje_grasa) : null
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error al crear el cliente');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-secondary)', borderRadius: 'var(--border-radius)', color: 'var(--text-primary)' }}>← Volver</button>
      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Registrar Nuevo Cliente</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nombre Completo *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Peso (kg)</label>
              <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Altura (cm)</label>
              <input type="number" step="0.1" name="altura" value={formData.altura} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>IMC Estimado: </span>
                <strong style={{ color: 'var(--color-secondary)' }}>{calculatePreviewIMC()}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>% de Grasa</label>
              <input type="number" step="0.1" name="porcentaje_grasa" value={formData.porcentaje_grasa} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: '2 1 300px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Objetivo Principal</label>
              <input type="text" name="objetivo" value={formData.objetivo} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Guardar Cliente</button>
        </form>
      </div>
    </div>
  );
};
