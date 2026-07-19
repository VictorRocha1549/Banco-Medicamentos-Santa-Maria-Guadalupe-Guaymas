import { useState, useEffect } from 'react';
// 1. Nuevas herramientas importadas para consultas y operaciones masivas
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarInventario = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "medicamentos"));
      const lista = querySnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));
      setMedicamentos(lista);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // === MOTOR DE ENRUTAMIENTO (WMS) ===
  const agregarMedicamento = async (nuevoMedicamento, cantidadDeCajas = 1) => {
    try {
      const barcode = nuevoMedicamento.codigo_barras;
      const limiteFisico = nuevoMedicamento.limite_anaquel;

      // 1. Consultamos cuántas cajas de este código YA están en el anaquel principal
      const q = query(
        collection(db, "medicamentos"),
        where("codigo_barras", "==", barcode),
        where("ubicacion", "==", "anaquel")
      );
      const snapshot = await getDocs(q);
      const cajasExistentesEnAnaquel = snapshot.size;

      // 2. Calculamos matemáticamente el espacio
      const espacioDisponible = limiteFisico - cajasExistentesEnAnaquel;
      
      let cajasParaAnaquel = 0;
      let cajasSobrantes = 0;

      if (espacioDisponible >= cantidadDeCajas) {
         // Hay espacio de sobra, todas van al anaquel
         cajasParaAnaquel = cantidadDeCajas;
      } else if (espacioDisponible > 0) {
         // Hay espacio para algunas, las demás sobran
         cajasParaAnaquel = espacioDisponible;
         cajasSobrantes = cantidadDeCajas - espacioDisponible;
      } else {
         // El anaquel ya está al máximo
         cajasSobrantes = cantidadDeCajas; 
      }

      // 3. Empaquetamos las operaciones de Firebase en un "Lote" (Batch)
      // Esto asegura que o se guardan todas, o no se guarda ninguna (previene errores a medias)
      const batch = writeBatch(db);

      for (let i = 0; i < cajasParaAnaquel; i++) {
         const nuevaReferencia = doc(collection(db, "medicamentos"));
         batch.set(nuevaReferencia, {
            ...nuevoMedicamento,
            disponible: true,
            ubicacion: "anaquel" // Etiqueta oficial de mostrador
         });
      }

      // Ejecutamos el guardado de las que sí cupieron
      if (cajasParaAnaquel > 0) {
        await batch.commit();
      }

      // 4. Retornamos el veredicto a la interfaz gráfica
      if (cajasSobrantes > 0) {
         // El sistema intercepta el proceso porque hubo desbordamiento
         return {
           exito: true,
           requiereAlmacen: true,
           cantidadSobrante: cajasSobrantes,
           datosMed: { ...nuevoMedicamento, disponible: true, ubicacion: "pendiente_almacen" }
         };
      }

      // Si todo salió bien y cupieron en el anaquel
      cargarInventario(); 
      return { exito: true, requiereAlmacen: false };

    } catch (error) {
      console.error("Error en el algoritmo de enrutamiento:", error);
      return { exito: false };
    }
  };

  const toggleDisponibilidad = async (id, estadoActual) => {
    try {
      const ref = doc(db, "medicamentos", id);
      await updateDoc(ref, { disponible: !estadoActual });
      cargarInventario();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const eliminarMedicamento = async (id) => {
    try {
      const ref = doc(db, "medicamentos", id);
      await deleteDoc(ref);
      cargarInventario();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return { medicamentos, cargando, agregarMedicamento, toggleDisponibilidad, eliminarMedicamento };
};