import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [camaras, setCamaras] = useState([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState(null);
  const html5QrCodeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Obtener lista de cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCamaras(devices);
          // Seleccionar por defecto la cámara trasera si existe, si no la primera
          const trasera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera'));
          setCamaraSeleccionada(trasera?.id || devices[0].id);
        } else {
          setError('No se encontraron cámaras.');
        }
      })
      .catch((err) => setError('Error al acceder a las cámaras: ' + err.message));
  }, []);

  useEffect(() => {
    if (!camaraSeleccionada || !containerRef.current) return;

    const html5QrCode = new Html5Qrcode('scanner-container');
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 100 },
      aspectRatio: 1.777,
    };

    html5QrCode
      .start(
        camaraSeleccionada,
        config,
        (decodedText) => {
          // Código detectado
          onScan(decodedText);
          detenerScanner();
        },
        () => {
          // Error de escaneo (ignorado, se sigue escaneando)
        }
      )
      .catch((err) => setError('Error al iniciar la cámara: ' + err.message));

    return () => {
      detenerScanner();
    };
  }, [camaraSeleccionada]);

  const detenerScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current = null;
        })
        .catch((err) => console.warn('Error al detener scanner:', err));
    }
  };

  const cambiarCamara = (e) => {
    setCamaraSeleccionada(e.target.value);
  };

  const cerrar = () => {
    detenerScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-gray-800">Escanear código de barras</h2>
          <button
            onClick={cerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={cerrar}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {camaras.length > 1 && (
              <div className="p-2 bg-gray-50 border-b">
                <select
                  value={camaraSeleccionada || ''}
                  onChange={cambiarCamara}
                  className="w-full p-2 text-sm border rounded-lg"
                >
                  {camaras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Cámara ${cam.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div ref={containerRef} id="scanner-container" className="w-full aspect-video bg-gray-100" />

            <div className="p-3 text-center text-sm text-gray-500">
              Apunta el código de barras al recuadro.
            </div>
          </>
        )}
      </div>
    </div>
  );
}