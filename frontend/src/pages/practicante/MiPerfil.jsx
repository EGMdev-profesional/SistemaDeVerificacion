import { useState, useEffect } from 'react';
import { practicanteAPI } from '../../services/api';
import { UserCircle, Save } from 'lucide-react';

export const MiPerfil = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    password: '',
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await practicanteAPI.getMyProfile();
      const data = response.data.data;
      setFormData({
        nombre: data.nombre,
        apellidos: data.apellidos,
        telefono: data.telefono || '',
        email: data.email || '',
        password: '',
      });
      if (data.foto) {
        // Construct URL to serve uploaded images. Remove /api suffix if present
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '');
        setFotoPreview(`${apiBase}/uploads/${data.foto}`);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // If a photo file was selected, send multipart/form-data
      if (fotoFile) {
        const fd = new FormData();
        fd.append('nombre', formData.nombre);
        fd.append('apellidos', formData.apellidos);
        fd.append('telefono', formData.telefono || '');
        fd.append('email', formData.email || '');
        if (formData.password) fd.append('password', formData.password);
        fd.append('foto', fotoFile);
        await practicanteAPI.updateMyProfileForm(fd);
      } else {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await practicanteAPI.updateMyProfile(updateData);
      }
      alert('Perfil actualizado correctamente');
      
      // Limpiar campo de contraseña
      setFormData({ ...formData, password: '' });
      // If updated foto, reload preview from server (simple approach)
      if (fotoFile) {
        // small delay to let server save file
        setTimeout(() => loadProfile(), 500);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleFotoChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFotoFile(f);
      const url = URL.createObjectURL(f);
      setFotoPreview(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Actualiza tu información personal</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Foto" className="w-20 h-20 object-cover" />
            ) : (
              <UserCircle className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {formData.nombre} {formData.apellidos}
            </h2>
            <p className="text-gray-600">Practicante</p>
            <div className="mt-2">
              <input type="file" accept="image/*" onChange={handleFotoChange} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input"
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Dejar en blanco para mantener la actual"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo completa este campo si deseas cambiar tu contraseña
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
