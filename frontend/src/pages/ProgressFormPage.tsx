import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

interface PhotoPreview {
  file: File;
  preview: string;
}

export const ProgressFormPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    peso_kg: '',
    porcentaje_grasa: '',
    cintura_cm: '',
    cadera_cm: '',
    pecho_cm: '',
    notas: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [photoFrente, setPhotoFrente] = useState<PhotoPreview | null>(null);
  const [photoEspalda, setPhotoEspalda] = useState<PhotoPreview | null>(null);
  const [photoLateral, setPhotoLateral] = useState<PhotoPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoto = (setter: React.Dispatch<React.SetStateAction<PhotoPreview | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setter({ file, preview });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.peso_kg) {
      toast.error('El peso es obligatorio');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photoFrente) fd.append('foto_frente', photoFrente.file);
      if (photoEspalda) fd.append('foto_espalda', photoEspalda.file);
      if (photoLateral) fd.append('foto_lateral', photoLateral.file);

      await api.post(`/progress/client/${clientId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Registro de avance guardado');
      navigate(`/progress/${clientId}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PhotoInput = ({
    label, preview, onChange, id,
  }: {
    label: string; preview: PhotoPreview | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; id: string;
  }) => (
    <div style={{ textAlign: 'center' }}>
      <label htmlFor={id} style={{ cursor: 'pointer', display: 'block' }}>
        <div style={{
          width: '100%',
          height: '160px',
          borderRadius: '12px',
          border: `2px dashed ${preview ? 'var(--color-primary)' : '#cbd5e1'}`,
          backgroundColor: preview ? '#f0fdf4' : '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.2s',
        }}>
          {preview ? (
            <img src={preview.preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
            </>
          )}
        </div>
      </label>
      <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>{label}</span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 0, marginBottom: '1rem' }}>
            ← Volver
          </button>
          <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>📊 Nuevo Registro de Avance</h1>

          <form onSubmit={handleSubmit}>
            {/* Medidas */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Medidas corporales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Peso (kg) *</label>
                  <input type="number" step="0.1" name="peso_kg" value={formData.peso_kg} onChange={handleChange} placeholder="70.5" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>% Grasa</label>
                  <input type="number" step="0.1" name="porcentaje_grasa" value={formData.porcentaje_grasa} onChange={handleChange} placeholder="15.2" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cintura (cm)</label>
                  <input type="number" step="0.1" name="cintura_cm" value={formData.cintura_cm} onChange={handleChange} placeholder="80" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cadera (cm)</label>
                  <input type="number" step="0.1" name="cadera_cm" value={formData.cadera_cm} onChange={handleChange} placeholder="95" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Pecho (cm)</label>
                  <input type="number" step="0.1" name="pecho_cm" value={formData.pecho_cm} onChange={handleChange} placeholder="100" style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Notas</label>
              <textarea name="notas" value={formData.notas} onChange={handleChange} rows={3} placeholder="Observaciones del coach..." style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
            </div>

            {/* Fotos */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Fotos de progreso</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <PhotoInput label="Frente" preview={photoFrente} onChange={handlePhoto(setPhotoFrente)} id="photo-frente" />
                <PhotoInput label="Espalda" preview={photoEspalda} onChange={handlePhoto(setPhotoEspalda)} id="photo-espalda" />
                <PhotoInput label="Lateral" preview={photoLateral} onChange={handlePhoto(setPhotoLateral)} id="photo-lateral" />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </form>
        </motion.div>
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
  color: '#475569',
};
