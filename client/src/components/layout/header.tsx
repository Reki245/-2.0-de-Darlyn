import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Bell, Plus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { user } = useAuth();
  const [hasNotifications] = useState(true);

  if (!user) return null;

  const quickActions = [
    { label: 'Buscar Voluntariado ONG', action: () => console.log('Search ONG volunteering') },
    { label: 'Unirse a Lab', action: () => console.log('Join lab') },
    { label: 'Proponer Micro-Misión', action: () => console.log('Propose micro-mission') },
    { label: 'Nominar Compañero', action: () => console.log('Nominate colleague') },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()} {firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Descubre nuevas oportunidades de voluntariado y continúa desarrollando tu liderazgo social.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Button */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-orange-500">
                <span className="sr-only">New notifications</span>
              </Badge>
            )}
          </Button>
          
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Acción Rápida
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {quickActions.map((action, index) => (
                <div key={index}>
                  <DropdownMenuItem onClick={action.action}>
                    {action.label}
                  </DropdownMenuItem>
                  {index < quickActions.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
