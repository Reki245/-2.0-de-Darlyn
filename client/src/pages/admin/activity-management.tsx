import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ActivityManagementPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    type: 'ong_volunteering',
    organizationId: '',
    location: '',
    isVirtual: false,
    maxParticipants: '',
    duration: '',
    scheduledDate: undefined as Date | undefined,
    registrationDeadline: undefined as Date | undefined,
    pointsReward: '',
    sdgGoals: [] as number[],
    requiredSkills: [] as string[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/protected/activities'],
  });

  const { data: organizations } = useQuery({
    queryKey: ['/api/protected/admin/organizations'],
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: any) => api.createActivity(data),
    onSuccess: () => {
      toast({
        title: "¡Actividad creada!",
        description: "La actividad ha sido creada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/activities'] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la actividad.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNewActivity({
      title: '',
      description: '',
      type: 'ong_volunteering',
      organizationId: '',
      location: '',
      isVirtual: false,
      maxParticipants: '',
      duration: '',
      scheduledDate: undefined,
      registrationDeadline: undefined,
      pointsReward: '',
      sdgGoals: [],
      requiredSkills: []
    });
  };

  const handleCreateActivity = () => {
    const activityData = {
      ...newActivity,
      organizationId: newActivity.organizationId ? parseInt(newActivity.organizationId) : undefined,
      maxParticipants: newActivity.maxParticipants ? parseInt(newActivity.maxParticipants) : undefined,
      duration: newActivity.duration ? parseInt(newActivity.duration) : undefined,
      pointsReward: newActivity.pointsReward ? parseInt(newActivity.pointsReward) : 0,
      status: 'published'
    };

    createActivityMutation.mutate(activityData);
  };

  const filteredActivities = activities?.filter((activity: any) => 
    selectedType === 'all' || activity.type === selectedType
  ) || [];

  const activityTypeLabels = {
    'ong_volunteering': 'Voluntariado ONG',
    'lab': 'Lab de Voluntariado',
    'micro_mission': 'Micro-Misión',
    'training': 'Formación'
  };

  const sdgOptions = [
    { value: 1, label: 'ODS 1: Fin de la Pobreza' },
    { value: 3, label: 'ODS 3: Salud y Bienestar' },
    { value: 4, label: 'ODS 4: Educación de Calidad' },
    { value: 5, label: 'ODS 5: Igualdad de Género' },
    { value: 8, label: 'ODS 8: Trabajo Decente' },
    { value: 10, label: 'ODS 10: Reducción de Desigualdades' },
    { value: 11, label: 'ODS 11: Ciudades Sostenibles' },
    { value: 13, label: 'ODS 13: Acción por el Clima' },
    { value: 16, label: 'ODS 16: Paz y Justicia' },
    { value: 17, label: 'ODS 17: Alianzas para los Objetivos' }
  ];

  if (activitiesLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
            <p className="text-gray-600 mt-2">
              Crea y administra voluntariados, labs y micro-misiones
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Actividad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Actividad</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título de la Actividad</Label>
                    <Input
                      id="title"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Mentoría Profesional"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo de Actividad</Label>
                    <Select value={newActivity.type} onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ong_volunteering">Voluntariado ONG</SelectItem>
                        <SelectItem value="lab">Lab de Voluntariado</SelectItem>
                        <SelectItem value="micro_mission">Micro-Misión</SelectItem>
                        <SelectItem value="training">Formación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la actividad y su impacto..."
                    rows={3}
                  />
                </div>

                {newActivity.type === 'ong_volunteering' && (
                  <div>
                    <Label htmlFor="organization">Organización</Label>
                    <Select value={newActivity.organizationId} onValueChange={(value) => setNewActivity(prev => ({ ...prev, organizationId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ONG" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations?.map((org: any) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={newActivity.location}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lima Centro, Oficina Principal..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      checked={newActivity.isVirtual}
                      onCheckedChange={(checked) => setNewActivity(prev => ({ ...prev, isVirtual: checked }))}
                    />
                    <Label>Actividad Virtual</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Máx. Participantes</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newActivity.maxParticipants}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      placeholder="20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duración (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pointsReward">Puntos de Recompensa</Label>
                    <Input
                      id="pointsReward"
                      type="number"
                      value={newActivity.pointsReward}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, pointsReward: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Programada</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newActivity.scheduledDate ? format(newActivity.scheduledDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newActivity.scheduledDate}
                          onSelect={(date) => setNewActivity(prev => ({ ...prev, scheduledDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Fecha Límite de Registro</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newActivity.registrationDeadline ? format(newActivity.registrationDeadline, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newActivity.registrationDeadline}
                          onSelect={(date) => setNewActivity(prev => ({ ...prev, registrationDeadline: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateActivity}
                    disabled={!newActivity.title || !newActivity.description || createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? 'Creando...' : 'Crear Actividad'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Activity Type Filter */}
        <div className="flex space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
          >
            Todas
          </Button>
          <Button
            variant={selectedType === 'ong_volunteering' ? 'default' : 'outline'}
            onClick={() => setSelectedType('ong_volunteering')}
          >
            Voluntariados ONG
          </Button>
          <Button
            variant={selectedType === 'lab' ? 'default' : 'outline'}
            onClick={() => setSelectedType('lab')}
          >
            Labs
          </Button>
          <Button
            variant={selectedType === 'micro_mission' ? 'default' : 'outline'}
            onClick={() => setSelectedType('micro_mission')}
          >
            Micro-Misiones
          </Button>
          <Button
            variant={selectedType === 'training' ? 'default' : 'outline'}
            onClick={() => setSelectedType('training')}
          >
            Formación
          </Button>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity: any) => (
            <Card key={activity.id} className="activity-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="mb-2">
                    {activityTypeLabels[activity.type as keyof typeof activityTypeLabels]}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {activity.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  {activity.location && (
                    <div className="flex items-center text-gray-500">
                      <span className="mr-2">📍</span>
                      <span>{activity.isVirtual ? 'Virtual' : activity.location}</span>
                    </div>
                  )}
                  
                  {activity.duration && (
                    <div className="flex items-center text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{activity.duration} horas</span>
                    </div>
                  )}
                  
                  {activity.maxParticipants && (
                    <div className="flex items-center text-gray-500">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Máx. {activity.maxParticipants} participantes</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Badge variant={activity.status === 'published' ? 'default' : 'secondary'}>
                      {activity.status === 'published' ? 'Publicado' : 'Borrador'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {activity.pointsReward} puntos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay actividades
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedType === 'all' 
                  ? 'Aún no has creado ninguna actividad.'
                  : `No hay actividades del tipo ${activityTypeLabels[selectedType as keyof typeof activityTypeLabels]}.`
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Crear Primera Actividad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
