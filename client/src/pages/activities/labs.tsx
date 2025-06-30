import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Clock, Users, Lightbulb, Beaker } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function LabsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labs, isLoading } = useQuery({
    queryKey: ['/api/protected/activities', { type: 'lab' }],
    queryFn: () => api.getActivities('lab'),
  });

  const participateMutation = useMutation({
    mutationFn: (labId: number) => api.participateInActivity(labId),
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Te has registrado para el lab. Recibirás más información pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/my-activities'] });
      setShowDetails(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar para el lab.",
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (lab: any) => {
    setSelectedLab(lab);
    setShowDetails(true);
  };

  const handleJoinLab = (labId: number) => {
    participateMutation.mutate(labId);
  };

  const filteredLabs = labs?.filter((lab: any) =>
    lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sample labs if none exist
  const sampleLabs = [
    {
      id: 1,
      title: 'Encuesta de Impacto Social',
      description: 'Recolecta datos sobre necesidades comunitarias para mejorar nuestros programas de voluntariado.',
      duration: 0.5,
      isVirtual: true,
      maxParticipants: 50,
      pointsReward: 10,
      type: 'lab',
      status: 'published'
    },
    {
      id: 2,
      title: 'Co-creación de Soluciones',
      description: 'Sesión colaborativa para idear soluciones innovadoras a retos sociales específicos.',
      duration: 1,
      isVirtual: false,
      location: 'Oficina Principal',
      maxParticipants: 15,
      pointsReward: 25,
      type: 'lab',
      status: 'published'
    },
    {
      id: 3,
      title: 'Piloto de Innovación Social',
      description: 'Prueba y valida nuevas iniciativas sociales antes de su implementación completa.',
      duration: 2,
      isVirtual: false,
      location: 'Lima Centro',
      maxParticipants: 20,
      pointsReward: 40,
      type: 'lab',
      status: 'published'
    }
  ];

  const displayLabs = filteredLabs.length > 0 ? filteredLabs : sampleLabs.filter(lab =>
    lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Labs de Voluntariado</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Labs de Voluntariado</h1>
            <p className="text-gray-600 mt-2">
              Actividades exploratorias breves para generar impacto rápido
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Beaker className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">¿Qué son los Labs de Voluntariado?</h3>
              <p className="text-purple-800 text-sm">
                Son actividades breves, virtuales o exploratorias diseñadas para experimentar nuevas formas de 
                generar impacto social. Perfectas para quienes buscan contribuir de manera flexible y creativa.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLabs.map((lab: any) => (
            <Card key={lab.id} className="activity-card group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Lab Exploratorio
                  </Badge>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">{lab.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {lab.description}
                </p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {lab.duration === 0.5 ? '30 min' : 
                       lab.duration === 1 ? '1 hora' : 
                       `${lab.duration} horas`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <span className="mr-2">📍</span>
                    <span>{lab.isVirtual ? 'Virtual' : lab.location}</span>
                  </div>
                  
                  {lab.maxParticipants && (
                    <div className="flex items-center text-gray-500">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{lab.maxParticipants} disponibles</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {lab.pointsReward} puntos
                    </Badge>
                    {lab.isVirtual && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Virtual
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(lab)}
                    >
                      Ver Más
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleJoinLab(lab.id)}
                      disabled={participateMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {participateMutation.isPending ? 'Uniéndose...' : 'Unirse'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayLabs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Beaker className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron labs
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda.'
                  : 'Pronto habrá nuevos labs disponibles.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lab Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Beaker className="mr-2 h-5 w-5 text-purple-600" />
                {selectedLab?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedLab && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descripción del Lab</h3>
                  <p className="text-gray-600">{selectedLab.description}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Detalles del Experimento</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-purple-800">Modalidad:</span>
                      <p className="text-purple-700">
                        {selectedLab.isVirtual ? 'Virtual - Plataforma online' : `Presencial - ${selectedLab.location}`}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-purple-800">Duración:</span>
                      <p className="text-purple-700">
                        {selectedLab.duration === 0.5 ? '30 minutos' : 
                         selectedLab.duration === 1 ? '1 hora' : 
                         `${selectedLab.duration} horas`}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-purple-800">Participantes:</span>
                      <p className="text-purple-700">{selectedLab.maxParticipants} disponibles</p>
                    </div>
                    <div>
                      <span className="font-medium text-purple-800">Recompensa:</span>
                      <p className="text-purple-700">{selectedLab.pointsReward} puntos</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">¿Qué puedes esperar?</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Contribuir con ideas innovadoras</li>
                    <li>• Colaborar con otros voluntarios</li>
                    <li>• Generar impacto inmediato</li>
                    <li>• Ganar experiencia en metodologías ágiles</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => handleJoinLab(selectedLab.id)}
                    disabled={participateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {participateMutation.isPending ? 'Uniéndose...' : 'Unirse al Lab'}
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
