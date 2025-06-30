import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Puzzle, GraduationCap, Users, Clock, ChevronRight } from 'lucide-react';

export default function ActivitiesCatalog() {
  const { data: labActivities } = useQuery({
    queryKey: ['/api/protected/activities', { type: 'lab' }],
    queryFn: () => fetch('/api/protected/activities?type=lab').then(res => res.json()),
  });

  const { data: missions } = useQuery({
    queryKey: ['/api/protected/activities', { type: 'micro_mission' }],
    queryFn: () => fetch('/api/protected/activities?type=micro_mission').then(res => res.json()),
  });

  const { data: trainingModules } = useQuery({
    queryKey: ['/api/protected/training/modules'],
  });

  // Sample data if none exists
  const sampleLabs = [
    {
      id: 1,
      title: 'Encuesta de Impacto Social',
      description: 'Recolecta datos sobre necesidades comunitarias',
      duration: 0.5,
      isVirtual: true,
      maxParticipants: 5
    },
    {
      id: 2,
      title: 'Co-creación de Soluciones',
      description: 'Ideación colaborativa para retos sociales',
      duration: 1,
      isVirtual: false,
      maxParticipants: 3
    }
  ];

  const sampleMissions = [
    {
      id: 1,
      title: 'Pintar Aulas Escolares',
      description: 'Renovación de espacios educativos',
      duration: 3,
      maxParticipants: 4
    },
    {
      id: 2,
      title: 'Entrega de Kits Alimentarios',
      description: 'Distribución en comunidades vulnerables',
      duration: 2,
      maxParticipants: 2
    }
  ];

  const sampleTraining = [
    {
      id: 1,
      title: 'Autoliderazgo y Propósito',
      description: 'Módulo 1: Fundamentos personales',
      duration: 4,
      isActive: true
    }
  ];

  const displayLabs = labActivities?.length > 0 ? labActivities : sampleLabs;
  const displayMissions = missions?.length > 0 ? missions : sampleMissions;
  const displayTraining = trainingModules?.length > 0 ? trainingModules : sampleTraining;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Labs de Voluntariado */}
      <Card className="activity-card">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Labs de Voluntariado</CardTitle>
              <p className="text-sm text-gray-500">Actividades exploratorias breves</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {displayLabs.slice(0, 2).map((lab: any) => (
              <div key={lab.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 text-sm">{lab.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{lab.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-purple-600 font-medium">
                    {lab.isVirtual ? 'Virtual' : 'Presencial'} • {lab.duration === 0.5 ? '30min' : `${lab.duration}h`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {lab.maxParticipants} disponibles
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/activities/labs">
            <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600">
              Ver Todos los Labs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Micro-Misiones */}
      <Card className="activity-card">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Puzzle className="text-white h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Micro-Misiones</CardTitle>
              <p className="text-sm text-gray-500">Acciones rápidas en pareja</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {displayMissions.slice(0, 2).map((mission: any) => (
              <div key={mission.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 text-sm">{mission.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-orange-600 font-medium">
                    Presencial • {mission.duration}h
                  </span>
                  <div className="flex items-center space-x-1">
                    <Users className="text-orange-500 h-3 w-3" />
                    <span className="text-xs text-gray-600">{mission.maxParticipants} personas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/activities/missions">
            <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
              Ver Todas las Misiones
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Formación Interna */}
      <Card className="activity-card">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Formación Interna</CardTitle>
              <p className="text-sm text-gray-500">Desarrollo de liderazgo</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {displayTraining.slice(0, 2).map((module: any, index: number) => (
              <div key={module.id} className={`p-3 border border-gray-200 rounded-lg transition-colors ${
                index === 0 ? 'hover:bg-gray-50' : 'opacity-50'
              }`}>
                <h4 className="font-medium text-gray-900 text-sm">{module.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {index === 0 ? 'Módulo 1: Fundamentos personales' : 'Módulo 2: Requiere completar módulo 1'}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-green-600 font-medium">
                    Virtual • {module.duration}h
                  </span>
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                    {index === 0 ? 'Disponible' : 'Bloqueado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/training">
            <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">
              Ver Formación Completa
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
