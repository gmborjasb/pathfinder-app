import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import BuscarOportunidades from "./pages/BuscarOportunidades";
import Documentos from "./pages/Documentos";
import Perfil from "./pages/Perfil";
import MisPostulaciones from "./pages/MisPostulaciones";
import Asesor from "./pages/Asesor";
import GenerarCV from "./pages/GenerarCV";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // If loading user session, show simple premium spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-text-secondary animate-pulse">Cargando Pathfinder...</p>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes directly inside MainLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Perfil />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/postulaciones"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MisPostulaciones />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/buscar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BuscarOportunidades />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Documentos />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/asesor"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Asesor />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cv"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GenerarCV />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Login Route without Sidebar */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
