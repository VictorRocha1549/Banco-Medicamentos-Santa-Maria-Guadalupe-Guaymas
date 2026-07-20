export function DatosPaciente({ 
  telefono, setTelefono, 
  nombrePaciente, setNombrePaciente, 
  edad, setEdad, 
  direccion, setDireccion, 
  pacienteExistente, buscandoPaciente 
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-purple-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          Datos del Paciente
        </h2>
        {pacienteExistente && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold">Expediente Encontrado</span>}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono (10 dígitos) *</label>
          <div className="relative">
            <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full p-2 pl-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${pacienteExistente ? 'border-purple-300 bg-purple-50' : 'border-gray-300'}`} placeholder="Ej. 6221234567" />
            {buscandoPaciente && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input type="text" required value={nombrePaciente} onChange={(e) => setNombrePaciente(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white" />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Edad *</label>
            <input type="number" required value={edad} onChange={(e) => setEdad(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white" min="0" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Dirección *</label>
            <input type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white" placeholder="Colonia, Calle..." />
          </div>
        </div>
      </div>
    </div>
  );
}