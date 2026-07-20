import { useState, useMemo } from 'react';

export function ModalSeleccionarDestino({
  abierto,
  onCerrar,
  cajas,
  onConfirmar,
  cargando,
}) {
  const [filtro, setFiltro] = useState('');

  const cajasFiltradas = useMemo(() => {
    if (!filtro.trim()) return cajas;
    const term = filtro.toLowerCase();
    return cajas.filter((c) => c.nombre_caja.toLowerCase().includes(term));
  }, [cajas, filtro]);

  const handleConfirmar = (destinoId) => {
    onConfirmar(destinoId);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Seleccionar destino
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={cargando}
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <input
            className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Filtrar cajas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => handleConfirmar('anaquel')}
            className="w-full text-left p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition font-medium text-amber-800"
            disabled={cargando}
          >
            📦 Anaquel (fuera de caja)
          </button>

          {cajasFiltradas.map((caja) => (
            <button
              key={caja.id}
              onClick={() => handleConfirmar(caja.id)}
              className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition font-medium text-gray-700"
              disabled={cargando}
            >
              🗃️ {caja.nombre_caja}
            </button>
          ))}

          {cajasFiltradas.length === 0 && (
            <p className="text-center text-gray-400 py-4">
              Sin coincidencias
            </p>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            disabled={cargando}
          >
            Cancelar
          </button>
        </div>

        {cargando && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}