import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Catalogo from './Catalogo';
import Admin from './Admin';
import Login from './Login';
import { MainLayout } from './components/MainLayout'; // Importamos el Layout
import { AsignarCaja } from './components/AsignarCaja';

const RutaProtegida = ({ children, usuario }) => {
  if (!usuario) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [revisandoSesion, setRevisandoSesion] = useState(true);

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setRevisandoSesion(false);
    });

    return () => cancelarSuscripcion();
  }, []);

  if (revisandoSesion) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin" 
            element={
              <RutaProtegida usuario={usuario}>
                <Admin />
              </RutaProtegida>
            } 
          />

          {/* <-- NUEVA RUTA PROTEGIDA PARA EL ALMACÉN --> */}
          <Route 
            path="/admin/asignar-caja" 
            element={
              <RutaProtegida usuario={usuario}>
                <AsignarCaja />
              </RutaProtegida>
            } 
          />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;