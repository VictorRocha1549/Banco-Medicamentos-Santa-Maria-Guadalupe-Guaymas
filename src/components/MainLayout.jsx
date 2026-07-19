import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function MainLayout() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  // Escuchamos a Firebase para saber si debemos mostrar "Ingresar" o "Panel Admin"
  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => cancelarSuscripcion();
  }, []);

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* === BARRA DE NAVEGACIÓN UNIVERSAL === */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="font-bold text-blue-600 text-xl tracking-tight">
            <Link to="/">💊 BancoMed</Link>
          </div>

          <div className="flex items-center space-x-1 md:space-x-3">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              Catálogo
            </Link>

            {usuario ? (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                  Panel Admin
                </Link>
                <button 
                  onClick={cerrarSesion} 
                  className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors ml-2"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors ml-2">
                Ingresar
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* === CONTENEDOR DINÁMICO === */}
      {/* Todo lo que esté dentro de <Outlet /> cambiará sin recargar la página */}
      <main className="grow">
        <Outlet />
      </main>

    </div>
  );
}