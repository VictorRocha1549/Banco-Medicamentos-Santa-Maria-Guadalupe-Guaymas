import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

// IMPORTAMOS NUESTROS NUEVOS MÓDULOS AISLADOS
import { DatosPaciente } from './DatosPaciente';
import { OrigenReceta } from './OrigenReceta';
import { BuscadorMedicamentos } from './BuscadorMedicamentos';
import { TablerosCarrito } from './TablerosCarrito';

export function SurtirReceta() {
    const [folio, setFolio] = useState('');
    const [entidadMedica, setEntidadMedica] = useState('');
    const [medico, setMedico] = useState('');

    const [telefono, setTelefono] = useState('');
    const [nombrePaciente, setNombrePaciente] = useState('');
    const [edad, setEdad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [pacienteExistente, setPacienteExistente] = useState(false);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);

    const [diccionarioCajas, setDiccionarioCajas] = useState({});
    const [inventarioAgrupado, setInventarioAgrupado] = useState([]);
    const [busquedaMed, setBusquedaMed] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

    const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
    const [cantidadAExtraer, setCantidadAExtraer] = useState('1');

    const [medicamentosReceta, setMedicamentosReceta] = useState([]);
    const [medicamentosFaltantes, setMedicamentosFaltantes] = useState([]);

    const [guardando, setGuardando] = useState(false);

    // ==========================================
    // 1. CARGA INICIAL Y BUSCADORES DE FIREBASE
    // ==========================================
    const inicializarSistema = async () => {
        try {
            const snapCajas = await getDocs(collection(db, "cajas_almacen"));
            const diccionario = {};
            snapCajas.forEach(doc => { diccionario[doc.id] = doc.data().nombre_caja; });
            setDiccionarioCajas(diccionario);

            const snapshot = await getDocs(collection(db, "medicamentos"));
            const medicamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const agrupado = medicamentos.reduce((acc, med) => {
                if (med.disponible === false) return acc;
                const id = med.codigo_barras || `${med.nombre}-${med.gramaje}-${med.presentacion}`;
                const key = id.toLowerCase().trim();

                if (!acc[key]) {
                    acc[key] = {
                        nombre: med.nombre,
                        gramaje: med.gramaje,
                        presentacion: med.presentacion,
                        codigo_barras: med.codigo_barras,
                        cantidad_piezas: med.cantidad_piezas,
                        total_cajas: 0,
                        cajas_disponibles: []
                    };
                }
                acc[key].total_cajas += 1;
                acc[key].cajas_disponibles.push(med);
                return acc;
            }, {});

            setInventarioAgrupado(Object.values(agrupado));
        } catch (error) {
            console.error("Error al inicializar surtido:", error);
        }
    };

    useEffect(() => { inicializarSistema(); }, []);

    useEffect(() => {
        if (busquedaMed.trim().length > 1) {
            const termino = busquedaMed.toLowerCase();
            const filtrados = inventarioAgrupado.filter(med =>
                med.nombre.toLowerCase().includes(termino) ||
                (med.codigo_barras && med.codigo_barras.includes(termino))
            );
            setResultadosBusqueda(filtrados);
        } else {
            setResultadosBusqueda([]);
        }
    }, [busquedaMed, inventarioAgrupado]);

    useEffect(() => {
        const buscarPaciente = async () => {
            if (telefono.length === 10) {
                setBuscandoPaciente(true);
                try {
                    const q = query(collection(db, "pacientes"), where("telefono", "==", telefono));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const datosPaciente = querySnapshot.docs[0].data();
                        setNombrePaciente(datosPaciente.nombre || '');
                        setEdad(datosPaciente.edad || '');
                        setDireccion(datosPaciente.direccion || '');
                        setPacienteExistente(true);
                    } else {
                        setPacienteExistente(false);
                    }
                } catch (error) {
                    console.error("Error al buscar paciente:", error);
                } finally {
                    setBuscandoPaciente(false);
                }
            } else {
                setPacienteExistente(false);
            }
        };
        const timeoutId = setTimeout(() => buscarPaciente(), 500);
        return () => clearTimeout(timeoutId);
    }, [telefono]);


    // ==========================================
    // 2. ALGORITMO FEFO (LÓGICA DEL CARRITO)
    // ==========================================
    const confirmarAgregadoInventario = () => {
        const cantidad = Number(cantidadAExtraer);
        const indexExistente = medicamentosReceta.findIndex(
            (item) => (item.codigo_barras === medicamentoSeleccionado.codigo_barras) && (item.nombre === medicamentoSeleccionado.nombre)
        );

        const cantidadTotalRequerida = indexExistente >= 0 ? medicamentosReceta[indexExistente].cantidadSolicitada + cantidad : cantidad;

        if (cantidadTotalRequerida <= 0 || cantidadTotalRequerida > medicamentoSeleccionado.total_cajas) {
            alert(`No puedes solicitar ${cantidadTotalRequerida} cajas. Solo hay ${medicamentoSeleccionado.total_cajas} en existencia.`);
            return;
        }

        const cajasOrdenadas = [...medicamentoSeleccionado.cajas_disponibles].sort((a, b) => new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad));
        const cajasAExtraerFisicamente = cajasOrdenadas.slice(0, cantidadTotalRequerida);

        const planDePicking = {};

        cajasAExtraerFisicamente.forEach(caja => {
            let nombreUbi = "Anaquel";
            if (caja.ubicacion && caja.ubicacion.startsWith('caja_almacen_')) {
                const idCaja = caja.ubicacion.replace('caja_almacen_', '');
                nombreUbi = diccionarioCajas[idCaja] || `Reserva (ID: ${idCaja.substring(0, 4)})`;
            }
            const key = `${nombreUbi}-${caja.fecha_caducidad}`;
            if (!planDePicking[key]) {
                planDePicking[key] = {
                    ubicacion: nombreUbi,
                    fecha_caducidad: caja.fecha_caducidad,
                    cantidad: 0,
                    ids_reales: []
                };
            }
            planDePicking[key].cantidad += 1;
            planDePicking[key].ids_reales.push(caja.id);
        });

        const nuevoItemCarrito = {
            ...medicamentoSeleccionado,
            cantidadSolicitada: cantidadTotalRequerida,
            instruccionesPicking: Object.values(planDePicking)
        };

        if (indexExistente >= 0) {
            const nuevoCarrito = [...medicamentosReceta];
            nuevoCarrito[indexExistente] = nuevoItemCarrito;
            setMedicamentosReceta(nuevoCarrito);
        } else {
            setMedicamentosReceta([...medicamentosReceta, nuevoItemCarrito]);
        }

        setMedicamentoSeleccionado(null);
        setBusquedaMed('');
        setCantidadAExtraer('1');
    };

    const agregarAFaltantes = () => {
        if (!busquedaMed.trim()) return;
        setMedicamentosFaltantes([...medicamentosFaltantes, { nombre_solicitado: busquedaMed }]);
        setBusquedaMed('');
        setResultadosBusqueda([]);
    };

    const quitarDelCarrito = (index, tipo) => {
        if (tipo === 'surtir') {
            setMedicamentosReceta(medicamentosReceta.filter((_, i) => i !== index));
        } else {
            setMedicamentosFaltantes(medicamentosFaltantes.filter((_, i) => i !== index));
        }
    };

    // ==========================================
    // 3. MOTOR DE GUARDADO TRANSACCIONAL (BATCH)
    // ==========================================
    const procesarSurtido = async (e) => {
        e.preventDefault();
        if (medicamentosReceta.length === 0 && medicamentosFaltantes.length === 0) {
            alert("Debes agregar al menos un medicamento a la receta o lista de espera.");
            return;
        }

        setGuardando(true);
        try {
            const batch = writeBatch(db);
            const fechaActualISO = new Date().toISOString();

            // 1. GUARDAR PACIENTE
            const pacienteRef = doc(db, "pacientes", telefono);
            batch.set(pacienteRef, {
                nombre: nombrePaciente || "",
                edad: Number(edad) || 0,
                direccion: direccion || "",
                telefono: telefono,
                ultima_visita: fechaActualISO
            }, { merge: true });

            // 2. GUARDAR RECETA
            const recetaRef = doc(collection(db, "recetas"));
            batch.set(recetaRef, {
                folio: folio || "S/N",
                entidad_medica: entidadMedica || "",
                medico: medico || "",
                telefono_paciente: telefono,
                fecha_surtido: fechaActualISO,
                // Guardamos el detalle técnico completo
                medicamentos_entregados: medicamentosReceta.map(m => ({
                    nombre: m.nombre,
                    gramaje: m.gramaje,
                    presentacion: m.presentacion,
                    cantidad_piezas: m.cantidad_piezas, // Cuántas pastillas por caja
                    cantidad: m.cantidadSolicitada,
                    detalle_lotes: m.instruccionesPicking // <--- ¡Aquí está todo el detalle FEFO!
                }))
            });

            // 3. DESCONTAR INVENTARIO FÍSICO
            medicamentosReceta.forEach(med => {
                med.instruccionesPicking.forEach(instruccion => {
                    instruccion.ids_reales.forEach(idFirebase => {
                        const cajaFisicaRef = doc(db, "medicamentos", idFirebase);
                        batch.delete(cajaFisicaRef);
                    });
                });
            });

            // 4. GUARDAR EN LISTA DE ESPERA
            medicamentosFaltantes.forEach(faltante => {
                const esperaRef = doc(collection(db, "lista_espera"));
                batch.set(esperaRef, {
                    nombre_solicitado: faltante.nombre_solicitado || "",
                    telefono_paciente: telefono,
                    nombre_paciente: nombrePaciente || "",
                    estado: "pendiente",
                    fecha_solicitud: fechaActualISO
                });
            });

            await batch.commit();
            alert("¡Receta surtida exitosamente! El inventario ha sido actualizado.");
            window.location.reload();

        } catch (error) {
            console.error("🔥 Error CRÍTICO detectado por Firebase:", error);
            alert("Hubo un problema al procesar la receta. Presiona F12 para ver el error exacto en la consola.");
        } finally {
            setGuardando(false);
        }
    };

    // ==========================================
    // 4. EL RENDERIZADO VISUAL AHORA ES MINIMALISTA
    // ==========================================
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-[80vh]">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Surtir Receta Médica</h1>
                <p className="text-gray-500">Registro de pacientes, control de salida y lista de espera.</p>
            </header>

            <form onSubmit={procesarSurtido} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA */}
                <div className="lg:col-span-4 space-y-6">
                    <DatosPaciente
                        telefono={telefono} setTelefono={setTelefono}
                        nombrePaciente={nombrePaciente} setNombrePaciente={setNombrePaciente}
                        edad={edad} setEdad={setEdad}
                        direccion={direccion} setDireccion={setDireccion}
                        pacienteExistente={pacienteExistente}
                        buscandoPaciente={buscandoPaciente}
                    />

                    <OrigenReceta
                        folio={folio} setFolio={setFolio}
                        entidadMedica={entidadMedica} setEntidadMedica={setEntidadMedica}
                        medico={medico} setMedico={setMedico}
                    />
                </div>

                {/* COLUMNA DERECHA */}
                <div className="lg:col-span-8 flex flex-col space-y-6">

                    <BuscadorMedicamentos
                        medicamentoSeleccionado={medicamentoSeleccionado} setMedicamentoSeleccionado={setMedicamentoSeleccionado}
                        busquedaMed={busquedaMed} setBusquedaMed={setBusquedaMed}
                        resultadosBusqueda={resultadosBusqueda} setResultadosBusqueda={setResultadosBusqueda}
                        cantidadAExtraer={cantidadAExtraer} setCantidadAExtraer={setCantidadAExtraer}
                        agregarAFaltantes={agregarAFaltantes} confirmarAgregadoInventario={confirmarAgregadoInventario}
                    />

                    <TablerosCarrito
                        medicamentosReceta={medicamentosReceta}
                        medicamentosFaltantes={medicamentosFaltantes}
                        quitarDelCarrito={quitarDelCarrito}
                    />

                    <button type="submit" disabled={guardando} className="w-full mt-auto bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg disabled:bg-gray-400 text-lg flex justify-center items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {guardando ? 'Procesando Surtido...' : 'Confirmar y Guardar Receta'}
                    </button>
                </div>
            </form>
        </div>
    );
}