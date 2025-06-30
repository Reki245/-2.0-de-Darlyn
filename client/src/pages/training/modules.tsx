import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Lock, CheckCircle, Clock, Award, PlayCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TrainingModulesPage() {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['/api/protected/training/modules'],
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/protected/training/progress'],
  });

  const startModuleMutation = useMutation({
    mutationFn: (moduleId: number) => api.updateTrainingProgress(moduleId, { status: 'in_progress', startedAt: new Date() }),
    onSuccess: () => {
      toast({
        title: "¡Módulo iniciado!",
        description: "Has comenzado el módulo de formación.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/training/progress'] });
      setShowModuleDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo iniciar el módulo.",
        variant: "destructive",
      });
    }
  });

  const handleViewModule = (module: any) => {
    setSelectedModule(module);
    setShowModuleDialog(true);
  };

  const handleStartModule = (moduleId: number) => {
    startModuleMutation.mutate(moduleId);
  };

  const getModuleProgress = (moduleId: number) => {
    return progress?.find((p: any) => p.moduleId === moduleId);
  };

  const isModuleUnlocked = (module: any) => {
    if (!module.prerequisiteModuleId) return true;
    
    const prerequisiteProgress = getModuleProgress(module.prerequisiteModuleId);
    return prerequisiteProgress?.status === 'completed';
  };

  const getModuleStatus = (module: any) => {
    const moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress) return 'not_started';
    return moduleProgress.status;
  };

  const getProgressPercentage = (module: any) => {
    const moduleProgress = getModuleProgress(module.id);
    return moduleProgress?.progressPercentage || 0;
  };

  // Sample modules if none exist from API
  const sampleModules = [
    {
      id: 1,
      title: 'Autoliderazgo y Propósito',
      description: 'Desarrolla tu capacidad de liderarte a ti mismo y define tu propósito como líder social.',
      moduleNumber: 1,
      prerequisiteModuleId: null,
      duration: 4,
      pointsReward: 100,
      isActive: true,
      content: {
        topics: ['Autoconocimiento', 'Definición de propósito', 'Gestión emocional', 'Planificación personal']
      }
    },
    {
      id: 2,
      title: 'Liderazgo Colaborativo en Entornos Sociales',
      description: 'Aprende a liderar equipos diversos y crear sinergias en proyectos de impacto social.',
      moduleNumber: 2,
      prerequisiteModuleId: 1,
      duration: 4,
      pointsReward: 100,
      isActive: true,
      content: {
        topics: ['Comunicación efectiva', 'Trabajo en equipo', 'Resolución de conflictos', 'Gestión de diversidad']
      }
    },
    {
      id: 3,
      title: 'Innovación y Liderazgo para el Cambio',
      description: 'Desarrolla habilidades para liderar procesos de cambio e innovación social sostenible.',
      moduleNumber: 3,
      prerequisiteModuleId: 2,
      duration: 4,
      pointsReward: 100,
      isActive: true,
      content: {
        topics: ['Pensamiento innovador', 'Gestión del cambio', 'Sostenibilidad', 'Impacto social']
      }
    }
  ];

  const displayModules = modules?.length > 0 ? modules : sampleModules;

  if (modulesLoading || progressLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Formación Interna</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Formación Interna</h1>
            <p className="text-gray-600 mt-2">
              Desarrolla tu liderazgo social a través de nuestros módulos especializados
            </p>
          </div>
        </div>

        {/* Learning Path Overview */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🎓 Ruta de Aprendizaje de Liderazgo Social</h2>
              <p className="text-green-100">
                Completa los módulos en orden para desbloquear nuevos niveles de liderazgo
              </p>
            </div>
            <div className="text-green-200">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Training Modules */}
        <div className="space-y-6">
          {displayModules.map((module: any, index: number) => {
            const isUnlocked = isModuleUnlocked(module);
            const status = getModuleStatus(module);
            const progressPercentage = getProgressPercentage(module);

            return (
              <Card key={module.id} className={`${!isUnlocked ? 'opacity-60' : ''} transition-all hover:shadow-md`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Module Number */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      isUnlocked ? 'bg-gray-400' : 'bg-gray-300'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : !isUnlocked ? (
                        <Lock className="h-6 w-6" />
                      ) : (
                        module.moduleNumber
                      )}
                    </div>

                    {/* Module Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-500">Módulo {module.moduleNumber}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={status === 'completed' ? 'default' : status === 'in_progress' ? 'secondary' : 'outline'}>
                            {status === 'completed' ? 'Completado' :
                             status === 'in_progress' ? 'En Progreso' :
                             isUnlocked ? 'Disponible' : 'Bloqueado'}
                          </Badge>
                          {status === 'completed' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Award className="h-3 w-3 mr-1" />
                              {module.pointsReward} pts
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{module.description}</p>

                      {/* Progress Bar */}
                      {status !== 'not_started' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}

                      {/* Module Details */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{module.duration} horas</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          <span>{module.pointsReward} puntos</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewModule(module)}
                          disabled={!isUnlocked}
                        >
                          Ver Detalles
                        </Button>
                        
                        {isUnlocked && (
                          <>
                            {status === 'not_started' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartModule(module.id)}
                                disabled={startModuleMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                {startModuleMutation.isPending ? 'Iniciando...' : 'Iniciar Módulo'}
                              </Button>
                            )}
                            
                            {status === 'in_progress' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Continuar
                              </Button>
                            )}
                            
                            {status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Revisar
                              </Button>
                            )}
                          </>
                        )}

                        {!isUnlocked && (
                          <Button size="sm" disabled variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Requiere Módulo {module.prerequisiteModuleId}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Module Details Modal */}
        <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-green-600" />
                {selectedModule?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedModule && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descripción del Módulo</h3>
                  <p className="text-gray-600">{selectedModule.description}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Detalles del Curso</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Duración:</span>
                      <p className="text-green-700">{selectedModule.duration} horas académicas</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Modalidad:</span>
                      <p className="text-green-700">Virtual - Autodirigido</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Puntos:</span>
                      <p className="text-green-700">{selectedModule.pointsReward} puntos</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Certificado:</span>
                      <p className="text-green-700">Sí - Al completar</p>
                    </div>
                  </div>
                </div>

                {selectedModule.content?.topics && (
                  <div>
                    <h4 className="font-medium mb-2">Temas del Módulo</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {selectedModule.content.topics.map((topic: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Lo que aprenderás</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Técnicas avanzadas de liderazgo social</li>
                    <li>• Herramientas para el desarrollo personal y profesional</li>
                    <li>• Metodologías de trabajo colaborativo</li>
                    <li>• Estrategias para generar impacto sostenible</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
                    Cerrar
                  </Button>
                  {isModuleUnlocked(selectedModule) && getModuleStatus(selectedModule) === 'not_started' && (
                    <Button 
                      onClick={() => handleStartModule(selectedModule.id)}
                      disabled={startModuleMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {startModuleMutation.isPending ? 'Iniciando...' : 'Iniciar Módulo'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
