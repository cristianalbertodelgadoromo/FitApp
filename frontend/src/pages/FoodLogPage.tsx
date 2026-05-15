import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface FoodItem {
  id: number;
  food_id: number;
  food_nombre: string;
  cantidad_g: number;
  calorias_consumidas: number;
  tipo_comida: string;
}

interface FoodGrupo {
  tipo_comida: string;
  items: FoodItem[];
  subtotal_calorias: number;
}

interface DayData {
  fecha: string;
  client_id: number;
  objetivo_calorico: number;
  total_calorias: number;
  porcentaje: number;
  grupos: FoodGrupo[];
}

interface FoodCatalogItem {
  id: number;
  nombre: string;
  calorias_por_100g: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

const TIPO_ICONS: Record<string, string> = {
  Desayuno: '🌅',
  Almuerzo: '☀️',
  Cena: '🌙',
  Snack: '🍎',
};

const TIPO_COLORS: Record<string, string> = {
  Desayuno: '#f59e0b',
  Almuerzo: '#10b981',
  Cena: '#6366f1',
  Snack: '#ec4899',
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function displayDate(str: string): string {
  const date = parseDate(str);
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export const FoodLogPage = () => {
  const { user } = useAuth();
  const [fecha, setFecha] = useState<string>(formatDate(new Date()));
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState('Desayuno');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogItems, setCatalogItems] = useState<FoodCatalogItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodCatalogItem | null>(null);
  const [cantidad, setCantidad] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientId = user?.id;

  const fetchDayData = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/food-logs/${clientId}?fecha=${fecha}`);
      setDayData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar el diario');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, fecha]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/foods?query=${catalogSearch}`);
        setCatalogItems(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  const navigateDate = (delta: number) => {
    const current = parseDate(fecha);
    current.setDate(current.getDate() + delta);
    setFecha(formatDate(current));
  };

  const openModal = (tipo: string) => {
    setModalTipo(tipo);
    setSelectedFood(null);
    setCantidad('100');
    setCatalogSearch('');
    setCatalogItems([]);
    setShowModal(true);
  };

  const handleAddFood = async () => {
    if (!selectedFood || !clientId) return;
    setIsSubmitting(true);
    try {
      await api.post('/food-logs', {
        client_id: clientId,
        fecha,
        tipo_comida: modalTipo,
        food_id: selectedFood.id,
        cantidad_g: parseFloat(cantidad),
      });
      toast.success(`${selectedFood.nombre} añadido a ${modalTipo}`);
      setShowModal(false);
      fetchDayData();
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar alimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logId: number) => {
    try {
      await api.delete(`/food-logs/${logId}`);
      toast.success('Alimento eliminado');
      fetchDayData();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar');
    }
  };

  const previewCal = selectedFood
    ? parseFloat(((parseFloat(cantidad) * selectedFood.calorias_por_100g) / 100).toFixed(1))
    : 0;

  const progressPct = dayData ? Math.min(dayData.porcentaje, 100) : 0;
  const progressColor = progressPct >= 100 ? '#ef4444' : progressPct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Header — navegación de fecha */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => navigateDate(-1)}
            style={navBtnStyle}
            title="Día anterior"
          >
            ‹
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--color-primary)' }}>
              Diario Nutricional
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {displayDate(fecha)}
            </p>
          </div>
          <button
            onClick={() => navigateDate(1)}
            disabled={fecha === formatDate(new Date())}
            style={{ ...navBtnStyle, opacity: fecha === formatDate(new Date()) ? 0.3 : 1 }}
            title="Día siguiente"
          >
            ›
          </button>
        </motion.div>

        {/* Barra de calorías */}
        {dayData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ marginBottom: '2rem', padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                🔥 {dayData.total_calorias} kcal consumidas
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                objetivo: {dayData.objetivo_calorico} kcal
              </span>
            </div>
            <div style={{
              height: '14px',
              borderRadius: '99px',
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: '99px',
                  backgroundColor: progressColor,
                  boxShadow: `0 0 8px ${progressColor}55`,
                }}
              />
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {dayData.porcentaje}% del objetivo diario
              {dayData.porcentaje >= 100 && ' · ⚠️ Objetivo superado'}
            </p>
          </motion.div>
        )}

        {/* Secciones por tipo de comida */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Cargando diario...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {['Desayuno', 'Almuerzo', 'Cena', 'Snack'].map((tipo) => {
              const grupo = dayData?.grupos.find((g) => g.tipo_comida === tipo);
              const items = grupo?.items || [];
              const subtotal = grupo?.subtotal_calorias || 0;
              const color = TIPO_COLORS[tipo];
              const icon = TIPO_ICONS[tipo];

              return (
                <motion.div
                  key={tipo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '1.5rem',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        backgroundColor: `${color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>{icon}</span>
                      <div>
                        <h3 style={{ margin: 0, color: color }}>{tipo}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {subtotal} kcal
                        </span>
                      </div>
                    </div>
                    <button
                      id={`btn-add-${tipo.toLowerCase()}`}
                      onClick={() => openModal(tipo)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--border-radius)',
                        border: `1px solid ${color}`,
                        backgroundColor: 'transparent',
                        color: color,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      + Agregar
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      Sin alimentos registrados
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.food_nombre}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                              {item.cantidad_g}g
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 700, color: color }}>
                              {Number(item.calorias_consumidas).toFixed(0)} kcal
                            </span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Eliminar"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                fontSize: '1.1rem',
                                lineHeight: 1,
                                padding: '2px 4px',
                                borderRadius: '4px',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal agregar alimento */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 999, padding: '1rem',
            }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>
                  {TIPO_ICONS[modalTipo]} Agregar a {modalTipo}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
              </div>

              {/* Selector de tipo */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['Desayuno', 'Almuerzo', 'Cena', 'Snack'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setModalTipo(t)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '99px',
                      border: `1px solid ${modalTipo === t ? TIPO_COLORS[t] : '#e2e8f0'}`,
                      backgroundColor: modalTipo === t ? `${TIPO_COLORS[t]}18` : 'transparent',
                      color: modalTipo === t ? TIPO_COLORS[t] : '#64748b',
                      cursor: 'pointer',
                      fontWeight: modalTipo === t ? 700 : 400,
                      fontSize: '0.85rem',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar alimento..."
                value={catalogSearch}
                onChange={(e) => { setCatalogSearch(e.target.value); setSelectedFood(null); }}
                style={inputStyle}
                autoFocus
              />

              {/* Lista de resultados */}
              {!selectedFood && catalogItems.length > 0 && (
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  {catalogItems.slice(0, 8).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => { setSelectedFood(food); setCatalogSearch(food.nombre); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.65rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ fontWeight: 500 }}>{food.nombre}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {food.calorias_por_100g} kcal/100g
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Cantidad y preview */}
              {selectedFood && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #bbf7d0',
                  }}>
                    <strong>{selectedFood.nombre}</strong>
                    <span style={{ color: '#16a34a', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                      {selectedFood.calorias_por_100g} kcal/100g
                    </span>
                  </div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Cantidad (gramos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    style={inputStyle}
                  />
                  {parseFloat(cantidad) > 0 && (
                    <p style={{ margin: '0.5rem 0 1rem', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                      ≈ {previewCal} kcal
                    </p>
                  )}
                </motion.div>
              )}

              <button
                onClick={handleAddFood}
                disabled={!selectedFood || !cantidad || isSubmitting}
                className="btn-primary"
                style={{ marginTop: '0.5rem', opacity: (!selectedFood || !cantidad) ? 0.5 : 1 }}
              >
                {isSubmitting ? 'Guardando...' : 'Agregar alimento'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const navBtnStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  fontSize: '1.8rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  color: 'var(--color-primary)',
  transition: 'all 0.2s',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '0.75rem',
};
