import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

function App () {
  const ProtectedLayout = ({ children }) => (
    <div className="protected-layout-container">
      <Header /> {/* <-- Añade la cabecera aquí */}
      <div className="main-content">
        {children}
      </div>
      <BottomNav />
    </div>
  );
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
