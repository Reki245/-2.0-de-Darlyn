import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MapPin, Clock, Users, Star, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function VolunteeringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/protected/activities', { type: 'ong_volunteering' }],
    queryFn: () => api.getActivities('ong_volunteering'),
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/protected/recommendations'],
  });

  const participateMutation = useMutation({
    mutationFn: (activityId: number) => api.participateInActivity(activityId),
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Te has registrado para la actividad. Recibirás confirmación por email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/my-activities'] });
      setShowDetails(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar para la actividad.",
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity);
    setShowDetails(true);
  };

  const handleParticipate = (activityId: number) => {
    participateMutation.mutate(activityId);
  };

  const filteredActivities = activities?.filter((activity: any) =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getMatchScore = (activityId: number) => {
    const recommendation = recommendations?.find((rec: any) => rec.activityId === activityId);
    return recommendation?.score || null;
  };

  const getMatchReasons = (activityId: number) => {
    const recommendation = recommendations?.find((rec: any) => rec.activityId === activityId);
    return recommendation?.reasons || [];
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Voluntariados con ONGs</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Voluntariados con ONGs</h1>
            <p className="text-gray-600 mt-2">
              Descubre oportunidades de voluntariado con organizaciones aliadas
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar voluntariados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* AI Recommendations Section */}
        {!recommendationsLoading && recommendations && recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">🤖 Recomendaciones IA Personalizadas</h2>
                <p className="text-blue-100">
                  Basadas en tu perfil, habilidades y disponibilidad
                </p>
              </div>
              <div className="text-blue-200">
                <span className="text-3xl">🧠</span>
              </div>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity: any) => {
            const matchScore = getMatchScore(activity.id);
            const matchReasons = getMatchReasons(activity.id);
            
            return (
              <Card key={activity.id} className="activity-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Voluntariado ONG</Badge>
                    {matchScore && (
                      <Badge 
                        variant="outline" 
                        className={`${
                          matchScore >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                          matchScore >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {matchScore}% Match
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  {activity.organizationId && (
                    <p className="text-sm text-gray-500">ONG Aliada</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                  
                  {matchReasons.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">¿Por qué es ideal para ti?</p>
                      <p className="text-xs text-blue-700">{matchReasons[0]}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm mb-4">
                    {activity.location && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="mr-2 h-4 w-4" />
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

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(activity)}
                    >
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleParticipate(activity.id)}
                      disabled={participateMutation.isPending}
                    >
                      {participateMutation.isPending ? 'Registrando...' : 'Postular'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron voluntariados
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda.'
                  : 'Aún no hay voluntariados disponibles.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Activity Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedActivity?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedActivity && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-600">{selectedActivity.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Ubicación</h4>
                    <p className="text-sm">
                      {selectedActivity.isVirtual ? 'Virtual' : selectedActivity.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Duración</h4>
                    <p className="text-sm">{selectedActivity.duration} horas</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Participantes</h4>
                    <p className="text-sm">Máximo {selectedActivity.maxParticipants}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Puntos</h4>
                    <p className="text-sm">{selectedActivity.pointsReward} puntos</p>
                  </div>
                </div>

                {selectedActivity.sdgGoals && selectedActivity.sdgGoals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">ODS Impactados</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.sdgGoals.map((sdg: number) => (
                        <Badge key={sdg} variant="secondary">ODS {sdg}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => handleParticipate(selectedActivity.id)}
                    disabled={participateMutation.isPending}
                  >
                    {participateMutation.isPending ? 'Registrando...' : 'Postular Ahora'}
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
