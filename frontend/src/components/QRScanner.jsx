import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Upload, Image as ImageIcon } from 'lucide-react';

export const QRScanner = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' o 'file'
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Obtener lista de cámaras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error al obtener cámaras:', err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      onError?.('No hay cámara disponible');
      return;
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error al iniciar escáner:', err);
      onError?.('Error al iniciar la cámara');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Error al detener escáner:', err);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Crear una nueva instancia temporal para escanear archivos
      const html5QrCode = new Html5Qrcode('qr-file-reader');
      const result = await html5QrCode.scanFile(file, true);
      
      onScan(result);
      
      // Limpiar el input para permitir cargar la misma imagen nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error al escanear imagen:', err);
      onError?.('No se pudo leer el código QR de la imagen. Asegúrate de que la imagen contenga un código QR válido.');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Selector de modo */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => {
            setScanMode('camera');
            if (isScanning) stopScanning();
          }}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            scanMode === 'camera'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Camera className="w-5 h-5 inline-block mr-2" />
          Escanear con Cámara
        </button>
        <button
          onClick={() => {
            setScanMode('file');
            if (isScanning) stopScanning();
          }}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            scanMode === 'file'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="w-5 h-5 inline-block mr-2" />
          Cargar Imagen
        </button>
      </div>

      {/* Modo Cámara */}
      {scanMode === 'camera' && (
        <>
          <div className="flex items-center gap-4">
            {cameras.length > 1 && (
              <select
                value={selectedCamera || ''}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isScanning}
                className="input flex-1"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Cámara ${camera.id}`}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={isScanning ? stopScanning : startScanning}
              className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} flex items-center gap-2`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-5 h-5" />
                  Detener
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Iniciar Cámara
                </>
              )}
            </button>
          </div>

          <div
            id="qr-reader"
            ref={scannerRef}
            className="w-full rounded-lg overflow-hidden border-2 border-gray-300"
            style={{ minHeight: '300px' }}
          />

          {!isScanning && (
            <div className="text-center text-gray-500 py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Haz clic en "Iniciar Cámara" para comenzar a escanear códigos QR</p>
            </div>
          )}
        </>
      )}

      {/* Modo Cargar Imagen */}
      {scanMode === 'file' && (
        <div className="space-y-4">
          {/* Elemento oculto para el escáner de archivos */}
          <div id="qr-file-reader" style={{ display: 'none' }}></div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Haz clic para cargar una imagen
            </p>
            <p className="text-sm text-gray-500">
              Selecciona una imagen que contenga un código QR
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formatos soportados: JPG, PNG, GIF, etc.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Consejo:</strong> Asegúrate de que el código QR sea visible y esté bien iluminado en la imagen para mejores resultados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
