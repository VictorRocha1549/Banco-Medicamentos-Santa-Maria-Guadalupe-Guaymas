import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function FormularioMedicamento({ onGuardar, inventario = [] }) {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [gramaje, setGramaje] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [imagen, setImagen] = useState('');
  
  const [codigoBarras, setCodigoBarras] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [limiteAnaquel, setLimiteAnaquel] = useState(''); 
  const [multiplicadorCajas, setMultiplicadorCajas] = useState('1'); 
  
  const [guardando, setGuardando] = useState(false);
  const [esConocido, setEsConocido] = useState(false);

  // === CALCULADORA DE FECHA MÍNIMA ===
  // Calcula el primer día del mes siguiente para bloquear el calendario
  const obtenerMinimaFechaPermitida = () => {
    const hoy = new Date();
    let mesSiguiente = hoy.getMonth() + 2; // +1 porque JS es base 0, +1 para brincar al próximo mes
    let anio = hoy.getFullYear();
    
    if (mesSiguiente > 12) {
      mesSiguiente = 1;
      anio += 1;
    }
    
    // Formatea a YYYY-MM-DD
    return `${anio}-${mesSiguiente.toString().padStart(2, '0')}-01`;
  };

  useEffect(() => {
    if (!codigoBarras || codigoBarras.length < 3) {
      if (esConocido) setEsConocido(false);
      return;
    }

    const medicamentoEncontrado = inventario.find(med => med.codigo_barras === codigoBarras);

    if (medicamentoEncontrado) {
      setNombre(medicamentoEncontrado.nombre || '');
      setGramaje(medicamentoEncontrado.gramaje || '');
      setPresentacion(medicamentoEncontrado.presentacion || '');
      setImagen(medicamentoEncontrado.imagen || '');
      setCantidadPiezas(medicamentoEncontrado.cantidad_piezas?.toString() || '');
      setLimiteAnaquel(medicamentoEncontrado.limite_anaquel?.toString() || '20');
      setEsConocido(true);
    } else {
      if (esConocido) setEsConocido(false);
    }
  }, [codigoBarras, inventario, esConocido]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setGuardando(true);

    // ==========================================
    // VALIDACIÓN CRÍTICA DE CADUCIDAD
    // ==========================================
    const [anioCad, mesCad] = fechaCaducidad.split('-');
    const expYear = parseInt(anioCad, 10);
    const expMonth = parseInt(mesCad, 10) - 1; // JS usa meses del 0 al 11

    const hoy = new Date();
    const currentYear = hoy.getFullYear();
    const currentMonth = hoy.getMonth();

    // Regla: Si el año es menor, o si es el mismo año pero el mes es igual o menor al actual = Bloqueado
    if (expYear < currentYear || (expYear === currentYear && expMonth <= currentMonth)) {
      alert("❌ ALERTA DE SEGURIDAD: No se puede ingresar este lote. El medicamento ya está caducado o caduca este mismo mes.");
      setGuardando(false);
      return; // Detenemos el guardado inmediatamente
    }
    // ==========================================

    const cantidadAInsertar = Number(multiplicadorCajas);

    const resultado = await onGuardar({ 
      nombre, 
      gramaje, 
      presentacion, 
      imagen,
      codigo_barras: codigoBarras,
      fecha_caducidad: fechaCaducidad,
      cantidad_piezas: Number(cantidadPiezas),
      limite_anaquel: Number(limiteAnaquel)
    }, cantidadAInsertar);
    
    if (resultado && resultado.exito) {
      if (resultado.requiereAlmacen) {
        navigate('/admin/asignar-caja', {
          state: {
            medicamento: resultado.datosMed,
            cantidad: resultado.cantidadSobrante
          }
        });
      } else {
        setNombre(''); setGramaje(''); setPresentacion(''); setImagen('');
        setCodigoBarras(''); setFechaCaducidad(''); setCantidadPiezas('');
        setLimiteAnaquel(''); setMultiplicadorCajas('1'); setEsConocido(false);
        alert("¡Lote registrado en anaquel exitosamente!");
      }
    } else {
      alert("Hubo un error crítico al procesar el lote.");
    }
    
    setGuardando(false);
  };

  const inputClass = "w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors";
  const normalInput = `${inputClass} border-gray-300 bg-white`;
  const lockedInput = `${inputClass} border-blue-200 bg-blue-50 text-blue-800 font-medium cursor-not-allowed`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 col-span-1 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-600">Ingresar Donativo (Caja)</h2>
        {esConocido && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            Lote Reconocido
          </span>
        )}
      </div>

      <form onSubmit={manejarEnvio} className="space-y-4">
        
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <label className="block text-xs font-bold text-yellow-800 mb-1">Escanear Código de Barras Primero</label>
          <input 
            type="text" 
            required 
            value={codigoBarras} 
            onChange={(e) => setCodigoBarras(e.target.value)} 
            className={`${inputClass} border-yellow-300 shadow-inner`} 
            placeholder="Ej. 750123456789" 
            autoFocus
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold text-gray-600 uppercase">Información del Catálogo</h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} readOnly={esConocido} className={esConocido ? lockedInput : normalInput} placeholder="Ej. Paracetamol" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gramaje</label>
              <input type="text" required value={gramaje} onChange={(e) => setGramaje(e.target.value)} readOnly={esConocido} className={esConocido ? lockedInput : normalInput} placeholder="500mg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Presentación</label>
              <input type="text" required value={presentacion} onChange={(e) => setPresentacion(e.target.value)} readOnly={esConocido} className={esConocido ? lockedInput : normalInput} placeholder="Tabletas" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold text-gray-600 uppercase">Datos Logísticos</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cant. Pastillas/Ml</label>
              <input type="number" required value={cantidadPiezas} onChange={(e) => setCantidadPiezas(e.target.value)} readOnly={esConocido} className={esConocido ? lockedInput : normalInput} placeholder="Ej. 28" min="1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Límite Anaquel</label>
              <input type="number" required value={limiteAnaquel} onChange={(e) => setLimiteAnaquel(e.target.value)} readOnly={esConocido} className={esConocido ? lockedInput : normalInput} placeholder="Ej. 20" min="1" title="Máximo de cajas permitidas en mostrador" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1 font-bold">Fecha de Caducidad de este lote</label>
              <input 
                type="date" 
                required 
                value={fechaCaducidad} 
                onChange={(e) => setFechaCaducidad(e.target.value)} 
                min={obtenerMinimaFechaPermitida()} // <--- Bloqueo Visual en el calendario HTML
                className={`${normalInput} border-blue-300 ring-1 ring-blue-100`} 
              />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-between">
          <div>
            <label className="block text-sm font-bold text-green-800">Cajas Físicas Recibidas</label>
          </div>
          <input 
            type="number" 
            required 
            value={multiplicadorCajas} 
            onChange={(e) => setMultiplicadorCajas(e.target.value)} 
            className="w-20 p-2 text-lg font-bold text-center text-green-700 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" 
            min="1" 
            max="100"
          />
        </div>

        <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 shadow-md">
          {guardando ? 'Calculando espacio...' : 'Registrar en Inventario'}
        </button>
      </form>
    </div>
  );
}