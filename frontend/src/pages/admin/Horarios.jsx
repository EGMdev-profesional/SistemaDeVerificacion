import { useEffect, useState } from 'react';
import { practicanteAPI, asistenciaAPI } from '../../services/api';
import { downloadCSV, openPrintPreview, buildHtmlTable } from '../../services/exportUtils';
import { Calendar, Clock } from 'lucide-react';

export const Horarios = () => {
  const [practicantes, setPracticantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);

  useEffect(() => {
    loadPracticantes();
  }, []);

  const loadPracticantes = async () => {
    try {
      const res = await practicanteAPI.getAll();
      setPracticantes(res.data.data);
    } catch (err) {
      console.error('Error cargando practicantes:', err);
      alert('Error al cargar practicantes');
    } finally {
      setLoading(false);
    }
  };

  const openAsistencias = async (pr) => {
    setSelected(pr);
    setLoadingAsistencias(true);
    try {
      const res = await asistenciaAPI.getHistorialPracticante(pr.id);
      setAsistencias(res.data.data.asistencias || res.data.data || []);
    } catch (err) {
      console.error('Error cargando asistencias:', err);
      alert('Error al cargar asistencias');
      setAsistencias([]);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setAsistencias([]);
  };

  const formatFecha = (f) => (f ? new Date(f).toLocaleDateString('es-PE') : '');

  const horarioToText = (h) => {
    try {
      const obj = typeof h === 'string' && h ? JSON.parse(h) : h || {};
      const dias = (obj.dias || []).join(', ');
      const horas = obj.entrada || obj.salida ? `${obj.entrada || ''}-${obj.salida || ''}` : '';
      return `${dias} ${horas}`.trim();
    } catch (e) {
      return '';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Horarios</h1>
        <p className="text-gray-600">Listado de practicantes con horario, periodo y registro de asistencias (ingresos/salidas).</p>
      </div>

      <div className="card mb-4">
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = ['Código', 'Nombre', 'Horario', 'Periodo Inicio', 'Periodo Fin'];
              const rows = practicantes.map((p) => ({
                Código: p.codigo,
                Nombre: `${p.nombre} ${p.apellidos}`,
                Horario: horarioToText(p.horario),
                'Periodo Inicio': formatFecha(p.periodo_inicio),
                'Periodo Fin': formatFecha(p.periodo_fin),
              }));
              downloadCSV('horarios_practicantes.csv', headers, rows);
            }}
          >
            CSV
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = ['Código', 'Nombre', 'Horario', 'Periodo Inicio', 'Periodo Fin'];
              const rows = practicantes.map((p) => ({
                Código: p.codigo,
                Nombre: `${p.nombre} ${p.apellidos}`,
                Horario: horarioToText(p.horario),
                'Periodo Inicio': formatFecha(p.periodo_inicio),
                'Periodo Fin': formatFecha(p.periodo_fin),
              }));
              const html = buildHtmlTable(headers, rows);
              openPrintPreview('Horarios - Practicantes', html);
            }}
          >
            PDF
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Horario</th>
                  <th>Periodo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practicantes.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.nombre} {p.apellidos}</td>
                    <td><span className="badge badge-info font-mono">{p.codigo}</span></td>
                    <td>{horarioToText(p.horario) || '-'} </td>
                    <td>{p.periodo_inicio ? `${formatFecha(p.periodo_inicio)} — ${formatFecha(p.periodo_fin)}` : '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-sm" onClick={() => openAsistencias(p)}>
                          <Clock className="w-4 h-4 mr-2" /> Ver Asistencias
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: asistencias */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Asistencias — {selected.nombre} {selected.apellidos}</h3>
                <button onClick={closeModal} className="text-gray-500">Cerrar</button>
              </div>

              {loadingAsistencias ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : asistencias.length === 0 ? (
                <p className="text-gray-500">No hay registros de asistencias.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Tardanza / Salida temprana</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((a) => (
                        <tr key={a.id}>
                          <td>{formatFecha(a.fecha)}</td>
                          <td>{a.hora}</td>
                          <td>{a.tipo}</td>
                          <td>{a.es_tardanza ? 'Tardanza' : a.es_salida_temprana ? 'Salida temprana' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;
