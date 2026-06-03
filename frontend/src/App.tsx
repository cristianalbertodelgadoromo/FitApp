import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { FoodsPage } from './pages/FoodsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { FoodLogPage } from './pages/FoodLogPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { RoutineDetailPage } from './pages/RoutineDetailPage';
import { MyRoutinePage } from './pages/MyRoutinePage';
import { ProgressPage } from './pages/ProgressPage';
import { ProgressFormPage } from './pages/ProgressFormPage';
import { ProgressComparePage } from './pages/ProgressComparePage';
import { CommunityPage } from './pages/CommunityPage';
import { CoachProfilePage } from './pages/CoachProfilePage';
import { PaymentsPage } from './pages/PaymentsPage';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Cargando sistema...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />;

  return children;
};

const ProgressRedirect = () => {
  const { user } = useAuth();
  if (user?.rol === 'client') {
    return <Navigate to={`/progress/${user.id}`} replace />;
  }
  if (user?.rol === 'coach' || user?.rol === 'admin') {
    return <Navigate to="/clients" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/foods" element={<PrivateRoute roles={['admin', 'nutritionist', 'coach']}><FoodsPage /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute roles={['admin', 'coach']}><ExercisesPage /></PrivateRoute>} />
            <Route path="/food-log" element={<FoodLogPage />} />
            <Route path="/routines" element={<PrivateRoute roles={['admin', 'coach', 'client']}><RoutinesPage /></PrivateRoute>} />
            <Route path="/routines/:id" element={<PrivateRoute roles={['admin', 'coach', 'client']}><RoutineDetailPage /></PrivateRoute>} />
            <Route path="/my-routine" element={<PrivateRoute roles={['client']}><MyRoutinePage /></PrivateRoute>} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/my-coach" element={<PrivateRoute roles={['client']}><CoachProfilePage /></PrivateRoute>} />
            <Route path="/payments" element={<PaymentsPage />} />

            {/* Rutas agregadas en Fase 1 */}
            <Route path="/clients/new" element={<PrivateRoute roles={['admin', 'coach']}><ClientFormPage /></PrivateRoute>} />
            <Route path="/clients/:id" element={<PrivateRoute roles={['admin', 'coach', 'client']}><ClientDetailPage /></PrivateRoute>} />
            <Route path="/progress" element={<PrivateRoute roles={['admin', 'coach', 'client']}><ProgressRedirect /></PrivateRoute>} />
            <Route path="/progress/:clientId" element={<PrivateRoute roles={['admin', 'coach', 'client']}><ProgressPage /></PrivateRoute>} />
            <Route path="/progress/new/:clientId" element={<PrivateRoute roles={['admin', 'coach', 'client']}><ProgressFormPage /></PrivateRoute>} />
            <Route path="/progress/compare" element={<PrivateRoute roles={['admin', 'coach', 'client']}><ProgressComparePage /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
