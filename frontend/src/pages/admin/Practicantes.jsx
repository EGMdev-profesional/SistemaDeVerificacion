import { useEffect, useState } from 'react';
import { practicanteAPI } from '../../services/api';
import { Plus, Edit, Trash2, Search, X, Eye } from 'lucide-react';
import { downloadCSV, openPrintPreview, buildHtmlTable } from '../../services/exportUtils';

export const Practicantes = () => {
  const [practicantes, setPracticantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    documento: '',
    telefono: '',
    codigo: '',
    email: '',
    horario: { dias: [], entrada: '', salida: '' },
    periodo_inicio: '',
    periodo_fin: '',
  });

  useEffect(() => {
    loadPracticantes();
  }, []);

  const formatDateShort = (d) => {
    if (!d) return '';
    try {
      if (typeof d === 'string' && d.includes('T')) return d.split('T')[0];
      if (typeof d === 'string') return d;
      return new Date(d).toISOString().split('T')[0];
    } catch (e) {
      return String(d);
    }
  };

  const loadPracticantes = async () => {
    try {
      const response = await practicanteAPI.getAll();
      setPracticantes(response.data.data);
    } catch (error) {
      console.error('Error al cargar practicantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await practicanteAPI.update(editingId, formData);
      } else {
        await practicanteAPI.create(formData);
      }

      await loadPracticantes();
      handleCloseModal();
      alert(editingId ? 'Practicante actualizado correctamente' : 'Practicante creado correctamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar practicante');
    }
  };

  const handleEdit = (practicante) => {
    setEditingId(practicante.id);
    let horarioObj = { dias: [], entrada: '', salida: '' };
    try {
      if (practicante.horario) {
        horarioObj = typeof practicante.horario === 'string' ? JSON.parse(practicante.horario) : practicante.horario;
      }
    } catch (err) {
      horarioObj = { dias: [], entrada: '', salida: '' };
    }

    setFormData({
      nombre: practicante.nombre,
      apellidos: practicante.apellidos,
      documento: practicante.documento,
      telefono: practicante.telefono || '',
      codigo: practicante.codigo,
      email: practicante.email || '',
      horario: horarioObj,
      periodo_inicio: practicante.periodo_inicio || '',
      periodo_fin: practicante.periodo_fin || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este practicante?')) return;

    try {
      await practicanteAPI.delete(id);
      await loadPracticantes();
    } catch (error) {
      alert('Error al eliminar practicante');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      apellidos: '',
      documento: '',
      telefono: '',
      codigo: '',
      email: '',
      horario: { dias: [], entrada: '', salida: '' },
      periodo_inicio: '',
      periodo_fin: '',
    });
  };

  const handleNew = async () => {
    try {
      const res = await practicanteAPI.getNextCode();
      const codigo = res.data?.data?.codigo || '';
      setFormData({
        nombre: '',
        apellidos: '',
        documento: '',
        telefono: '',
        codigo: codigo,
        email: '',
        horario: { dias: [], entrada: '', salida: '' },
        periodo_inicio: '',
        periodo_fin: '',
      });
      setEditingId(null);
      setShowModal(true);
    } catch (error) {
      console.error('Error obteniendo siguiente código:', error);
      alert('No se pudo obtener el siguiente código. Intenta de nuevo.');
    }
  };

  const filteredPracticantes = practicantes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.documento.includes(searchTerm)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Practicantes</h1>
        <p className="text-gray-600 mt-2">Administra los practicantes del sistema</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button onClick={handleNew} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Practicante
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-end gap-2 mb-4">
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = ['Código', 'Nombre', 'Apellidos', 'Documento', 'Teléfono', 'Email', 'Horario', 'Periodo Inicio', 'Periodo Fin', 'Estado'];
              const rows = practicantes.map((p) => {
                let horarioText = '';
                try {
                  const h = typeof p.horario === 'string' && p.horario ? JSON.parse(p.horario) : p.horario || {};
                  if (h && (h.dias || h.entrada || h.salida)) {
                    horarioText = `${(h.dias || []).join(', ')} ${h.entrada || ''}-${h.salida || ''}`.trim();
                  }
                } catch (e) {
                  horarioText = '';
                }
                return {
                  Código: p.codigo,
                  Nombre: p.nombre,
                  Apellidos: p.apellidos,
                  Documento: p.documento,
                  'Teléfono': p.telefono || '',
                  Email: p.email || '',
                  Horario: horarioText,
                  'Periodo Inicio': formatDateShort(p.periodo_inicio),
                  'Periodo Fin': formatDateShort(p.periodo_fin),
                  Estado: p.activo ? 'Activo' : 'Inactivo',
                };
              });
              downloadCSV('practicantes.csv', headers, rows);
            }}
          >
            CSV
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = ['Código', 'Nombre', 'Apellidos', 'Documento', 'Teléfono', 'Email', 'Horario', 'Periodo Inicio', 'Periodo Fin', 'Estado'];
              const rows = practicantes.map((p) => {
                let horarioText = '';
                try {
                  const h = typeof p.horario === 'string' && p.horario ? JSON.parse(p.horario) : p.horario || {};
                  if (h && (h.dias || h.entrada || h.salida)) {
                    horarioText = `${(h.dias || []).join(', ')} ${h.entrada || ''}-${h.salida || ''}`.trim();
                  }
                } catch (e) {
                  horarioText = '';
                }
                return {
                  Código: p.codigo,
                  Nombre: p.nombre,
                  Apellidos: p.apellidos,
                  Documento: p.documento,
                  'Teléfono': p.telefono || '',
                  Email: p.email || '',
                  Horario: horarioText,
                  'Periodo Inicio': formatDateShort(p.periodo_inicio),
                  'Periodo Fin': formatDateShort(p.periodo_fin),
                  Estado: p.activo ? 'Activo' : 'Inactivo',
                };
              });
              const html = buildHtmlTable(headers, rows);
              openPrintPreview('Practicantes', html);
            }}
          >
            PDF
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPracticantes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No se encontraron practicantes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre Completo</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPracticantes.map((practicante) => (
                  <tr key={practicante.id}>
                    <td>
                      <span className="badge badge-info font-mono">{practicante.codigo}</span>
                    </td>
                    <td className="font-medium">
                      {practicante.nombre} {practicante.apellidos}
                    </td>
                    <td>{practicante.documento}</td>
                    <td>{practicante.telefono || '-'}</td>
                    <td className="text-sm">{practicante.email || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          practicante.activo ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {practicante.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(practicante)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(practicante.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleCloseModal} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Editar Practicante' : 'Nuevo Practicante'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documento (DNI) *
                    </label>
                    <input
                      type="text"
                      value={formData.documento}
                       onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números usando una expresión regular
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, documento: value });
                      }
                    }}
                      
                      className="input"
                      maxLength="8"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      className="input"
                      placeholder="Ej: PRACT-0001"
                      required
                      disabled={!editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números usando una expresión regular
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, telefono: value });
                      }
                    }}
                    className="input"
                    maxLength="9"
                    required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                {/* Horario */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario (opcional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Días</p>
                      <div className="flex flex-wrap gap-2">
                        {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map((d) => (
                          <label key={d} className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.horario.dias.includes(d)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => {
                                  const dias = new Set(prev.horario.dias || []);
                                  if (checked) dias.add(d); else dias.delete(d);
                                  return { ...prev, horario: { ...prev.horario, dias: Array.from(dias) } };
                                });
                              }}
                            />
                            <span className="text-sm">{d.substring(0,3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Hora Entrada</p>
                      <input
                        type="time"
                        value={formData.horario.entrada}
                        onChange={(e) => setFormData({ ...formData, horario: { ...formData.horario, entrada: e.target.value } })}
                        className="input"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Hora Salida</p>
                      <input
                        type="time"
                        value={formData.horario.salida}
                        onChange={(e) => setFormData({ ...formData, horario: { ...formData.horario, salida: e.target.value } })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                {/* Periodo */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Periodo - Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.periodo_inicio}
                      onChange={(e) => setFormData({ ...formData, periodo_inicio: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Periodo - Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.periodo_fin}
                      onChange={(e) => setFormData({ ...formData, periodo_fin: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                {!editingId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> El usuario será el mismo que el código. La contraseña
                      por defecto será <strong>123456</strong>
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
