import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReportes } from '../hooks/useReportes';

// NO necesitamos jsPDF.autoTable = autoTable; porque llamaremos a la función directamente

const TIPOS_REPORTE = [
  { id: 'caducados', label: 'Medicamentos Caducados (historial)', activo: true },
  { id: 'surtidos', label: 'Recetas Surtidas', activo: true },
  { id: 'perfiles', label: 'Total de Perfiles de Pacientes', activo: false },
  { id: 'totalRecetas', label: 'Total de Recetas (conteo)', activo: false },
  { id: 'inventario', label: 'Inventario Actual por Caja/Anaquel', activo: true },
  { id: 'movimientos', label: 'Distribución de Cajas', activo: false },
];

export function Reportes() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tiposSeleccionados, setTiposSeleccionados] = useState(
    TIPOS_REPORTE.filter(t => t.activo).map(t => t.id)
  );
  const [generando, setGenerando] = useState(false);
  const [errorGeneracion, setErrorGeneracion] = useState(null);

  const { medicamentos, recetas, pacientes, cajas, cargando, error } = useReportes(fechaDesde, fechaHasta);

  const toggleTipo = (id) => {
    setTiposSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const descargarPDF = (doc, nombreArchivo) => {
    try {
      doc.save(nombreArchivo);
    } catch (e) {
      console.warn('doc.save() falló, usando blob:', e);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const generarPDF = async (forzarCompleto = false) => {
    setGenerando(true);
    setErrorGeneracion(null);

    try {
      console.log('Iniciando generación de PDF...');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let y = 20;

      const secciones = forzarCompleto ? TIPOS_REPORTE.map(t => t.id) : tiposSeleccionados;
      console.log('Secciones a incluir:', secciones);

      // Encabezado
      doc.setFontSize(18);
      doc.text('Reporte - Banco de Medicamentos', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, y);
      if (forzarCompleto) {
        y += 6;
        doc.text('Período: Todo el historial', 14, y);
      } else if (fechaDesde || fechaHasta) {
        y += 6;
        doc.text(`Período: ${fechaDesde || 'Inicio'} al ${fechaHasta || 'Hoy'}`, 14, y);
      }
      y += 10;

      // Función auxiliar que llama a autoTable(doc, config)
      const agregarTabla = (config) => {
        if (config.body.length > 0) {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          autoTable(doc, { ...config, startY: y });
          y = doc.lastAutoTable.finalY + 8;
          console.log('Tabla agregada, nuevo Y:', y);
        } else {
          doc.setFontSize(10);
          doc.text(config.mensajeVacio || 'Sin datos.', 14, y);
          y += 6;
        }
      };

      // 1. Caducados
      if (secciones.includes('caducados')) {
        const hoy = new Date();
        const caducados = medicamentos.filter(m => {
          if (!m.fecha_caducidad) return false;
          return new Date(m.fecha_caducidad + 'T00:00:00') < hoy;
        });
        doc.setFontSize(14);
        doc.text('1. Medicamentos Caducados', 14, y);
        y += 8;
        agregarTabla({
          head: [['Nombre', 'Gramaje', 'Presentación', 'Código', 'Fecha Cad.', 'Ubicación']],
          body: caducados.map(m => [
            m.nombre, m.gramaje, m.presentacion, m.codigo_barras || '', m.fecha_caducidad, m.ubicacion || 'Sin ubicación'
          ]),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
          mensajeVacio: 'No se encontraron medicamentos caducados.'
        });
      }

      // 2. Recetas Surtidas
      if (secciones.includes('surtidos')) {
        doc.setFontSize(14);
        doc.text('2. Recetas Surtidas', 14, y);
        y += 8;
        agregarTabla({
          head: [['ID', 'Paciente', 'Medicamentos', 'Fecha', 'Estado']],
          body: recetas.map(r => [
            r.id.slice(0, 8),
            r.paciente_nombre || r.paciente_id,
            r.medicamentos?.map(m => m.nombre).join(', ') || 'N/A',
            r.fecha_creacion?.toDate ? new Date(r.fecha_creacion.toDate()).toLocaleDateString() : 'Sin fecha',
            r.estado || 'Surtida'
          ]),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [37, 99, 235] },
          mensajeVacio: 'No hay recetas en el período.'
        });
      }

      // 3. Perfiles
      if (secciones.includes('perfiles')) {
        doc.setFontSize(14);
        doc.text('3. Perfiles de Pacientes', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Total de pacientes registrados: ${pacientes.length}`, 14, y);
        y += 6;
        agregarTabla({
          head: [['Nombre', 'Teléfono', 'Dirección', 'Fecha Registro']],
          body: pacientes.map(p => [
            p.nombre || 'Sin nombre',
            p.telefono || '',
            p.direccion || '',
            p.fecha_registro?.toDate ? new Date(p.fecha_registro.toDate()).toLocaleDateString() : 'N/A'
          ]),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] },
          mensajeVacio: 'No hay pacientes registrados.'
        });
      }

      // 4. Total recetas
      if (secciones.includes('totalRecetas')) {
        doc.setFontSize(14);
        doc.text('4. Total de Recetas', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Cantidad de recetas en el período: ${recetas.length}`, 14, y);
        y += 10;
      }

      // 5. Inventario por caja
      if (secciones.includes('inventario')) {
        doc.setFontSize(14);
        doc.text('5. Inventario Actual por Caja', 14, y);
        y += 8;
        const inventarioPorCaja = {};
        medicamentos.forEach(m => {
          const ubi = m.ubicacion || 'Sin ubicación';
          if (!inventarioPorCaja[ubi]) inventarioPorCaja[ubi] = [];
          inventarioPorCaja[ubi].push(m);
        });
        const cuerpo = [];
        Object.entries(inventarioPorCaja).forEach(([ubi, meds]) => {
          meds.forEach(m => {
            cuerpo.push([ubi, m.nombre, m.gramaje, m.cantidad_piezas || '', m.fecha_caducidad || '', m.codigo_barras || '']);
          });
        });
        agregarTabla({
          head: [['Ubicación', 'Nombre', 'Gramaje', 'Cant. Piezas', 'Caducidad', 'Código']],
          body: cuerpo,
          theme: 'grid',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [245, 158, 11] },
          mensajeVacio: 'No hay medicamentos en inventario.'
        });
      }

      // 6. Distribución de cajas
      if (secciones.includes('movimientos')) {
        doc.setFontSize(14);
        doc.text('6. Distribución de Cajas', 14, y);
        y += 8;
        const cuerpoCajas = cajas.map(caja => {
          const medsEnCaja = medicamentos.filter(m => m.ubicacion === `caja_almacen_${caja.id}`);
          return [caja.nombre_caja, medsEnCaja.length, medsEnCaja.map(m => m.nombre).join(', ')];
        });
        agregarTabla({
          head: [['Nombre Caja', 'Cant. Medicamentos', 'Medicamentos']],
          body: cuerpoCajas,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [139, 92, 246] },
          mensajeVacio: 'No hay cajas registradas.'
        });
      }

      // Pie de página
      const totalPages = doc.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text('Reporte generado automáticamente - Banco de Medicamentos Santa María de Guadalupe', 14, 285);
      }

      console.log('PDF construido, descargando...');
      const nombreArchivo = forzarCompleto
        ? `reporte_completo_${new Date().toISOString().slice(0, 10)}.pdf`
        : `reporte_${new Date().toISOString().slice(0, 10)}.pdf`;

      descargarPDF(doc, nombreArchivo);
      console.log('Descarga iniciada.');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setErrorGeneracion('Error al generar el PDF. Revisa la consola.');
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteCompleto = () => generarPDF(true);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-500">Genera reportes personalizados en PDF</p>
      </header>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Filtros de Fecha (opcional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Secciones del Reporte</h2>
        <div className="space-y-2">
          {TIPOS_REPORTE.map(tipo => (
            <label key={tipo.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={tiposSeleccionados.includes(tipo.id)}
                onChange={() => toggleTipo(tipo.id)}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="text-gray-700">{tipo.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {errorGeneracion && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{errorGeneracion}</div>}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => generarPDF()}
          disabled={cargando || generando || tiposSeleccionados.length === 0}
          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md"
        >
          {generando ? 'Generando...' : cargando ? 'Cargando datos...' : 'Generar PDF Personalizado'}
        </button>
        <button
          onClick={generarReporteCompleto}
          disabled={cargando || generando}
          className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-400 transition shadow-md"
        >
          {generando ? 'Generando...' : cargando ? 'Cargando datos...' : 'Reporte Completo (Todo el Historial)'}
        </button>
      </div>
    </div>
  );
}