import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import IOSInstallHint from './components/IOSInstallHint';

function App() {
  const ProtectedLayout = ({ children }) => (
    <div className="protected-layout-container">
      <Header />
      <div className="main-content">
        {children}
      </div>
      <BottomNav />
    </div>
  );

  return (
    <ThemeProvider>
      <IOSInstallHint />
      <Routes>
        {/* Raíz — muestra el login directamente */}
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Categories />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Transactions />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Cualquier ruta desconocida → raíz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
