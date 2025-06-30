import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clock, Globe, Medal, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgColor: string;
  iconColor: string;
}

function StatsCard({ icon, label, value, iconBgColor, iconColor }: StatsCardProps) {
  return (
    <Card className="stats-card">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/protected/profile'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = profile?.stats || {
    totalHours: 0,
    totalPoints: 0,
    badgeCount: 0,
    level: 'Voluntario Novato',
    sdgCount: 0
  };

  const statsData = [
    {
      icon: <Clock className="h-6 w-6" />,
      label: 'Horas Voluntariado',
      value: Math.round(stats.totalHours),
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      label: 'ODS Impactados',
      value: stats.sdgCount,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: <Medal className="h-6 w-6" />,
      label: 'Badges Obtenidos',
      value: stats.badgeCount,
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      label: 'Nivel Actual',
      value: stats.level,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
