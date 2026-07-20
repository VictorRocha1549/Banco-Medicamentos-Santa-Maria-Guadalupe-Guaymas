export function TarjetaMedicamento({ medicamento }) {
  const solicitarPorWhatsApp = () => {
    const numeroWhatsApp = "6221272447";
    const mensaje = `Hola, soy un paciente y quisiera saber si aún tienen disponible el medicamento *${medicamento.nombre} ${medicamento.gramaje}*.`;
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
      <div className="h-48 w-full bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1584308666744-24d5e47225ac?q=80&w=600&auto=format&fit=crop"
          alt={`Caja de ${medicamento.nombre}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5 flex flex-col grow justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {medicamento.nombre} <span className="text-blue-600">{medicamento.gramaje}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{medicamento.presentacion}</p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
              medicamento.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {medicamento.disponible ? 'Disponible' : 'Agotado'}
          </span>
          <button
            disabled={!medicamento.disponible}
            onClick={solicitarPorWhatsApp}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              medicamento.disponible
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );
}