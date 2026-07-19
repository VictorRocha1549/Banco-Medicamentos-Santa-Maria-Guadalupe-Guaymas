import { useState } from 'react';

export function TablaInventario({ medicamentos, cargando, onToggleDisponibilidad, onEliminar }) {
  const [busqueda, setBusqueda] = useState('');

  // ==========================================
  // LÓGICA DE AGRUPACIÓN (VISTA WMS)
  // ==========================================
  const agruparInventario = () => {
    const agrupado = medicamentos.reduce((acc, med) => {
      // Usamos el código de barras como identificador principal
      const id = med.codigo_barras || `${med.nombre}-${med.gramaje}-${med.presentacion}`;
      const key = id.toLowerCase().trim();

      if (!acc[key]) {
        acc[key] = {
          ...med,
          idVisual: key,
          total_cajas: 0,
          en_anaquel: 0,
          en_cajas: {}, // Guardará el conteo de cuántas hay en cada caja física
          id_referencia: med.id // Guardamos un ID real por si necesitamos descontar una caja
        };
      }

      // Sumamos al total general
      acc[key].total_cajas += 1;

      // Clasificamos por ubicación física
      if (med.ubicacion === 'anaquel') {
        acc[key].en_anaquel += 1;
      } else if (med.ubicacion && med.ubicacion.startsWith('caja_almacen_')) {
        // Extraemos el ID de la caja
        const idCaja = med.ubicacion.replace('caja_almacen_', '');
        acc[key].en_cajas[idCaja] = (acc[key].en_cajas[idCaja] || 0) + 1;
      } else {
        // Fallback por si hay registros viejos sin ubicación definida
        acc[key].en_anaquel += 1;
      }

      return acc;
    }, {});

    return Object.values(agrupado);
  };

  const inventarioAgrupado = agruparInventario();

  // Filtrado de la lista ya agrupada
  const medicamentosFiltrados = inventarioAgrupado.filter((med) => {
    const terminoBusqueda = busqueda.toLowerCase();
    const coincideNombre = med.nombre.toLowerCase().includes(terminoBusqueda);
    const coincideCodigo = med.codigo_barras ? med.codigo_barras.includes(terminoBusqueda) : false;
    
    return coincideNombre || coincideCodigo;
  });

  if (cargando) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2 flex items-center justify-center h-64">
        <p className="text-blue-500 animate-pulse font-medium">Cargando inventario consolidado...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2 overflow-hidden flex flex-col">
      
      {/* === CABECERA Y BARRA DE BÚSQUEDA === */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventario Consolidado</h2>
          <p className="text-sm text-gray-500">Agrupado por lote y código de barras</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow shadow-sm"
          />
        </div>
      </div>

      {/* === TABLA DE DATOS === */}
      <div className="overflow-x-auto grow">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="p-3 text-sm font-semibold text-gray-600">Medicamento</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Total Cajas</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Distribución Física</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicamentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  {busqueda === '' 
                    ? "No hay medicamentos registrados en el inventario." 
                    : `No se encontraron resultados para "${busqueda}".`}
                </td>
              </tr>
            ) : (
              medicamentosFiltrados.map((med) => (
                <tr key={med.idVisual} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  {/* COLUMNA 1: Nombre y Presentación con Pastillas */}
                  <td className="p-3">
                    <p className="font-bold text-gray-800">{med.nombre} <span className="text-blue-600 font-normal">{med.gramaje}</span></p>
                    <p className="text-xs text-gray-500">
                      {med.presentacion} <span className="font-semibold text-gray-700">({med.cantidad_piezas || '?'} pzs por caja)</span>
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">Cód: {med.codigo_barras || 'N/A'}</p>
                  </td>
                  
                  {/* COLUMNA 2: Total General */}
                  <td className="p-3">
                    <span className="text-lg font-bold text-gray-800">{med.total_cajas}</span>
                    <span className="text-xs text-gray-500 ml-1">caja(s)</span>
                  </td>
                  
                  {/* COLUMNA 3: Ubicación Estratégica (Anaquel vs Almacén) */}
                  <td className="p-3 space-y-1">
                    {/* Indicador de Anaquel */}
                    {med.en_anaquel > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs font-semibold text-green-700">{med.en_anaquel} en Anaquel</span>
                      </div>
                    )}
                    
                    {/* Indicadores de Cajas de Almacén */}
                    {Object.entries(med.en_cajas).map(([idCaja, cantidad]) => (
                      <div key={idCaja} className="flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-medium text-amber-700">
                          {cantidad} en Reserva <span className="text-amber-600/70 text-[10px]">(ID: {idCaja.substring(0,4)}...)</span>
                        </span>
                      </div>
                    ))}
                  </td>
                  
                  {/* COLUMNA 4: Acciones (Adaptadas a lote) */}
                  <td className="p-3">
                    {/* Al estar agrupados, borrar elimina 1 sola unidad del lote para descontar */}
                    <button 
                      onClick={() => { 
                        if(window.confirm("¿Descontar 1 caja de este lote del sistema?")) {
                          onEliminar(med.id_referencia); 
                        }
                      }} 
                      className="px-3 py-1 text-xs font-bold bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      Descontar 1 Caja
                    </button>
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