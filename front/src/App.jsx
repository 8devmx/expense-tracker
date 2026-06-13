import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import IOSInstallHint from './components/IOSInstallHint';

function App() {
  const ProtectedLayout = ({ children }) => (
    <div className="flex flex-col min-h-screen bg-gradient overflow-x-hidden">
      <Header />
      <main className="flex-1 px-5 lg:px-10 py-8 lg:py-12 pb-32 max-w-3xl lg:max-w-6xl w-full mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );

  return (
    <ThemeProvider>
      <UserProvider>
        <IOSInstallHint />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><ProtectedLayout><Categories /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><ProtectedLayout><Transactions /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProtectedLayout><Settings /></ProtectedLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
