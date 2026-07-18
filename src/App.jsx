import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Catalogo from './Catalogo';
import Admin from './Admin';
import Login from './Login';

// Este componente es un "Guardián". Envuelve a los componentes privados.
const RutaProtegida = ({ children, usuario }) => {
  // Si no hay usuario autenticado, lo mandamos al login
  if (!usuario) {
    return <Navigate to="/login" />;
  }
  // Si está autenticado, lo dejamos pasar al componente hijo (el panel)
  return children;
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [revisandoSesion, setRevisandoSesion] = useState(true);

  // useEffect vigila constantemente el estado de autenticación en Firebase
  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setRevisandoSesion(false);
    });

    return () => cancelarSuscripcion();
  }, []);

  // Muestra una pantalla en blanco mientras Firebase nos confirma si hay sesión activa
  if (revisandoSesion) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Catalogo />} />
        <Route path="/login" element={<Login />} />
        
        {/* Ruta Privada (Protegida) */}
        <Route 
          path="/admin" 
          element={
            <RutaProtegida usuario={usuario}>
              <Admin />
            </RutaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;