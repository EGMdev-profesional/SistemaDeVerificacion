import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { PracticanteLayout } from './components/PracticanteLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Practicantes } from './pages/admin/Practicantes';
import { Asistencias } from './pages/admin/Asistencias';
import { Reportes } from './pages/admin/Reportes';
import { Administradores } from './pages/admin/Administradores';
import { Horarios } from './pages/admin/Horarios';
import { MiQR } from './pages/practicante/MiQR';
import { MiPerfil } from './pages/practicante/MiPerfil';
import { MiHistorial } from './pages/practicante/MiHistorial';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.rol === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/practicante/qr" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas de Administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="practicantes" element={<Practicantes />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="asistencias" element={<Asistencias />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="administradores" element={<Administradores />} />
          </Route>

          {/* Rutas de Practicante */}
          <Route
            path="/practicante"
            element={
              <ProtectedRoute requiredRole="practicante">
                <PracticanteLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/practicante/qr" replace />} />
            <Route path="qr" element={<MiQR />} />
            <Route path="perfil" element={<MiPerfil />} />
            <Route path="historial" element={<MiHistorial />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
