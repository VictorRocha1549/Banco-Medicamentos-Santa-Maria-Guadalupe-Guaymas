import { useState, useMemo, useCallback } from 'react';
import { useGestionCajas } from '../hooks/useGestionCajas';
import { CajaCard } from './CajaCard';
import { ModalSeleccionarDestino } from './ModalSeleccionarDestino';

export function GestionCajas() {
  const {
    cajas,
    medicamentos,
    cargando,
    error,
    crearCaja,
    moverMedicamentos,
  } = useGestionCajas();

  const [nuevaCajaNombre, setNuevaCajaNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [moviendo, setMoviendo] = useState(false);

  // Filtro de cajas según búsqueda
  const cajasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return cajas;
    const term = busqueda.toLowerCase();
    return cajas.filter((caja) => {
      const medsEnCaja = medicamentos.filter(
        (m) => m.ubicacion === `caja_almacen_${caja.id}`
      );
      return medsEnCaja.some(
        (m) =>
          m.nombre.toLowerCase().includes(term) ||
          m.gramaje?.toLowerCase().includes(term)
      );
    });
  }, [cajas, medicamentos, busqueda]);

  const toggleSeleccion = useCallback((id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleCrearCaja = async (e) => {
    e.preventDefault();
    if (!nuevaCajaNombre.trim()) return;
    try {
      await crearCaja(nuevaCajaNombre);
      setNuevaCajaNombre('');
    } catch (err) {
      alert('Error al crear la caja');
    }
  };

  const abrirModalMover = () => {
    if (seleccionados.length === 0) {
      alert('Selecciona al menos un medicamento para mover.');
      return;
    }
    setModalAbierto(true);
  };

  const handleMover = async (destinoId) => {
    setMoviendo(true);
    try {
      await moverMedicamentos(seleccionados, destinoId);
      setSeleccionados([]);
      setModalAbierto(false);
    } catch (err) {
      alert('Error al mover los medicamentos');
    } finally {
      setMoviendo(false);
    }
  };

  const limpiarSeleccion = () => setSeleccionados([]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Cajas</h1>
        <p className="text-gray-500">
          Administra tus contenedores físicos, busca medicamentos y realiza
          traspasos.
        </p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Controles superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <form onSubmit={handleCrearCaja} className="flex gap-2 col-span-1">
          <input
            value={nuevaCajaNombre}
            onChange={(e) => setNuevaCajaNombre(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nombre nueva caja (Ej. B-01)"
            maxLength={40}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Crear
          </button>
        </form>

        <input
          className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none col-span-1"
          placeholder="🔍 Buscar medicamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="flex items-center gap-2 col-span-1 justify-end">
          {seleccionados.length > 0 && (
            <>
              <span className="text-sm text-gray-600 font-medium">
                {seleccionados.length} seleccionados
              </span>
              <button
                onClick={abrirModalMover}
                className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                Mover seleccionados
              </button>
              <button
                onClick={limpiarSeleccion}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid de Cajas */}
      {cargando ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Cargando almacén...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cajasFiltradas.map((caja) => (
            <CajaCard
              key={caja.id}
              caja={caja}
              medicamentos={medicamentos.filter(
                (m) => m.ubicacion === `caja_almacen_${caja.id}`
              )}
              seleccionados={seleccionados}
              onToggleSeleccion={toggleSeleccion}
              busqueda={busqueda}
            />
          ))}
          {cajasFiltradas.length === 0 && !cargando && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No se encontraron cajas con ese medicamento.
            </div>
          )}
        </div>
      )}

      {/* Modal para elegir destino */}
      <ModalSeleccionarDestino
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        cajas={cajas}
        onConfirmar={handleMover}
        cargando={moviendo}
        excluirCajaIds={[]} // puedes añadir lógica si quieres excluir origen
      />
    </div>
  );
}