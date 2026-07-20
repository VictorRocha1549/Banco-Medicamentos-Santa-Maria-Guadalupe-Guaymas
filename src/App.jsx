import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Catalogo from './Catalogo';
import Admin from './Admin';
import Login from './Login';
import { MainLayout } from './components/MainLayout';
import { AsignarCaja } from './components/AsignarCaja';
import { PanelInventario } from './components/PanelInventario';
import { SurtirReceta } from './components/SurtirReceta';
import { DirectorioPacientes } from './components/DirectorioPacientes';
import { DetallePaciente } from './components/DetallePaciente';
import { GestionCajas } from './components/GestionCajas';
import { SessionManager } from './components/SessionManager';
import { Reportes } from './components/Reportes';

const RutaProtegida = ({ children, usuario }) => {
  if (!usuario) return <Navigate to="/login" />;
  return <SessionManager>{children}</SessionManager>;
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [revisandoSesion, setRevisandoSesion] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setRevisandoSesion(false);
    });
    return () => cancelar();
  }, []);

  if (revisandoSesion) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={
            <RutaProtegida usuario={usuario}><Admin /></RutaProtegida>
          } />
          <Route path="/admin/inventario" element={
            <RutaProtegida usuario={usuario}><PanelInventario /></RutaProtegida>
          } />
          <Route path="/admin/surtir-receta" element={
            <RutaProtegida usuario={usuario}><SurtirReceta /></RutaProtegida>
          } />
          <Route path="/admin/pacientes" element={
            <RutaProtegida usuario={usuario}><DirectorioPacientes /></RutaProtegida>
          } />
          <Route path="/admin/pacientes/:telefono" element={
            <RutaProtegida usuario={usuario}><DetallePaciente /></RutaProtegida>
          } />
          <Route path="/admin/asignar-caja" element={
            <RutaProtegida usuario={usuario}><AsignarCaja /></RutaProtegida>
          } />
          <Route path="/admin/cajas" element={
            <RutaProtegida usuario={usuario}><GestionCajas /></RutaProtegida>
          } />
          <Route path="/admin/reportes" element={
            <RutaProtegida usuario={usuario}><Reportes /></RutaProtegida>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;