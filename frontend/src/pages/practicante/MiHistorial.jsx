import { useEffect, useState } from 'react';
import { asistenciaAPI } from '../../services/api';
import { Calendar, Clock, AlertCircle, CheckCircle, LogIn, LogOut } from 'lucide-react';

export const MiHistorial = () => {
  const [historial, setHistorial] = useState({ asistencias: [], estadisticas: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      const response = await asistenciaAPI.getMiHistorial();
      setHistorial(response.data.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHora = (hora) => {
    return hora.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = historial.estadisticas;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Historial de Asistencias</h1>
        <p className="text-gray-600 mt-2">Revisa tu registro de asistencias y estadísticas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Asistencias</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total_asistencias || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tardanzas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total_tardanzas || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salidas Tempranas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total_salidas_tempranas || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Registro Completo ({historial.asistencias.length})
        </h2>

        {historial.asistencias.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No tienes asistencias registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.asistencias.map((asistencia) => (
                  <tr key={asistencia.id}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
