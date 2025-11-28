import { useEffect, useState } from 'react';
import { asistenciaAPI } from '../../services/api';
import { QRScanner } from '../../components/QRScanner';
import { CheckCircle, XCircle, Clock, Trash2, LogIn, LogOut } from 'lucide-react';

export const Asistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoRegistro, setTipoRegistro] = useState('entrada');

  useEffect(() => {
    loadAsistenciasHoy();
  }, []);

  const loadAsistenciasHoy = async () => {
    try {
      const response = await asistenciaAPI.getHoy();
      setAsistencias(response.data.data);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (codigo) => {
    if (registrando) return;

    setRegistrando(true);
    setMensaje(null);

    try {
      const response = await asistenciaAPI.registrar({
        codigo,
        tipo: tipoRegistro,
      });

      setMensaje({
        type: 'success',
        text: response.data.message,
        data: response.data.data,
      });

      // Recargar lista de asistencias
      await loadAsistenciasHoy();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setMensaje({
        type: 'error',
        text: error.response?.data?.message || 'Error al registrar asistencia',
      });

      setTimeout(() => setMensaje(null), 5000);
    } finally {
      setRegistrando(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      await asistenciaAPI.delete(id);
      await loadAsistenciasHoy();
    } catch (error) {
      alert('Error al eliminar asistencia');
    }
  };

  const formatHora = (hora) => {
    return hora.substring(0, 5);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencias</h1>
        <p className="text-gray-600 mt-2">Escanea el código QR para registrar entrada o salida</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Escáner QR */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Escáner QR</h2>

            {/* Selector de tipo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Registro
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTipoRegistro('entrada')}
                  className={`btn ${
                    tipoRegistro === 'entrada' ? 'btn-primary' : 'btn-secondary'
                  } flex items-center justify-center gap-2`}
                >
                  <LogIn className="w-4 h-4" />
                  Entrada
                </button>
                <button
                  onClick={() => setTipoRegistro('salida')}
                  className={`btn ${
                    tipoRegistro === 'salida' ? 'btn-primary' : 'btn-secondary'
                  } flex items-center justify-center gap-2`}
                >
                  <LogOut className="w-4 h-4" />
                  Salida
                </button>
              </div>
            </div>

            {/* Mensaje de resultado */}
            {mensaje && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  mensaje.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {mensaje.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        mensaje.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {mensaje.text}
                    </p>
                    {mensaje.data && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p>
                          <strong>Practicante:</strong> {mensaje.data.practicante}
                        </p>
                        <p>
                          <strong>Hora:</strong> {formatHora(mensaje.data.hora)}
                        </p>
                        {mensaje.data.es_tardanza && (
                          <p className="text-yellow-700 font-semibold">⚠️ Tardanza</p>
                        )}
                        {mensaje.data.es_salida_temprana && (
                          <p className="text-orange-700 font-semibold">⚠️ Salida Temprana</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Escáner */}
            <QRScanner
              onScan={handleScan}
              onError={(error) => setMensaje({ type: 'error', text: error })}
            />
          </div>
        </div>

        {/* Lista de asistencias de hoy */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Asistencias de Hoy ({asistencias.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : asistencias.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No hay asistencias registradas hoy</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.map((asistencia) => (
                      <tr key={asistencia.id}>
                        <td className="font-medium">{asistencia.practicante_nombre}</td>
                        <td>
                          <span className="badge badge-info">{asistencia.codigo}</span>
                        </td>
                        <td>{formatFecha(asistencia.fecha)}</td>
                        <td className="font-mono">{formatHora(asistencia.hora)}</td>
                        <td>
                          <span
                            className={`badge ${
                              asistencia.tipo === 'entrada' ? 'badge-success' : 'badge-info'
                            }`}
                          >
                            {asistencia.tipo === 'entrada' ? (
                              <LogIn className="w-3 h-3 mr-1" />
                            ) : (
                              <LogOut className="w-3 h-3 mr-1" />
                            )}
                            {asistencia.tipo}
                          </span>
                        </td>
                        <td>
                          {asistencia.es_tardanza && (
                            <span className="badge badge-warning">Tardanza</span>
                          )}
                          {asistencia.es_salida_temprana && (
                            <span className="badge badge-warning">Salida Temprana</span>
                          )}
                          {!asistencia.es_tardanza && !asistencia.es_salida_temprana && (
                            <span className="badge badge-success">Normal</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(asistencia.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
