import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { FoodsPage } from './pages/FoodsPage';
import { ExercisesPage } from './pages/ExercisesPage';
// Módulo 1 — Contador de Calorías
import { FoodLogPage } from './pages/FoodLogPage';
// Módulo 2 — Rutinas
import { RoutinesPage } from './pages/RoutinesPage';
import { RoutineDetailPage } from './pages/RoutineDetailPage';
import { MyRoutinePage } from './pages/MyRoutinePage';
// Módulo 3 — Avance Quincenal
import { ProgressPage } from './pages/ProgressPage';
import { ProgressFormPage } from './pages/ProgressFormPage';
import { ProgressComparePage } from './pages/ProgressComparePage';
import { CommunityPage } from './pages/CommunityPage';
import { CoachProfilePage } from './pages/CoachProfilePage';
import { PaymentsPage } from './pages/PaymentsPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {



  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/clients/new" element={<PrivateRoute><ClientFormPage /></PrivateRoute>} />
          <Route path="/clients/:id" element={<PrivateRoute><ClientDetailPage /></PrivateRoute>} />
          <Route path="/foods" element={<PrivateRoute><FoodsPage /></PrivateRoute>} />
          <Route path="/exercises" element={<PrivateRoute><ExercisesPage /></PrivateRoute>} />

          {/* Módulo 1 — Contador de Calorías */}
          <Route path="/food-log" element={<PrivateRoute><FoodLogPage /></PrivateRoute>} />

          {/* Módulo 2 — Rutinas */}
          <Route path="/routines" element={<PrivateRoute><RoutinesPage /></PrivateRoute>} />
          <Route path="/routines/:id" element={<PrivateRoute><RoutineDetailPage /></PrivateRoute>} />
          <Route path="/my-routine" element={<PrivateRoute><MyRoutinePage /></PrivateRoute>} />

          {/* Módulo 3 — Avance Quincenal */}
          <Route path="/progress/:clientId" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
          <Route path="/progress/new/:clientId" element={<PrivateRoute><ProgressFormPage /></PrivateRoute>} />
          <Route path="/progress/compare" element={<PrivateRoute><ProgressComparePage /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
          <Route path="/my-coach" element={<PrivateRoute><CoachProfilePage /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" />} />



        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
