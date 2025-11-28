import { useEffect, useState } from 'react';
import { reporteAPI } from '../../services/api';
import { Users, UserCheck, Clock, LogOut as LogOutIcon } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await reporteAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Practicantes',
      value: stats?.total_practicantes || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Asistencias Hoy',
      value: stats?.asistencias_hoy || 0,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Tardanzas Hoy',
      value: stats?.tardanzas_hoy || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Salidas Tempranas Hoy',
      value: stats?.salidas_tempranas_hoy || 0,
      icon: LogOutIcon,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de control del sistema de asistencia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-8 h-8 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Sistema</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Horario de Entrada:</span>
              <span className="font-semibold">8:00 AM - 10:00 AM</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Horario de Salida:</span>
              <span className="font-semibold">1:00 PM - 5:00 PM</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Duración de Prácticas:</span>
              <span className="font-semibold">5 horas</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Institución:</span>
              <span className="font-semibold">MUNICIPALIDAD DE PIURA</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="space-y-3">
            <a
              href="/admin/asistencias"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-900">Registrar Asistencia</h3>
              <p className="text-sm text-blue-700 mt-1">Escanear código QR de practicantes</p>
            </a>
            <a
              href="/admin/practicantes"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-900">Gestionar Practicantes</h3>
              <p className="text-sm text-green-700 mt-1">Ver, crear y editar practicantes</p>
            </a>
            <a
              href="/admin/reportes"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-semibold text-purple-900">Ver Reportes</h3>
              <p className="text-sm text-purple-700 mt-1">Estadísticas y reportes detallados</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
