import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Award, Download, ExternalLink, Calendar, Clock } from 'lucide-react';

export default function ProgressSection() {
  const { data: profile } = useQuery({
    queryKey: ['/api/protected/profile'],
  });

  const { data: certificates } = useQuery({
    queryKey: ['/api/protected/certificates'],
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['/api/protected/my-activities'],
  });

  const stats = profile?.stats || {
    totalHours: 47,
    totalPoints: 847,
    badgeCount: 12,
    level: 'Líder Social',
    sdgCount: 8
  };

  // Calculate level progress (mock calculation)
  const currentLevelPoints = stats.totalPoints;
  const nextLevelPoints = 1000;
  const levelProgress = (currentLevelPoints / nextLevelPoints) * 100;

  // Sample SDGs data
  const sdgData = [
    { number: 4, name: 'Educación', active: true },
    { number: 8, name: 'Trabajo', active: true },
    { number: 11, name: 'Ciudades', active: false },
    { number: 17, name: 'Alianzas', active: true }
  ];

  // Sample recent achievements
  const recentAchievements = [
    { id: 1, name: 'Primer Corazón', description: 'Primera actividad', icon: '❤️', color: 'from-red-400 to-red-500' },
    { id: 2, name: 'Colaborador', description: '5 actividades', icon: '👥', color: 'from-blue-400 to-blue-500' },
    { id: 3, name: 'Eco-Guerrero', description: 'Actividad ambiental', icon: '🌱', color: 'from-green-400 to-green-500' }
  ];

  // Sample recent activity
  const mockRecentActivities = [
    {
      id: 1,
      title: 'Mentoría Profesional - Jóvenes Líderes',
      organization: 'Fundación Impulso',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 15,
      sdgs: [4, 8]
    },
    {
      id: 2,
      title: 'Módulo 1: Autoliderazgo y Propósito',
      organization: 'Formación Interna',
      completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 25,
      sdgs: []
    }
  ];

  const displayActivities = recentActivities?.slice(0, 3) || mockRecentActivities;
  const availableCertificates = certificates?.filter((cert: any) => cert.certificateUrl) || [
    {
      id: 1,
      type: 'poap',
      title: 'Certificado POAP - Q1 2024',
      issueDate: new Date().toISOString(),
      certificateUrl: 'https://poap.gallery/event/123456',
      metadata: { totalHours: 15 }
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Progress Section */}
      <Card className="activity-card">
        <CardHeader>
          <CardTitle>Mi Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Nivel: {stats.level}</span>
              <span className="text-sm text-gray-500">{currentLevelPoints}/{nextLevelPoints} XP</span>
            </div>
            <Progress value={levelProgress} className="h-2 mb-1" />
            <p className="text-xs text-gray-500">
              {nextLevelPoints - currentLevelPoints} XP para alcanzar "Líder Transformador"
            </p>
          </div>
          
          {/* ODS Progress */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Objetivos de Desarrollo Sostenible</h4>
            <div className="grid grid-cols-4 gap-2">
              {sdgData.map((sdg) => (
                <div key={sdg.number} className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                    sdg.active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className={`font-bold text-xs ${
                      sdg.active ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {sdg.number}
                    </span>
                  </div>
                  <p className={`text-xs ${
                    sdg.active ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {sdg.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(stats.totalHours)}</p>
              <p className="text-xs text-blue-800">Horas totales</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.badgeCount}</p>
              <p className="text-xs text-green-800">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="activity-card">
        <CardHeader>
          <CardTitle>Logros y Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Achievement Badges */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Logros Recientes</h4>
            <div className="grid grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-2 badge-animation`}>
                    <span className="text-white text-lg">{achievement.icon}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Certificate Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Certificados Disponibles</h4>
            <div className="space-y-2">
              {availableCertificates.slice(0, 2).map((certificate: any) => (
                <div key={certificate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      certificate.type === 'poap' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <Award className={`h-4 w-4 ${
                        certificate.type === 'poap' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{certificate.title}</p>
                      <p className="text-xs text-gray-500">
                        {certificate.metadata?.totalHours ? `${certificate.metadata.totalHours} horas completadas` : 'Certificado disponible'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(certificate.certificateUrl, '_blank')}
                  >
                    {certificate.type === 'poap' ? (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            <Link href="/certificates">
              <Button variant="outline" className="w-full mt-3" size="sm">
                Ver Todos los Certificados
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Completaste "{activity.title}"
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.organization} • +{activity.pointsEarned} XP
                    {activity.sdgs?.length > 0 && (
                      <span> • ODS {activity.sdgs.join(', ')}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(activity.completedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Ver detalles
                </Button>
              </div>
            ))}
          </div>
          
          <Link href="/activities/volunteering">
            <Button variant="outline" className="w-full mt-6">
              Ver toda la actividad
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
