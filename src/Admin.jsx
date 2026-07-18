import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// 1. Nuevas herramientas para el cierre de sesión y navegación
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [nombre, setNombre] = useState('');
  const [gramaje, setGramaje] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [imagen, setImagen] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [medicamentos, setMedicamentos] = useState([]);
  const [cargandoTabla, setCargandoTabla] = useState(true);

  // 2. Inicializamos la herramienta de navegación
  const navigate = useNavigate();

  const cargarInventario = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "medicamentos"));
      const lista = querySnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));
      setMedicamentos(lista);
      setCargandoTabla(false);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setCargandoTabla(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const guardarMedicamento = async (e) => {
    e.preventDefault(); 
    setGuardando(true);

    try {
      await addDoc(collection(db, "medicamentos"), {
        nombre: nombre,
        gramaje: gramaje,
        presentacion: presentacion,
        imagen: imagen,
        disponible: true 
      });

      setNombre('');
      setGramaje('');
      setPresentacion('');
      setImagen('');
      
      cargarInventario();
      alert("¡Medicamento agregado al inventario con éxito!");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el medicamento.");
    } finally {
      setGuardando(false);
    }
  };

  const toggleDisponibilidad = async (id, estadoActual) => {
    try {
      const referenciaMedicamento = doc(db, "medicamentos", id);
      await updateDoc(referenciaMedicamento, {
        disponible: !estadoActual
      });
      cargarInventario();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const eliminarMedicamento = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este medicamento de forma permanente?");
    if (confirmar) {
      try {
        const referenciaMedicamento = doc(db, "medicamentos", id);
        await deleteDoc(referenciaMedicamento);
        cargarInventario();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el medicamento.");
      }
    }
  };

  // 3. Función para cerrar sesión de forma segura
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      // Tras cerrar sesión, expulsamos al usuario de regreso al catálogo público
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-8">
      
      {/* 4. Modificamos el Header para usar flexbox y alinear el botón a la derecha */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Voluntarios</h1>
          <p className="text-gray-500">Gestión de inventario del Banco de Medicamentos</p>
        </div>
        
        <button 
          onClick={cerrarSesion}
          className="px-5 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors shadow-sm w-fit"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 col-span-1 h-fit">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Agregar Nuevo</h2>
          <form onSubmit={guardarMedicamento} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Sustancia Activa)</label>
              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Paracetamol" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gramaje</label>
              <input type="text" required value={gramaje} onChange={(e) => setGramaje(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. 500mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presentación</label>
              <input type="text" required value={presentacion} onChange={(e) => setPresentacion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Caja con 20 tabletas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruta de Imagen (Opcional)</label>
              <input type="text" value={imagen} onChange={(e) => setImagen(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. /paracetamol.jpg" />
            </div>
            <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
              {guardando ? 'Guardando...' : 'Guardar Medicamento'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Inventario Actual</h2>
          {cargandoTabla ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-blue-500 animate-pulse font-medium">Cargando inventario de Firebase...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 text-sm font-semibold text-gray-600">Medicamento</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Presentación</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicamentos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-gray-500">No hay medicamentos registrados.</td>
                  </tr>
                ) : (
                  medicamentos.map((med) => (
                    <tr key={med.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-gray-800">{med.nombre}</p>
                        <p className="text-xs text-blue-600">{med.gramaje}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{med.presentacion}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${med.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {med.disponible ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button onClick={() => toggleDisponibilidad(med.id, med.disponible)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${med.disponible ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {med.disponible ? 'Marcar Agotado' : 'Marcar Disponible'}
                        </button>
                        <button onClick={() => eliminarMedicamento(med.id)} className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default Admin;