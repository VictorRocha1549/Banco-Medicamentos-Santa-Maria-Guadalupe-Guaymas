import { useState } from 'react';
import { useMedicamentos } from './hooks/useMedicamentos';
import { TarjetaMedicamento } from './components/TarjetaMedicamento';

function Catalogo() {
  const [busqueda, setBusqueda] = useState(""); 
  const { medicamentos, cargando } = useMedicamentos(); 

  // ==========================================
  // LÓGICA DE AGRUPACIÓN (ELIMINAR DUPLICADOS VISUALES)
  // ==========================================
  const agruparMedicamentos = () => {
    // 1. Reducimos el arreglo de cajas a un objeto agrupado
    const objetoAgrupado = medicamentos.reduce((acumulador, cajaFisica) => {
      
      // Creamos un identificador único. Priorizamos el código de barras. 
      // Si no tiene, usamos la combinación exacta de nombre, gramaje y presentación.
      const identificador = cajaFisica.codigo_barras || `${cajaFisica.nombre}-${cajaFisica.gramaje}-${cajaFisica.presentacion}`;
      const idLimpio = identificador.toLowerCase().trim();

      // Si este medicamento aún no existe en nuestro catálogo visual, lo creamos
      if (!acumulador[idLimpio]) {
        acumulador[idLimpio] = {
          ...cajaFisica, // Copiamos nombre, gramaje, presentacion, imagen
          idVisual: idLimpio, // ID único para React
          total_cajas_disponibles: cajaFisica.disponible ? 1 : 0
        };
      } else {
        // Si ya existe, simplemente sumamos una caja disponible más a la cuenta (si aplica)
        if (cajaFisica.disponible) {
          acumulador[idLimpio].total_cajas_disponibles += 1;
        }
      }

      // IMPORTANTE: Si al menos UNA caja agrupada está disponible, 
      // la ficha maestra se muestra como 'Disponible' en el catálogo.
      acumulador[idLimpio].disponible = acumulador[idLimpio].total_cajas_disponibles > 0;

      return acumulador;
    }, {});

    // 2. Convertimos el objeto resultante de vuelta a un arreglo para poder mapearlo
    return Object.values(objetoAgrupado);
  };

  // Obtenemos el catálogo ya filtrado de duplicados
  const catalogoLimpio = agruparMedicamentos();

  // Finalmente, aplicamos la barra de búsqueda del usuario sobre el catálogo limpio
  const medicamentosFiltrados = catalogoLimpio.filter((med) =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-blue-600 text-white p-5 shadow-md">
        <h1 className="text-2xl font-bold text-center">Banco de Medicamentos</h1>
        <p className="text-sm text-center text-blue-100 mt-1">Santa María de Guadalupe</p>
      </header>

      <main className="p-4 max-w-3xl mx-auto mt-4">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar medicamento (ej. Paracetamol)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {cargando ? (
          <div className="text-center py-20">
            <p className="text-blue-600 text-xl font-bold animate-pulse">Consultando inventario en la nube...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {medicamentosFiltrados.length === 0 ? (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500 text-lg">No se encontró ningún medicamento.</p>
              </div>
            ) : (
              // Dibujamos las tarjetas maestras, ocultando las variaciones de pastillas
              medicamentosFiltrados.map((med) => (
                <TarjetaMedicamento key={med.idVisual} medicamento={med} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Catalogo;