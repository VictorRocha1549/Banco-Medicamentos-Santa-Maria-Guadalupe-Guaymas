export function BuscadorMedicamentos({
  medicamentoSeleccionado, setMedicamentoSeleccionado,
  busquedaMed, setBusquedaMed,
  resultadosBusqueda, setResultadosBusqueda,
  cantidadAExtraer, setCantidadAExtraer,
  agregarAFaltantes, confirmarAgregadoInventario
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative z-10">
      <h2 className="font-bold text-gray-800 mb-3">Buscar en Inventario</h2>

      {!medicamentoSeleccionado ? (
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={busquedaMed}
              onChange={(e) => setBusquedaMed(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
              placeholder="Busca por nombre o escanea código..."
              autoComplete="off"
            />
            <button type="button" onClick={agregarAFaltantes} className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-colors" title="Si no aparece en la lista, agrégalo a la lista de espera">
              + Lista Espera
            </button>
          </div>

          {resultadosBusqueda.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
              {resultadosBusqueda.map((med, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setMedicamentoSeleccionado(med);
                    setCantidadAExtraer('1');
                    setResultadosBusqueda([]);
                  }}
                  className="w-full text-left p-3 hover:bg-emerald-50 border-b border-gray-100 flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-800">{med.nombre} <span className="text-emerald-600 font-normal">{med.gramaje}</span></p>
                    <p className="text-xs text-gray-500">{med.presentacion}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-lg">
                      {med.total_cajas} caja(s) disponible(s)
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Confirmar Extracción</p>
            <p className="font-bold text-gray-800 text-lg">{medicamentoSeleccionado.nombre} <span className="text-emerald-600">{medicamentoSeleccionado.gramaje}</span></p>
            <p className="text-sm text-gray-500">Stock máximo: {medicamentoSeleccionado.total_cajas} caja(s)</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Cajas a Surtir:</label>
              <input
                type="number"
                value={cantidadAExtraer}
                onChange={(e) => setCantidadAExtraer(e.target.value)}
                min="1"
                max={medicamentoSeleccionado.total_cajas}
                className="w-20 p-2 text-center border border-emerald-300 rounded-lg font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setMedicamentoSeleccionado(null)} className="px-3 py-2 bg-white text-gray-600 font-bold rounded-lg border border-gray-300 hover:bg-gray-100">
                Cancelar
              </button>
              <button type="button" onClick={confirmarAgregadoInventario} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md">
                Añadir a Receta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}