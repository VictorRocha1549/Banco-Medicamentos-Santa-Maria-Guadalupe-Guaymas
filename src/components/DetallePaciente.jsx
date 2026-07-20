import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function DetallePaciente() {
  const { telefono } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  
  // Estado para el Modal
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const pSnap = await getDoc(doc(db, "pacientes", telefono));
      if (pSnap.exists()) setPaciente(pSnap.data());

      const rQuery = query(collection(db, "recetas"), where("telefono_paciente", "==", telefono));
      const rSnap = await getDocs(rQuery);
      setRecetas(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const fQuery = query(collection(db, "lista_espera"), where("telefono_paciente", "==", telefono), where("estado", "==", "pendiente"));
      const fSnap = await getDocs(fQuery);
      setFaltantes(fSnap.docs.map(d => d.data()));
    };
    cargarDatos();
  }, [telefono]);

  if (!paciente) return <div className="p-8 text-center">Cargando perfil...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link to="/admin/pacientes" className="text-gray-500 hover:text-gray-800">← Volver al directorio</Link>
      
      <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">{paciente.nombre}</h1>
        <p className="opacity-80">Tel: {paciente.telefono} • Edad: {paciente.edad} • {paciente.direccion}</p>
      </div>

      {/* HISTORIAL DE RECETAS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-bold text-gray-800 mb-4 text-xl">Historial de Recetas</h2>
        <div className="space-y-4">
          {recetas.map((r, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:shadow-sm transition-shadow">
              <div>
                <p className="font-bold text-gray-700">
                  {r.entidad_medica} - {r.fecha_surtido?.toDate ? r.fecha_surtido.toDate().toLocaleDateString() : new Date(r.fecha_surtido).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">Médico: {r.medico} | Folio: {r.folio}</p>
              </div>
              <button 
                onClick={() => setRecetaSeleccionada(r)}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {recetaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Detalle de Receta #{recetaSeleccionada.folio}</h2>
              <button onClick={() => setRecetaSeleccionada(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            
            <div className="space-y-6">
              {(recetaSeleccionada.medicamentos_entregados || []).map((m, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="font-bold text-lg text-emerald-700">{m.nombre} <span className="font-normal text-gray-600">{m.gramaje}</span></p>
                  <p className="text-sm text-gray-500 mb-2">{m.presentacion} • <span className="font-bold">{m.cantidad_piezas} piezas por caja</span></p>
                  
                  <div className="text-xs bg-white p-2 rounded border mt-2">
                    <p className="font-bold text-gray-400 uppercase mb-1">Lotes entregados:</p>
                    {m.detalle_lotes && m.detalle_lotes.length > 0 ? (
                      m.detalle_lotes.map((lote, l) => (
                        <div key={l} className="flex justify-between py-1 border-b last:border-0">
                          <span>Origen: {lote.ubicacion}</span>
                          <span>Cant: {lote.cantidad}</span>
                          <span className="font-bold">
                            Vence: {lote.fecha_caducidad?.toDate ? lote.fecha_caducidad.toDate().toLocaleDateString() : new Date(lote.fecha_caducidad).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">Sin detalle de lotes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}