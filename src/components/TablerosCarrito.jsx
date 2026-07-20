export function TablerosCarrito({ medicamentosReceta, medicamentosFaltantes, quitarDelCarrito }) {
  return (
    <div className="grid grid-cols-1 gap-6 flex-1">
      {/* CARRITO: A SURTIR CON INSTRUCCIONES DE PICKING */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 overflow-hidden flex flex-col">
        <div className="bg-emerald-100 p-3 border-b border-emerald-200 flex justify-between items-center">
          <h3 className="font-bold text-emerald-800 text-sm uppercase">Plan de Surtido (Medicamentos)</h3>
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{medicamentosReceta.length}</span>
        </div>
        <div className="p-4 flex-1">
          {medicamentosReceta.length === 0 ? (
            <p className="text-sm text-emerald-600/50 text-center mt-10 font-medium">Búscalo y agrégalo a la receta.</p>
          ) : (
            <ul className="space-y-3">
              {medicamentosReceta.map((med, index) => (
                <li key={index} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-bold text-gray-800 text-lg">{med.nombre} {med.gramaje}</span>
                      <p className="text-xs text-gray-500">Total a entregar: <strong className="text-emerald-700">{med.cantidadSolicitada} caja(s)</strong></p>
                    </div>
                    <button type="button" onClick={() => quitarDelCarrito(index, 'surtir')} className="text-red-400 hover:text-red-600 font-bold text-xl px-2">×</button>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Instrucciones de recolección:</p>
                    <ul className="space-y-1">
                      {med.instruccionesPicking.map((instruccion, i) => {
                        const [anio, mes, dia] = instruccion.fecha_caducidad.split('-');
                        const fechaFormateada = new Date(anio, mes - 1, dia).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                        return (
                          <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Tomar <strong>{instruccion.cantidad}</strong> caja(s) de <strong className="text-blue-700">{instruccion.ubicacion}</strong> (Vence: <span className="capitalize">{fechaFormateada}</span>)
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CARRITO: LISTA DE ESPERA */}
      {medicamentosFaltantes.length > 0 && (
        <div className="bg-orange-50 rounded-2xl border border-orange-200 overflow-hidden flex flex-col">
          <div className="bg-orange-100 p-3 border-b border-orange-200 flex justify-between items-center">
            <h3 className="font-bold text-orange-800 text-sm uppercase">Lista de Espera (Faltantes)</h3>
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{medicamentosFaltantes.length}</span>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {medicamentosFaltantes.map((med, index) => (
                <li key={index} className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-800">{med.nombre_solicitado}</span>
                  <button type="button" onClick={() => quitarDelCarrito(index, 'espera')} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}