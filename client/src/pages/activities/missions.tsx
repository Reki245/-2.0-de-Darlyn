import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Clock, Users, Heart, UserPlus, Puzzle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function MissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: missions, isLoading } = useQuery({
    queryKey: ['/api/protected/activities', { type: 'micro_mission' }],
    queryFn: () => api.getActivities('micro_mission'),
  });

  const participateMutation = useMutation({
    mutationFn: (missionId: number) => api.participateInActivity(missionId),
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Te has registrado para la micro-misión. Busca compañeros para completarla.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/my-activities'] });
      setShowDetails(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar para la micro-misión.",
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (mission: any) => {
    setSelectedMission(mission);
    setShowDetails(true);
  };

  const handleJoinMission = (missionId: number) => {
    participateMutation.mutate(missionId);
  };

  const filteredMissions = missions?.filter((mission: any) =>
    mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sample missions if none exist
  const sampleMissions = [
    {
      id: 1,
      title: 'Pintar Aulas Escolares',
      description: 'Renovación de espacios educativos en colegio de la comunidad. Actividad en equipo para mejorar el ambiente de aprendizaje.',
      duration: 3,
      isVirtual: false,
      location: 'Colegio San Martín - Villa El Salvador',
      maxParticipants: 4,
      pointsReward: 50,
      type: 'micro_mission',
      status: 'published'
    },
    {
      id: 2,
      title: 'Entrega de Kits Alimentarios',
      description: 'Distribución de kits de alimentos en comunidades vulnerables. Trabajo en pareja para llegar a más familias.',
      duration: 2,
      isVirtual: false,
      location: 'Pueblo Joven Las Flores',
      maxParticipants: 2,
      pointsReward: 40,
      type: 'micro_mission',
      status: 'published'
    },
    {
      id: 3,
      title: 'Lectura Infantil Comunitaria',
      description: 'Sesiones de lectura para niños en bibliotecas comunitarias. Fomenta el amor por la lectura.',
      duration: 1.5,
      isVirtual: false,
      location: 'Biblioteca Comunitaria - Los Olivos',
      maxParticipants: 3,
      pointsReward: 35,
      type: 'micro_mission',
      status: 'published'
    },
    {
      id: 4,
      title: 'Limpieza de Parque Comunitario',
      description: 'Jornada de limpieza y embellecimiento de espacios públicos. Ideal para hacer en grupo.',
      duration: 2.5,
      isVirtual: false,
      location: 'Parque Central - San Juan de Miraflores',
      maxParticipants: 6,
      pointsReward: 45,
      type: 'micro_mission',
      status: 'published'
    }
  ];

  const displayMissions = filteredMissions.length > 0 ? filteredMissions : sampleMissions.filter(mission =>
    mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Micro-Misiones</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Micro-Misiones</h1>
            <p className="text-gray-600 mt-2">
              Acciones concretas y rápidas que puedes realizar en pareja o equipo
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Puzzle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">Sistema de Nominación</h3>
              <p className="text-orange-800 text-sm">
                ¡Invita a un compañero! Si ambos completan la micro-misión juntos, recibirán reconocimiento doble 
                y puntos adicionales por colaboración.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar micro-misiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMissions.map((mission: any) => (
            <Card key={mission.id} className="activity-card group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Micro-Misión
                  </Badge>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">{mission.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {mission.description}
                </p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{mission.duration} horas</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <span className="mr-2">📍</span>
                    <span>{mission.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {mission.maxParticipants === 2 ? '2 personas (pareja)' : 
                       `${mission.maxParticipants} personas máximo`}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-orange-800 text-xs">
                    <UserPlus className="mr-1 h-3 w-3" />
                    <span className="font-medium">Puedes nominar a un compañero</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {mission.pointsReward} puntos
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                      +Bono colaboración
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(mission)}
                    >
                      Ver Más
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleJoinMission(mission.id)}
                      disabled={participateMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {participateMutation.isPending ? 'Uniéndose...' : 'Unirse'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayMissions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Puzzle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron micro-misiones
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda.'
                  : 'Pronto habrá nuevas micro-misiones disponibles.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mission Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Puzzle className="mr-2 h-5 w-5 text-orange-600" />
                {selectedMission?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMission && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descripción de la Misión</h3>
                  <p className="text-gray-600">{selectedMission.description}</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Detalles de la Actividad</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-orange-800">Ubicación:</span>
                      <p className="text-orange-700">{selectedMission.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-orange-800">Duración:</span>
                      <p className="text-orange-700">{selectedMission.duration} horas</p>
                    </div>
                    <div>
                      <span className="font-medium text-orange-800">Equipo:</span>
                      <p className="text-orange-700">
                        {selectedMission.maxParticipants === 2 ? 'En pareja' : 
                         `Equipo de ${selectedMission.maxParticipants} personas`}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-orange-800">Puntos base:</span>
                      <p className="text-orange-700">{selectedMission.pointsReward} puntos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Sistema de Nominación</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Puedes invitar a un compañero a unirse contigo</p>
                    <p>• Si completan la misión juntos, ambos reciben puntos extra</p>
                    <p>• Bonus de colaboración: +25% de puntos adicionales</p>
                    <p>• Reconocimiento especial en el dashboard</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">¿Qué necesitas llevar?</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Ropa cómoda y apropiada para trabajo físico</li>
                    <li>• Actitud positiva y ganas de colaborar</li>
                    <li>• Identificación como empleado de Manuchar</li>
                    <li>• Los materiales serán proporcionados por la organización</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => handleJoinMission(selectedMission.id)}
                    disabled={participateMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {participateMutation.isPending ? 'Uniéndose...' : 'Unirse a la Misión'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
