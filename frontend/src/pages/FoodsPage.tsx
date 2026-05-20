import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export const FoodsPage = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', calorias_por_100g: '', proteinas: '', carbohidratos: '', grasas: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchFoods = async (query = '') => {
    try {
      const res = await api.get(`/foods?query=${query}`);
      setFoods(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods(search);
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/foods', {
        ...formData,
        calorias_por_100g: parseFloat(formData.calorias_por_100g),
        proteinas: parseFloat(formData.proteinas),
        carbohidratos: parseFloat(formData.carbohidratos),
        grasas: parseFloat(formData.grasas),
      });
      toast.success('Alimento creado exitosamente');
      setShowForm(false);
      setFormData({ nombre: '', calorias_por_100g: '', proteinas: '', carbohidratos: '', grasas: '' });
      fetchFoods(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el alimento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ color: 'var(--color-primary)' }}>Base de Alimentos</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto' }}>
            {showForm ? 'Cancelar' : '+ Nuevo Alimento'}
          </button>
        </header>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Agregar Alimento Global</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <input required type="text" name="nombre" placeholder="Nombre (ej. Manzana)" value={formData.nombre} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input required type="number" step="0.1" name="calorias_por_100g" placeholder="Calorías / 100g" value={formData.calorias_por_100g} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input required type="number" step="0.1" name="proteinas" placeholder="Proteínas (g)" value={formData.proteinas} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input required type="number" step="0.1" name="carbohidratos" placeholder="Carbohidratos (g)" value={formData.carbohidratos} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <input required type="number" step="0.1" name="grasas" placeholder="Grasas (g)" value={formData.grasas} onChange={handleChange} style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc' }} />
              <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <span className="spinner"></span> : 'Guardar'}</button>
            </form>
          </motion.div>
        )}

        <input 
          type="text" 
          placeholder="Buscar alimento por nombre..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--border-radius)', border: '1px solid #ccc', marginBottom: '2rem' }} 
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {foods.map((food, i) => (
            <motion.div key={food.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="card interactive">
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{food.nombre}</h3>
              <p style={{ color: 'var(--text-secondary)' }}><strong>{food.calorias_por_100g} kcal</strong> / 100g</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#e91e63', fontWeight: 600 }}>Prot: {food.proteinas}g</span>
                <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>Carb: {food.carbohidratos}g</span>
                <span style={{ color: '#ff9800', fontWeight: 600 }}>Grasa: {food.grasas}g</span>
              </div>
            </motion.div>
          ))}
          {foods.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No se encontraron alimentos en la base de datos.</p>}
        </div>
      </motion.div>
    </>
  );
};
