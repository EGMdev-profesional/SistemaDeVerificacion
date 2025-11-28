import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Download, UserCircle } from 'lucide-react';

export const MiQR = () => {
  const { user } = useAuth();

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${user?.codigo}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Código QR</h1>
        <p className="text-gray-600 mt-2">
          Muestra este código QR para registrar tu asistencia
        </p>
      </div>

      <div className="card">
        <div className="text-center">
          {/* Foto de perfil */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
              <UserCircle className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {user?.nombre} {user?.apellidos}
            </h2>
            <p className="text-gray-600 mt-1">Código: {user?.codigo}</p>
          </div>

          {/* Código QR */}
          <div className="inline-block p-8 bg-white border-4 border-blue-600 rounded-2xl shadow-lg">
            <QRCodeSVG
              id="qr-code"
              value={user?.codigo || ''}
              size={280}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Información */}
          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Instrucciones:</strong> Muestra este código QR al administrador para
                registrar tu entrada o salida. Puedes usar tu celular o imprimirlo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Horario de Entrada</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8:00 AM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Horario de Salida</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">1:00 PM</p>
              </div>
            </div>

            <button
              onClick={downloadQR}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Descargar Código QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
