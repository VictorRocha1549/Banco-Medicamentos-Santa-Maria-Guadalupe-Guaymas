export function OrigenReceta({ folio, setFolio, entidadMedica, setEntidadMedica, medico, setMedico }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Origen de la Receta
      </h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Folio (Opcional)</label>
          <input type="text" value={folio} onChange={(e) => setFolio(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Entidad Médica *</label>
          <input type="text" required value={entidadMedica} onChange={(e) => setEntidadMedica(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Médico que prescribe *</label>
          <input type="text" required value={medico} onChange={(e) => setMedico(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </div>
  );
}