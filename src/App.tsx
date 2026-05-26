import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import BuscarOportunidades from "./pages/BuscarOportunidades";
import Documentos from "./pages/Documentos";
import Perfil from "./pages/Perfil";
import MisPostulaciones from "./pages/MisPostulaciones";
import Asesor from "./pages/Asesor";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Routes directly inside MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/perfil"
          element={
            <MainLayout>
              <Perfil />
            </MainLayout>
          }
        />
        <Route
          path="/postulaciones"
          element={
            <MainLayout>
              <MisPostulaciones />
            </MainLayout>
          }
        />
        <Route
          path="/buscar"
          element={
            <MainLayout>
              <BuscarOportunidades />
            </MainLayout>
          }
        />
        <Route
          path="/documentos"
          element={
            <MainLayout>
              <Documentos />
            </MainLayout>
          }
        />
        <Route
          path="/asesor"
          element={
            <MainLayout>
              <Asesor />
            </MainLayout>
          }
        />

        {/* Login Route without Sidebar */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

