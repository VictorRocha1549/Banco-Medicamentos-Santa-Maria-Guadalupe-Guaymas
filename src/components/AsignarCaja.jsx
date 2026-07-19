import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Importamos updateDoc y arrayUnion para mantener las cajas actualizadas
import { collection, getDocs, addDoc, writeBatch, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export function AsignarCaja() {
  const location = useLocation();
  const navigate = useNavigate();

  const datosMemoria = location.state;
  const datosMed = datosMemoria?.medicamento;
  const cantidadSobrante = datosMemoria?.cantidad;

  const [cajas, setCajas] = useState([]);
  const [cajasRecomendadas, setCajasRecomendadas] = useState([]);
  const [cargandoCajas, setCargandoCajas] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados del formulario
  const [opcion, setOpcion] = useState('nueva'); 
  const [nombreNuevaCaja, setNombreNuevaCaja] = useState('');
  const [cajaSeleccionada, setCajaSeleccionada] = useState('');

  useEffect(() => {
    if (!datosMed) {
      navigate('/admin');
      return;
    }
    
    const cargarCajasAlmacen = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cajas_almacen"));
        const listaCajas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCajas(listaCajas);

        // === MOTOR DE RECOMENDACIÓN ===
        const identificador = datosMed.codigo_barras || datosMed.nombre;
        
        // Filtramos qué cajas ya contienen este medicamento
        const recomendadas = listaCajas.filter(c => 
          c.medicamentos_permitidos && c.medicamentos_permitidos.includes(identificador)
        );
        
        setCajasRecomendadas(recomendadas);

        // Si existe al menos una caja recomendada, cambiamos la opción por defecto
        if (recomendadas.length > 0) {
          setOpcion('existente');
          setCajaSeleccionada(recomendadas[0].id);
        } else if (listaCajas.length > 0) {
          setCajaSeleccionada(listaCajas[0].id);
        }

      } catch (error) {
        console.error("Error al cargar cajas:", error);
      } finally {
        setCargandoCajas(false);
      }
    };

    cargarCajasAlmacen();
  }, [datosMed, navigate]);

  const procesarAsignacion = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      let idCajaDestino = '';
      const identificador = datosMed.codigo_barras || datosMed.nombre;

      if (opcion === 'nueva') {
        if (!nombreNuevaCaja.trim()) {
          alert("Debes escribir un nombre para la nueva caja.");
          setGuardando(false);
          return;
        }
        const refNuevaCaja = await addDoc(collection(db, "cajas_almacen"), {
          nombre_caja: nombreNuevaCaja,
          medicamentos_permitidos: [identificador] // Registramos qué contiene desde su creación
        });
        idCajaDestino = refNuevaCaja.id;
      } else {
        idCajaDestino = cajaSeleccionada;
        
        // Verificamos si la caja existente elegida ya tenía este medicamento en su "lista VIP"
        const cajaElegida = cajas.find(c => c.id === idCajaDestino);
        if (cajaElegida && (!cajaElegida.medicamentos_permitidos || !cajaElegida.medicamentos_permitidos.includes(identificador))) {
          // Si el usuario decidió meterlo en una caja que antes no tenía este medicamento, 
          // actualizamos la caja para que en el futuro sí se lo recomiende.
          await updateDoc(doc(db, "cajas_almacen", idCajaDestino), {
            medicamentos_permitidos: arrayUnion(identificador)
          });
        }
      }

      // Inserción en Lote (Batch)
      const batch = writeBatch(db);
      for (let i = 0; i < cantidadSobrante; i++) {
        const nuevaReferencia = doc(collection(db, "medicamentos"));
        batch.set(nuevaReferencia, {
          ...datosMed,
          ubicacion: `caja_almacen_${idCajaDestino}`
        });
      }
      await batch.commit();

      navigate('/admin');

    } catch (error) {
      console.error("Error al procesar el almacén:", error);
      alert("Hubo un problema al guardar en el almacén.");
    } finally {
      setGuardando(false);
    }
  };

  if (!datosMed) return null; 

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start pt-10">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Ubicación de Almacén Requerida</h1>
          <p className="text-gray-500 mt-2 text-sm">
            El mostrador ha alcanzado su límite de capacidad. Debes enviar <span className="font-bold text-red-600">{cantidadSobrante} caja(s)</span> de <span className="font-bold text-blue-600">{datosMed.nombre} {datosMed.gramaje}</span> a la bodega de reserva.
          </p>
        </div>

        {cargandoCajas ? (
          <div className="py-10 text-center text-blue-500 font-medium animate-pulse">
            Escaneando almacén en busca de espacios...
          </div>
        ) : (
          <form onSubmit={procesarAsignacion} className="space-y-6">
            
            {/* === ALERTA DE RECOMENDACIÓN === */}
            {cajasRecomendadas.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Recomendación del Sistema</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Detectamos que ya almacenas este medicamento en <strong>{cajasRecomendadas[0].nombre_caja}</strong>. Se ha seleccionado automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase">¿Dónde guardarás este lote?</h3>
              
              <div className="space-y-4">
                
                {/* Opción 1: Caja Existente */}
                {cajas.length > 0 && (
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="opcionCaja" 
                      value="existente" 
                      checked={opcion === 'existente'}
                      onChange={() => setOpcion('existente')}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block font-medium text-gray-800">Usar una caja existente</span>
                      {opcion === 'existente' && (
                        <select 
                          value={cajaSeleccionada}
                          onChange={(e) => setCajaSeleccionada(e.target.value)}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {/* Agrupamos visualmente las cajas recomendadas */}
                          {cajasRecomendadas.length > 0 && (
                            <optgroup label="⭐ Cajas Sugeridas">
                              {cajasRecomendadas.map(caja => (
                                <option key={caja.id} value={caja.id}>
                                  {caja.nombre_caja}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          
                          <optgroup label="Otras Cajas">
                            {cajas.filter(c => !cajasRecomendadas.find(cr => cr.id === c.id)).map(caja => (
                              <option key={caja.id} value={caja.id}>
                                {caja.nombre_caja}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      )}
                    </div>
                  </label>
                )}

                {/* Opción 2: Caja Nueva */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="opcionCaja" 
                    value="nueva" 
                    checked={opcion === 'nueva'}
                    onChange={() => setOpcion('nueva')}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="block font-medium text-gray-800">
                      Crear una nueva caja de almacén
                      {cajasRecomendadas.length > 0 && <span className="text-xs text-gray-500 block"> (Elige esta si las sugeridas ya están llenas)</span>}
                    </span>
                    {opcion === 'nueva' && (
                      <input 
                        type="text" 
                        required
                        value={nombreNuevaCaja}
                        onChange={(e) => setNombreNuevaCaja(e.target.value)}
                        placeholder="Ej. Caja de Plástico A-2" 
                        className="mt-2 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    )}
                  </div>
                </label>

              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={() => navigate('/admin')}
                className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={guardando}
                className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {guardando ? 'Procesando logística...' : 'Confirmar Ubicación'}
              </button>
            </div>
          </form>
        )}
        
      </div>
    </div>
  );
}