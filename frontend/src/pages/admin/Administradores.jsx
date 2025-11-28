import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { downloadCSV, openPrintPreview, buildHtmlTable } from '../../services/exportUtils';

export const Administradores = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    usuario: '',
    password: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminAPI.update(editingId, updateData);
      } else {
        await adminAPI.create(formData);
      }

      await loadAdmins();
      handleCloseModal();
      alert(editingId ? 'Administrador actualizado correctamente' : 'Administrador creado correctamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar administrador');
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setFormData({
      nombre: admin.nombre,
      apellidos: admin.apellidos,
      usuario: admin.usuario,
      password: '',
      email: admin.email || '',
      telefono: admin.telefono || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return;

    try {
      await adminAPI.delete(id);
      await loadAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar administrador');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      apellidos: '',
      usuario: '',
      password: '',
      email: '',
      telefono: '',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Administradores</h1>
        <p className="text-gray-600 mt-2">Administra los usuarios con acceso al panel</p>
      </div>

      <div className="card mb-6">
        <div className="flex justify-end">
          <div className="flex gap-2 items-center">
            <button className="btn btn-outline" onClick={() => {
              const headers = ['Nombre', 'Apellidos', 'Usuario', 'Email', 'Teléfono', 'Estado'];
              const rows = admins.map(a => ({
                Nombre: a.nombre,
                Apellidos: a.apellidos,
                Usuario: a.usuario,
                Email: a.email || '',
                'Teléfono': a.telefono || '',
                Estado: a.activo ? 'Activo' : 'Inactivo'
              }));
              downloadCSV('administradores.csv', headers, rows);
            }}>CSV</button>
            <button className="btn btn-outline" onClick={() => {
              const headers = ['Nombre', 'Apellidos', 'Usuario', 'Email', 'Teléfono', 'Estado'];
              const rows = admins.map(a => ({
                Nombre: a.nombre,
                Apellidos: a.apellidos,
                Usuario: a.usuario,
                Email: a.email || '',
                'Teléfono': a.telefono || '',
                Estado: a.activo ? 'Activo' : 'Inactivo'
              }));
              const html = buildHtmlTable(headers, rows);
              openPrintPreview('Administradores', html);
            }}>PDF</button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Administrador
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="font-medium">
                      {admin.nombre} {admin.apellidos}
                    </td>
                    <td>{admin.usuario}</td>
                    <td className="text-sm">{admin.email || '-'}</td>
                    <td>{admin.telefono || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          admin.activo ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {admin.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
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
                  {editingId ? 'Editar Administrador' : 'Nuevo Administrador'}
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
                      Usuario *
                    </label>
                    <input
                      type="text"
                      value={formData.usuario}
                      onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                      className="input"
                      required
                      disabled={editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña {editingId && '(dejar en blanco para mantener)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      required={!editingId}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

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
