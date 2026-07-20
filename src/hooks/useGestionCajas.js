import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useGestionCajas() {
  const [cajas, setCajas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [cSnap, mSnap] = await Promise.all([
        getDocs(collection(db, 'cajas_almacen')),
        getDocs(collection(db, 'medicamentos')),
      ]);
      setCajas(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setMedicamentos(mSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudo cargar la información del almacén.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const crearCaja = async (nombre) => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return;
    try {
      await addDoc(collection(db, 'cajas_almacen'), {
        nombre_caja: nombreLimpio,
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error creando caja:', err);
      throw err;
    }
  };

  const moverMedicamentos = async (medIds, destinoId) => {
    if (!medIds.length || !destinoId) return;
    const batch = writeBatch(db);
    const ubicacion =
      destinoId === 'anaquel' ? 'anaquel' : `caja_almacen_${destinoId}`;

    medIds.forEach((id) => {
      const ref = doc(db, 'medicamentos', id);
      batch.update(ref, { ubicacion });
    });

    try {
      await batch.commit();
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error moviendo medicamentos:', err);
      throw err;
    }
  };

  return {
    cajas,
    medicamentos,
    cargando,
    error,
    crearCaja,
    moverMedicamentos,
    fetchData,
  };
}