import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // 1. Nuevo estado para capturar lo que el usuario escribe en la barra
  const [busqueda, setBusqueda] = useState(""); 

  useEffect(() => {
    const obtenerMedicamentos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "medicamentos"));
        const listaMedicamentos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setMedicamentos(listaMedicamentos);
        setCargando(false);
      } catch (error) {
        console.error("Error al conectar con Firebase:", error);
        setCargando(false);
      }
    };

    obtenerMedicamentos();
  }, []);

  // 2. Filtramos la lista original en tiempo real basándonos en el texto de búsqueda.
  // Convertimos todo a minúsculas para que la búsqueda no falle por mayúsculas.
  const medicamentosFiltrados = medicamentos.filter((med) =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 3. Función que se dispara al hacer clic en "Solicitar"
  const solicitarPorWhatsApp = (medicamento) => {
    // Número de prueba (puedes usar un Lada 622 temporal para las pruebas)
    const numeroWhatsApp = "6221122447"; 
    
    // Construimos el mensaje inyectando las variables del medicamento
    const mensaje = `Hola, soy un paciente y quisiera saber si aún tienen disponible el medicamento *${medicamento.nombre} ${medicamento.gramaje}*.`;
    
    // Generamos la URL y abrimos una nueva pestaña hacia WhatsApp
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <header className="bg-blue-600 text-white p-5 shadow-md">
        <h1 className="text-2xl font-bold text-center">Banco de Medicamentos</h1>
        <p className="text-sm text-center text-blue-100 mt-1">Santa María de Guadalupe</p>
      </header>

      <main className="p-4 max-w-3xl mx-auto mt-4">
        
        {/* Barra de Búsqueda conectada al estado */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar medicamento (ej. Amoxicilina)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {cargando ? (
          <div className="text-center py-20">
            <p className="text-blue-600 text-xl font-bold animate-pulse">
              Consultando inventario en la nube...
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* Validación: Si escriben algo que no existe, mostramos un mensaje amigable */}
            {medicamentosFiltrados.length === 0 ? (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500 text-lg">No se encontró ningún medicamento con ese nombre en nuestro inventario actual.</p>
              </div>
            ) : (
              // Iteramos sobre la lista ya filtrada en lugar de la original
              medicamentosFiltrados.map((med) => (
                <div key={med.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {med.nombre} <span className="text-blue-600">{med.gramaje}</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{med.presentacion}</p>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${med.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {med.disponible ? 'Disponible' : 'Agotado'}
                    </span>
                    
                    {/* Botón conectado al evento onClick */}
                    <button 
                      disabled={!med.disponible}
                      onClick={() => solicitarPorWhatsApp(med)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${med.disponible ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Solicitar
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;