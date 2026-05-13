import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ClientDetailPage } from './pages/ClientDetailPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        
        <Route path="/clients/new" element={
          <PrivateRoute>
            <ClientFormPage />
          </PrivateRoute>
        } />
        
        <Route path="/clients/:id" element={
          <PrivateRoute>
            <ClientDetailPage />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
