import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Handshake, 
  Home, 
  Heart, 
  GraduationCap, 
  Tag, 
  Users, 
  Settings,
  BarChart3,
  FileText,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location === path;
  const isAdminActive = (path: string) => location.startsWith(path);

  const employeeNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, active: isActive('/dashboard') },
    { name: 'Mis Actividades', href: '/activities/volunteering', icon: Heart, active: isAdminActive('/activities') },
    { name: 'Formación', href: '/training', icon: GraduationCap, active: isActive('/training') },
    { name: 'Certificados', href: '/certificates', icon: Tag, active: isActive('/certificates') },
  ];

  const adminNavigation = [
    { name: 'Gestión de Usuarios', href: '/admin/users', icon: Users, active: isActive('/admin/users') },
    { name: 'Gestión de Actividades', href: '/admin/activities', icon: Settings, active: isActive('/admin/activities') },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, active: isActive('/admin/analytics') },
    { name: 'Reportes', href: '/admin/reports', icon: FileText, active: isActive('/admin/reports') },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-30">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Handshake className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manuchar</h1>
            <p className="text-sm text-gray-500">Voluntariado</p>
          </div>
        </Link>
      </div>
      
      <nav className="px-6 pb-6">
        <div className="space-y-2">
          {/* Employee Navigation */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Panel Empleado
            </p>
            <div className="space-y-1">
              {employeeNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.active
                      ? 'sidebar-link-active'
                      : 'sidebar-link'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Admin Navigation - Only show if user is admin */}
          {user.role === 'admin' && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Panel Administrador
              </p>
              <div className="space-y-1">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.active
                        ? 'sidebar-link-active'
                        : 'sidebar-link'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.position || user.role}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
