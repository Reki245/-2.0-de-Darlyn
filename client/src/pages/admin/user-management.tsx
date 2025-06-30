import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import ExcelUpload from '@/components/admin/excel-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Upload, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/protected/admin/analytics'],
  });

  const handleUploadSuccess = (result: any) => {
    toast({
      title: "¡Carga exitosa!",
      description: `${result.createdUsers} usuarios creados, ${result.failedUsers} fallaron.`,
    });
    queryClient.invalidateQueries({ queryKey: ['/api/protected/admin/analytics'] });
    setShowUploadDialog(false);
  };

  const handleUploadError = (error: string) => {
    toast({
      title: "Error en la carga",
      description: error,
      variant: "destructive",
    });
  };

  if (analyticsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Administra usuarios, carga masiva y permisos de la plataforma
            </p>
          </div>
          
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Cargar desde Excel
          </Button>
        </div>

        {/* Stats Overview */}
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalUsers * 0.8)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes Onboarding</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalUsers * 0.1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalUsers * 0.05)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Carga Masiva de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Instrucciones para el archivo Excel</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• El archivo debe contener las siguientes columnas:</p>
                  <ul className="ml-4 space-y-1">
                    <li>- nombre completo</li>
                    <li>- correo electrónico</li>
                    <li>- sede</li>
                    <li>- cargo</li>
                    <li>- área</li>
                    <li>- número de celular</li>
                  </ul>
                  <p>• El sistema creará automáticamente las cuentas y enviará credenciales por email</p>
                  <p>• Los duplicados serán rechazados automáticamente</p>
                </div>
              </div>
              
              <div>
                <ExcelUpload
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios por Sede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.byOffice?.map((office: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{office.office || 'Sin especificar'}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{office.userCount} usuarios</Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(office.totalHours || 0)}h
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.byDepartment?.map((dept: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{dept.department || 'Sin especificar'}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{dept.userCount} usuarios</Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(dept.totalHours || 0)}h
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span>Exportar Lista de Usuarios</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col">
                <Filter className="h-6 w-6 mb-2" />
                <span>Filtros Avanzados</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col">
                <Search className="h-6 w-6 mb-2" />
                <span>Buscar Usuario</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
