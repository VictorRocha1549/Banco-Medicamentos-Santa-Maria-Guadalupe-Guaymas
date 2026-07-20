import { useMedicamentos } from '../hooks/useMedicamentos';
import { FormularioMedicamento } from './FormularioMedicamento';
import { TablaInventario } from './TablaInventario';

export function PanelInventario() {
  const { medicamentos, cargando, agregarMedicamento, eliminarMedicamento, retirarLoteCaducado } = useMedicamentos();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Voluntarios</h1>
        <p className="text-gray-500">Gestión de inventario del Banco de Medicamentos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FormularioMedicamento onGuardar={agregarMedicamento} inventario={medicamentos} />
        
        <TablaInventario 
          medicamentos={medicamentos} 
          cargando={cargando}
          onEliminar={eliminarMedicamento}
          onRetirarLote={retirarLoteCaducado}
        />
      </div>
    </div>
  );
}