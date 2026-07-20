export function CajaCard({
  caja,
  medicamentos,
  seleccionados,
  onToggleSeleccion,
  busqueda,
}) {
  const resaltar = (texto) => {
    if (!busqueda) return texto;
    const partes = texto.split(new RegExp(`(${busqueda})`, 'gi'));
    return partes.map((parte, i) =>
      parte.toLowerCase() === busqueda.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
          {parte}
        </mark>
      ) : (
        parte
      )
    );
  };

  const estaVacia = medicamentos.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col h-full transition hover:shadow-md">
      <div className="border-b border-gray-100 pb-3 mb-3">
        <h3 className="font-bold text-lg text-gray-800">
          {caja.nombre_caja}
        </h3>
        <p className="text-xs text-gray-400">ID: {caja.id}</p>
      </div>

      <div className="grow space-y-2 overflow-y-auto max-h-64 pr-1">
        {estaVacia ? (
          <p className="text-sm text-gray-400 italic">Caja vacía</p>
        ) : (
          medicamentos.map((med) => {
            const marcado = seleccionados.includes(med.id);
            return (
              <label
                key={med.id}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                  marcado
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => onToggleSeleccion(med.id)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {resaltar(med.nombre)} ({med.gramaje})
                </span>
              </label>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-right">
        <span className="text-xs font-bold text-gray-500">
          {medicamentos.length} items
        </span>
      </div>
    </div>
  );
}