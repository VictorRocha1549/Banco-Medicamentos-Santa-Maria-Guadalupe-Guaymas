import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function useReportes(fechaDesde, fechaHasta) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      // Obtenemos todos los documentos de una vez, sin filtros en el servidor
      const [medsSnap, recsSnap, pacsSnap, cajsSnap] = await Promise.all([
        getDocs(collection(db, 'medicamentos')),
        getDocs(collection(db, 'recetas')),
        getDocs(collection(db, 'pacientes')),
        getDocs(collection(db, 'cajas_almacen')),
      ]);

      const medicamentos = medsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const recetas = recsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pacientes = pacsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const cajas = cajsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filtramos recetas por fechas en el cliente si se solicitaron
      let recetasFiltradas = recetas;
      if (fechaDesde || fechaHasta) {
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;

        recetasFiltradas = recetas.filter(r => {
          if (!r.fecha_creacion) return false;
          const fechaReceta = r.fecha_creacion.toDate();
          if (desde && fechaReceta < desde) return false;
          if (hasta && fechaReceta > hasta) return false;
          return true;
        });
      }

      setMedicamentos(medicamentos);
      setRecetas(recetasFiltradas);
      setPacientes(pacientes);
      setCajas(cajas);
    } catch (err) {
      console.error('Error cargando datos de reportes:', err);
      setError('Error al cargar datos. Revisa la consola.');
    } finally {
      setCargando(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return { medicamentos, recetas, pacientes, cajas, cargando, error };
}