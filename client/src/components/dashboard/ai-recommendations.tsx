import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Calendar, Users, Brain } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AIRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/protected/recommendations'],
  });

  const participateMutation = useMutation({
    mutationFn: (activityId: number) => api.participateInActivity(activityId),
    onSuccess: () => {
      toast({
        title: "¡Aplicación exitosa!",
        description: "Te has registrado para la actividad. Recibirás confirmación por email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/my-activities'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar para la actividad.",
        variant: "destructive",
      });
    }
  });

  const handleApplyToVolunteering = (activityId: number) => {
    participateMutation.mutate(activityId);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="manuchar-gradient p-6 rounded-xl text-white mb-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
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
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="manuchar-gradient p-6 rounded-xl text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <Brain className="mr-2 h-6 w-6" />
              Recomendaciones IA Personalizadas
            </h2>
            <p className="text-blue-100">
              Basadas en tu perfil, habilidades y disponibilidad
            </p>
          </div>
          <div className="text-blue-200">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.slice(0, 2).map((recommendation: any) => {
          const activity = recommendation.activity;
          const matchScore = recommendation.score;
          const reasons = recommendation.reasons || [];
          
          return (
            <Card key={activity.id} className="activity-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activity.type === 'ong_volunteering' ? 'bg-gradient-to-br from-green-400 to-green-500' :
                      activity.type === 'lab' ? 'bg-gradient-to-br from-purple-400 to-purple-500' :
                      'bg-gradient-to-br from-blue-400 to-blue-500'
                    }`}>
                      {activity.type === 'ong_volunteering' ? '🎓' :
                       activity.type === 'lab' ? '🧪' : '💻'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500">
                        {activity.organizationId ? 'ONG Aliada' : 'Actividad Interna'} • 
                        {activity.type === 'ong_volunteering' ? ' Voluntariado' :
                         activity.type === 'lab' ? ' Lab' : ' Actividad'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      matchScore >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                      matchScore >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
                    }`}
                  >
                    {matchScore}% Match
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {activity.description}
                </p>
                
                {reasons.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">
                      💡 ¿Por qué es ideal para ti?
                    </p>
                    <p className="text-xs text-blue-700">{reasons[0]}</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {activity.scheduledDate && (
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(activity.scheduledDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {activity.isVirtual ? 'Virtual' : activity.location || 'Por definir'}
                    </span>
                    {activity.duration && (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {activity.duration}h
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleApplyToVolunteering(activity.id)}
                    disabled={participateMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {participateMutation.isPending ? 'Postulando...' : 'Postular'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
