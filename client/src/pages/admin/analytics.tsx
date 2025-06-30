import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Clock, Trophy, Target, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/protected/admin/analytics'],
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = analytics?.overview || {
    totalUsers: 0,
    totalHours: 0,
    totalActivities: 0,
    completedActivities: 0
  };

  // Sample data for charts (in production, this would come from the API)
  const monthlyData = [
    { month: 'Ene', horas: 120, usuarios: 45, actividades: 8 },
    { month: 'Feb', horas: 180, usuarios: 67, actividades: 12 },
    { month: 'Mar', horas: 240, usuarios: 89, actividades: 15 },
    { month: 'Abr', horas: 190, usuarios: 78, actividades: 13 },
    { month: 'May', horas: 280, usuarios: 95, actividades: 18 },
    { month: 'Jun', horas: 350, usuarios: 120, actividades: 22 }
  ];

  const sdgData = [
    { name: 'ODS 4: Educación', value: 35, color: '#3B82F6' },
    { name: 'ODS 8: Trabajo Decente', value: 25, color: '#10B981' },
    { name: 'ODS 17: Alianzas', value: 20, color: '#F59E0B' },
    { name: 'ODS 11: Ciudades', value: 12, color: '#8B5CF6' },
    { name: 'Otros', value: 8, color: '#EF4444' }
  ];

  const officeData = analytics?.byOffice?.map((office: any) => ({
    name: office.office || 'Sin especificar',
    usuarios: office.userCount,
    horas: Math.round(office.totalHours || 0)
  })) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Métricas y estadísticas de la plataforma de voluntariado
            </p>
          </div>
          
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs mes anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalHours)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +28% vs mes anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actividades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% vs mes anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedActivities}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +22% vs mes anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="horas" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Horas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Usuarios Activos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SDG Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por ODS</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sdgData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sdgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Office Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Sede</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={officeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usuarios" fill="#3B82F6" name="Usuarios" />
                <Bar dataKey="horas" fill="#10B981" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'María Rodríguez', hours: 47, badge: 'Líder Social' },
                  { name: 'Carlos Mendoza', hours: 38, badge: 'Colaborador Estrella' },
                  { name: 'Ana García', hours: 35, badge: 'Voluntario Comprometido' },
                  { name: 'Luis Torres', hours: 32, badge: 'Innovador Social' },
                  { name: 'Carmen López', hours: 28, badge: 'Agente de Cambio' }
                ].map((participant, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-gray-500">{participant.hours} horas</p>
                    </div>
                    <Badge variant="secondary">{participant.badge}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividades Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Mentoría Profesional', participants: 45, type: 'ONG' },
                  { name: 'Alfabetización Digital', participants: 38, type: 'ONG' },
                  { name: 'Encuesta Social', participants: 32, type: 'Lab' },
                  { name: 'Pintar Aulas', participants: 28, type: 'Micro-Misión' },
                  { name: 'Autoliderazgo', participants: 25, type: 'Formación' }
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-gray-500">{activity.participants} participantes</p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
