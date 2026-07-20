import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export function DirectorioPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "pacientes"));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPacientes(lista);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.telefono?.includes(busqueda)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Directorio de Pacientes</h1>
        <p className="text-gray-500">Consulta perfiles, historial de recetas y medicamentos pendientes.</p>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..." 
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-600">Nombre</th>
              <th className="p-4 text-sm font-bold text-gray-600">Teléfono</th>
              <th className="p-4 text-sm font-bold text-gray-600">Edad</th>
              <th className="p-4 text-sm font-bold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando directorio...</td></tr>
            ) : pacientesFiltrados.map(p => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{p.nombre}</td>
                <td className="p-4 text-gray-600">{p.telefono}</td>
                <td className="p-4 text-gray-600">{p.edad} años</td>
                <td className="p-4">
                  <Link to={`/admin/pacientes/${p.telefono}`} className="text-purple-600 font-bold hover:underline">Ver Perfil</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}