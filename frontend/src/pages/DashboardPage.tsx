import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

// Clean SVG Icons for Modules
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconDumbbell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6.5 6.5 11 11M6.5 17.5l11-11M3 21h18M3 3h18" />
  </svg>
);

const IconApple = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const IconBook = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconTrending = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconCreditCard = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const DashboardPage = () => {
  const { user, esAdmin, esCoach, esCliente } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    usersCount: 0,
    foodsCount: 0,
    exercisesCount: 0,
    routinesCount: 0
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay usuario cargado aún, no hacemos fetch
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const meRes = await api.get('/auth/me');
        setProfileData(meRes.data.user || meRes.data.coach || meRes.data.client);

        if (user.rol === 'admin') {
          const [usersRes, foodsRes, exercisesRes, routinesRes] = await Promise.all([
            api.get('/users'),
            api.get('/foods'),
            api.get('/exercises'),
            api.get('/routines')
          ]);
          setSystemStats({
            usersCount: usersRes.data.data?.length || 0,
            foodsCount: foodsRes.data.data?.length || 0,
            exercisesCount: exercisesRes.data.data?.length || 0,
            routinesCount: routinesRes.data.data?.length || 0
          });
        } else if (user.rol === 'coach') {
          const clientsRes = await api.get('/clients');
          setClients(clientsRes.data.data || []);
        } else if (user.rol === 'client') {
          // Obtener datos del cliente actual (calorías, avance)
          const today = new Date().toISOString().split('T')[0];
          const [foodLogsRes, progressRes, routineRes] = await Promise.all([
            api.get(`/food-logs/${meRes.data.user.id}?fecha=${today}`).catch(() => ({ data: { data: { total_calorias: 0, objetivo_calorico: 2000 } } })),
            api.get(`/progress/${meRes.data.user.id}`).catch(() => ({ data: { data: [] } })),
            api.get(`/routines/client/${meRes.data.user.id}`).catch(() => ({ data: { data: null } }))
          ]);
          
          setProfileData((prev: any) => ({
            ...prev,
            totalCaloriasHoy: foodLogsRes.data.data?.total_calorias || 0,
            objetivoCalorico: foodLogsRes.data.data?.objetivo_calorico || 2000,
            progressRecordsCount: progressRes.data.data?.length || 0,
            activeRoutine: routineRes.data.data || null
          }));
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const filteredClients = clients.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

  // ----------------------------------------------------
  // SPINNER DE CARGA
  // ----------------------------------------------------
  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Cargando Panel de Control...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA PARA ADMINISTRADOR
  // ----------------------------------------------------
  if (esAdmin()) {
    const modules = [
      { name: 'Gestión de Usuarios', desc: 'Monitoreo, activación y desactivación de coaches, atletas y nutriólogos.', path: '/dashboard', role: 'Administración', icon: <IconShield /> },
      { name: 'Catálogo de Alimentos', desc: 'Buscador de alimentos, creación y edición de macronutrientes.', path: '/foods', role: 'Nutrición / Catálogo', icon: <IconApple /> },
      { name: 'Catálogo de Ejercicios', desc: 'Banco de ejercicios, descripciones detalladas y categorías.', path: '/exercises', role: 'Entrenamiento / Catálogo', icon: <IconDumbbell /> },
      { name: 'Diario de Comidas', desc: 'Ingreso diario de desayunos, almuerzos, cenas y snacks.', path: '/food-log', role: 'Atleta / Módulo 1', icon: <IconBook /> },
      { name: 'Rutinas de Entrenamiento', desc: 'Diseño, series, repeticiones y asignación a clientes.', path: '/routines', role: 'Entrenador / Módulo 2', icon: <IconDumbbell /> },
      { name: 'Mi Rutina Activa', desc: 'Visualización de entrenamientos asignados en tiempo real.', path: '/my-routine', role: 'Atleta / Módulo 2', icon: <IconDumbbell /> },
      { name: 'Avance Quincenal', desc: 'Historial de registros corporales, peso e índice de masa corporal.', path: '/progress/3', role: 'Atleta / Módulo 3', icon: <IconTrending /> },
      { name: 'Comparador de Avance', desc: 'Contraste detallado de medidas físicas e IMC entre fechas.', path: '/progress/compare?r1=1&r2=2', role: 'Atleta / Módulo 3', icon: <IconTrending /> },
      { name: 'Comunidad FitApp', desc: 'Muro social interactivo de entrenamientos y nutrición.', path: '/community', role: 'Comunidad', icon: <IconUsers /> },
      { name: 'Planes de Pagos', desc: 'Historial de suscripciones, estados de cuenta y facturación.', path: '/payments', role: 'Financiero', icon: <IconCreditCard /> }
    ];

    return (
      <>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}
        >
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>Consola de Administrador</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Control centralizado de todos los módulos y servicios de FitApp</p>
            </div>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
              SYSADMIN MODE
            </div>
          </div>

          {/* Estadísticas de la Base de Datos */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Usuarios Totales</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>
                <CountUp end={systemStats.usersCount} duration={1.2} />
              </div>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Alimentos en Catálogo</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#3b82f6', margin: '8px 0' }}>
                <CountUp end={systemStats.foodsCount} duration={1.2} />
              </div>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Ejercicios Registrados</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', margin: '8px 0' }}>
                <CountUp end={systemStats.exercisesCount} duration={1.2} />
              </div>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Rutinas Activas</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#8b5cf6', margin: '8px 0' }}>
                <CountUp end={systemStats.routinesCount} duration={1.2} />
              </div>
            </div>
          </section>

          {/* Grilla Completa de Módulos */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 800 }}>Módulos del Ecosistema FitApp</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {modules.map((m, index) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.04)' }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Link to={m.path} style={{ color: 'inherit', textDecoration: 'none', height: '100%' }}>
                    <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {m.role}
                          </span>
                          {m.icon}
                        </div>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', marginTop: 0 }}>
                          {m.name}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                          {m.desc}
                        </p>
                      </div>
                      <div style={{ marginTop: '16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Acceder al módulo →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </>
    );
  }

  // ----------------------------------------------------
  // VISTA PARA ENTRENADOR (COACH)
  // ----------------------------------------------------
  if (esCoach()) {
    return (
      <>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
              Hola, {profileData?.nombre || 'Coach'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Panel de administración de tus atletas asesorados</p>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <h3 style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Total Clientes</h3>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: '12px 0' }}>
                <CountUp end={clients.length} duration={1.5} />
              </div>
            </div>

            <div className="card" style={{ padding: '32px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ marginBottom: '16px', marginTop: 0, fontSize: '1.1rem', fontWeight: 700 }}>Gestión de Atletas</h3>
              <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, padding: '12px', minWidth: '180px', borderRadius: '12px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
                <button onClick={() => navigate('/clients/new')} className="btn-primary" style={{ width: 'auto', borderRadius: '12px', padding: '12px 20px' }}>
                  + Agregar Cliente
                </button>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 800 }}>Mis Atletas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/clients/${client.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block', height: '100%' }}>
                    <div className="card interactive" style={{ padding: '24px', cursor: 'pointer', height: '100%', border: '1px solid var(--color-border)' }}>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px 0' }}>{client.nombre}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4' }}>
                        <strong>Objetivo:</strong> {client.objetivo || 'No definido'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                          Altura: {client.altura_cm ? `${client.altura_cm} cm` : '--'}
                        </span>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                          Peso: {client.peso_kg ? `${client.peso_kg} kg` : '--'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filteredClients.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1/-1' }}>No hay atletas asignados o que coincidan con la búsqueda.</p>
              )}
            </div>
          </section>
        </motion.div>
      </>
    );
  }

  // ----------------------------------------------------
  // VISTA PARA CLIENTE (ATLETA)
  // ----------------------------------------------------
  if (esCliente()) {
    const progresoPorcentaje = Math.min(100, Math.round(((profileData?.totalCaloriasHoy || 0) / (profileData?.objetivoCalorico || 2000)) * 100));

    return (
      <>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
              ¡Hola, {profileData?.nombre || 'Atleta'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Tu resumen físico y de rendimiento para hoy</p>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Tarjeta de Nutrición */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Seguimiento Calórico</h3>
                <IconApple />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>
                {profileData?.totalCaloriasHoy || 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {profileData?.objetivoCalorico || 2000} kcal</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ width: `${progresoPorcentaje}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
              <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Has consumido el {progresoPorcentaje}% de tu objetivo diario.
              </p>
              <Link to="/food-log" style={{ display: 'block', marginTop: '20px', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Registrar comidas →
              </Link>
            </div>

            {/* Tarjeta de Rutina */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Rutina de Entrenamiento</h3>
                <IconDumbbell />
              </div>
              {profileData?.activeRoutine ? (
                <div>
                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {profileData.activeRoutine.nombre}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Asignada por tu coach personal.
                  </p>
                </div>
              ) : (
                <p style={{ margin: '12px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Aún no tienes rutinas activas asignadas por tu coach.
                </p>
              )}
              <Link to="/my-routine" style={{ display: 'block', marginTop: '20px', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                Ver mis entrenamientos →
              </Link>
            </div>

            {/* Tarjeta de Avance */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Registros de Avance</h3>
                <IconTrending />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6', margin: '8px 0' }}>
                {profileData?.progressRecordsCount || 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>mediciones</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Mantén tus mediciones al día para ajustar tus macros y rutinas.
              </p>
              <Link to={`/progress/${profileData?.id}`} style={{ display: 'block', marginTop: '20px', fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 700, textDecoration: 'none' }}>
                Ver evolución e historial →
              </Link>
            </div>
          </section>
        </motion.div>
      </>
    );
  }

  // ----------------------------------------------------
  // VISTA POR DEFECTO / NUTRICIONISTA / CARGA FINAL
  // ----------------------------------------------------
  return (
    <>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
            Bienvenido, {profileData?.nombre || user?.nombre || 'Usuario'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Panel de herramientas disponibles</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Link to="/foods" style={{ color: 'inherit', textDecoration: 'none' }}>
            <div className="card interactive" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--color-border)' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <IconApple />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Catálogo de Alimentos</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administrar macros y opciones</p>
              </div>
            </div>
          </Link>
          <Link to="/community" style={{ color: 'inherit', textDecoration: 'none' }}>
            <div className="card interactive" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--color-border)' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <IconUsers />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Muro de la Comunidad</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interactúa con otros miembros</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </>
  );
};
