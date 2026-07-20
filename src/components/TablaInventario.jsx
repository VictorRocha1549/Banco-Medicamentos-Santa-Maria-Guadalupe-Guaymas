import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 

// 1. Recibimos la nueva función 'onRetirarLote'
export function TablaInventario({ medicamentos, cargando, onEliminar, onRetirarLote }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState('todos'); 
  const [diccionarioCajas, setDiccionarioCajas] = useState({});

  useEffect(() => {
    const cargarNombresCajas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cajas_almacen"));
        const diccionario = {};
        snapshot.forEach(doc => {
          diccionario[doc.id] = doc.data().nombre_caja;
        });
        setDiccionarioCajas(diccionario);
      } catch (error) {
        console.error("Error al cargar el diccionario de cajas:", error);
      }
    };
    cargarNombresCajas();
  }, []);

  const agruparInventario = () => {
    const hoy = new Date();
    const mesAbsolutoActual = (hoy.getFullYear() * 12) + hoy.getMonth();

    const agrupado = medicamentos.reduce((acc, med) => {
      const id = med.codigo_barras || `${med.nombre}-${med.gramaje}-${med.presentacion}`;
      const key = id.toLowerCase().trim();

      if (!acc[key]) {
        acc[key] = {
          ...med,
          idVisual: key,
          total_cajas: 0,
          en_anaquel: 0,
          en_cajas: {},
          alertas: { caducados: [], proximos: [] },
          ids_caducados: [], // 2. AQUÍ GUARDAMOS LOS IDs REALES DE LAS CAJAS CADUCADAS
          estado_peor: 'verde',
          id_referencia: med.id 
        };
      }

      acc[key].total_cajas += 1;

      let nombreUbicacion = "Anaquel";
      if (med.ubicacion === 'anaquel') {
        acc[key].en_anaquel += 1;
      } else if (med.ubicacion && med.ubicacion.startsWith('caja_almacen_')) {
        const idCaja = med.ubicacion.replace('caja_almacen_', '');
        acc[key].en_cajas[idCaja] = (acc[key].en_cajas[idCaja] || 0) + 1;
        const nombreRealCaja = diccionarioCajas[idCaja] || `Reserva (ID: ${idCaja.substring(0,4)})`;
        nombreUbicacion = nombreRealCaja;
      } else {
        acc[key].en_anaquel += 1;
      }

      if (med.fecha_caducidad) {
        const [anioCad, mesCad] = med.fecha_caducidad.split('-');
        const mesAbsolutoCaducidad = (parseInt(anioCad, 10) * 12) + (parseInt(mesCad, 10) - 1);
        
        const diferenciaMeses = mesAbsolutoCaducidad - mesAbsolutoActual;

        if (diferenciaMeses <= 0) {
          acc[key].alertas.caducados.push(nombreUbicacion);
          // 3. Insertamos el ID técnico de la caja física caducada a nuestra lista de ejecución
          acc[key].ids_caducados.push(med.id);
          acc[key].estado_peor = 'rojo'; 
        } else if (diferenciaMeses > 0 && diferenciaMeses <= 3) {
          acc[key].alertas.proximos.push(nombreUbicacion);
          if (acc[key].estado_peor !== 'rojo') {
            acc[key].estado_peor = 'amarillo';
          }
        }
      }

      return acc;
    }, {});

    return Object.values(agrupado);
  };

  const inventarioAgrupado = agruparInventario();

  const medicamentosFiltrados = inventarioAgrupado.filter((med) => {
    const terminoBusqueda = busqueda.toLowerCase();
    const coincideNombre = med.nombre.toLowerCase().includes(terminoBusqueda);
    const coincideCodigo = med.codigo_barras ? med.codigo_barras.includes(terminoBusqueda) : false;
    const pasaTexto = coincideNombre || coincideCodigo;

    let pasaAlerta = true;
    if (filtroAlerta === 'caducados') {
      pasaAlerta = med.estado_peor === 'rojo';
    } else if (filtroAlerta === 'proximos') {
      pasaAlerta = med.estado_peor === 'amarillo';
    }

    return pasaTexto && pasaAlerta;
  });

  const conteoTotal = inventarioAgrupado.length;
  const conteoCaducados = inventarioAgrupado.filter(m => m.estado_peor === 'rojo').length;
  const conteoProximos = inventarioAgrupado.filter(m => m.estado_peor === 'amarillo').length;

  if (cargando) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2 flex items-center justify-center h-64">
        <p className="text-blue-500 animate-pulse font-medium">Auditando inventario...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2 overflow-hidden flex flex-col">
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => setFiltroAlerta('todos')} className={`p-3 rounded-xl border text-left transition-all ${filtroAlerta === 'todos' ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
          <p className="text-xs font-bold text-gray-500 uppercase">Total Lotes</p>
          <p className="text-xl font-bold text-blue-700">{conteoTotal}</p>
        </button>

        <button onClick={() => setFiltroAlerta('caducados')} className={`p-3 rounded-xl border text-left transition-all ${filtroAlerta === 'caducados' ? 'bg-red-50 border-red-500 shadow-sm ring-1 ring-red-500' : 'bg-white border-red-200 hover:bg-red-50/50'}`}>
          <p className="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Para Retirar
          </p>
          <p className="text-xl font-bold text-red-700">{conteoCaducados}</p>
        </button>

        <button onClick={() => setFiltroAlerta('proximos')} className={`p-3 rounded-xl border text-left transition-all ${filtroAlerta === 'proximos' ? 'bg-yellow-50 border-yellow-500 shadow-sm ring-1 ring-yellow-500' : 'bg-white border-yellow-200 hover:bg-yellow-50/50'}`}>
          <p className="text-xs font-bold text-yellow-700 uppercase flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Próximos a Vencer
          </p>
          <p className="text-xl font-bold text-yellow-800">{conteoProximos}</p>
        </button>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-gray-100 pt-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Inventario Consolidado</h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input type="text" placeholder="Buscar medicamento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow shadow-sm"/>
        </div>
      </div>

      <div className="overflow-x-auto grow">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="p-3 text-sm font-semibold text-gray-600">Medicamento</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Total Cajas</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Distribución Física</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Estado / Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicamentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  {busqueda === '' ? "No hay medicamentos que coincidan con este filtro." : `No se encontraron resultados para "${busqueda}".`}
                </td>
              </tr>
            ) : (
              medicamentosFiltrados.map((med) => (
                <tr key={med.idVisual} className={`border-b hover:bg-gray-50 transition-colors ${med.estado_peor === 'rojo' ? 'bg-red-50/30 border-red-100' : 'border-gray-100'}`}>
                  
                  <td className="p-3">
                    <p className="font-bold text-gray-800">{med.nombre} <span className="text-blue-600 font-normal">{med.gramaje}</span></p>
                    <p className="text-xs text-gray-500">
                      {med.presentacion} <span className="font-semibold text-gray-700">({med.cantidad_piezas || '?'} pzs por caja)</span>
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">Cód: {med.codigo_barras || 'N/A'}</p>
                  </td>
                  
                  <td className="p-3">
                    <span className="text-lg font-bold text-gray-800">{med.total_cajas}</span>
                    <span className="text-xs text-gray-500 ml-1">caja(s)</span>
                  </td>
                  
                  <td className="p-3 space-y-1">
                    {med.en_anaquel > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-xs font-medium text-gray-700">{med.en_anaquel} en Anaquel</span>
                      </div>
                    )}
                    {Object.entries(med.en_cajas).map(([idCaja, cantidad]) => {
                      const nombreRealCaja = diccionarioCajas[idCaja] || `Reserva (ID: ${idCaja.substring(0,4)})`;
                      return (
                        <div key={idCaja} className="flex items-center space-x-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                          <span className="text-xs font-medium text-gray-600">
                            {cantidad} en {nombreRealCaja}
                          </span>
                        </div>
                      );
                    })}
                  </td>
                  
                  <td className="p-3">
                    {med.estado_peor === 'verde' && (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-xs font-bold">Todo al corriente</span>
                      </div>
                    )}

                    {med.estado_peor === 'amarillo' && (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span className="text-xs font-bold">Próximo a Vencer ({med.alertas.proximos.length} caja/s)</span>
                        </div>
                        <div className="text-[10px] text-yellow-600/80 font-medium leading-tight -w-[150px] whitespace-normal">
                          Retirar de: {Array.from(new Set(med.alertas.proximos)).join(', ')}
                        </div>
                      </div>
                    )}

                    {med.estado_peor === 'rojo' && (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          <span className="text-xs font-bold uppercase">Caducado ({med.alertas.caducados.length} caja/s)</span>
                        </div>
                        <div className="text-[11px] text-red-600 font-bold leading-tight -w-[150px] whitespace-normal">
                          ¡Búscalas en: {Array.from(new Set(med.alertas.caducados)).join(', ')}!
                        </div>
                        
                        {/* 4. BOTÓN DE RETIRO MASIVO (Solo visible si el filtro rojo está activo) */}
                        {filtroAlerta === 'caducados' && med.ids_caducados.length > 0 && (
                          <button 
                            onClick={async () => { 
                              if(window.confirm(`¿Confirmas la destrucción/retiro de las ${med.ids_caducados.length} cajas caducadas de este lote? Esta acción no se puede deshacer.`)) {
                                await onRetirarLote(med.ids_caducados);
                                alert("Cajas retiradas exitosamente del sistema.");
                              }
                            }} 
                            className="mt-2 w-full px-3 py-2 text-xs font-bold bg-red-600 text-white rounded-lg border border-red-700 hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Retirar {med.ids_caducados.length} Caja(s)
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}