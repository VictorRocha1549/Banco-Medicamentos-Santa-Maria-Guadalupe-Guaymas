import { Link } from 'react-router-dom';

function Admin() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[80vh] flex flex-col justify-center">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-gray-500 mt-2">Selecciona el módulo con el que deseas trabajar</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MÓDULO 1: Inventario */}
        <Link to="/admin/inventario" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex items-start space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Auditoría de Inventario</h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa nuevos donativos, revisa caducidades y retira lotes vencidos.</p>
          </div>
        </Link>

        {/* MÓDULO 2: Almacén y Cajas */}
        <Link to="/admin/cajas" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-300 transition-all flex items-start space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">Gestión de Cajas</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los contenedores físicos de reserva y su ubicación.</p>
          </div>
        </Link>

        {/* MÓDULO 3: Recetas */}
        <Link to="/admin/surtir-receta" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all flex items-start space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Surtir Receta</h2>
            <p className="text-sm text-gray-500 mt-1">Registra pacientes, captura recetas médicas y descuenta medicamentos.</p>
          </div>
        </Link>

        {/* MÓDULO 4: Pacientes */}
        <Link to="/admin/pacientes" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all flex items-start space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Directorio de Pacientes</h2>
            <p className="text-sm text-gray-500 mt-1">Historial médico, perfiles y medicamentos en lista de espera.</p>
          </div>
        </Link>

        {/* MÓDULO 5: Reportes */}
        <Link to="/admin/reportes" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all flex items-start space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Reportes</h2>
            <p className="text-sm text-gray-500 mt-1">Genera informes y análisis sobre el rendimiento de la farmacia.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default Admin;