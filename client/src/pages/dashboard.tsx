import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import StatsCards from '@/components/dashboard/stats-cards';
import AIRecommendations from '@/components/dashboard/ai-recommendations';
import ActivitiesCatalog from '@/components/dashboard/activities-catalog';
import ProgressSection from '@/components/dashboard/progress-section';
import FAQChatbot from '@/components/chatbot/faq-chatbot';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <Header />
        <StatsCards />
        <AIRecommendations />
        <ActivitiesCatalog />
        <ProgressSection />
        
        {/* Admin Panel - Only show if user is admin */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Panel de Administración</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Solo Administradores
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="text-center">
                  <div className="text-3xl text-green-500 mb-3">📊</div>
                  <h4 className="font-medium text-gray-900 mb-1">Cargar Usuarios</h4>
                  <p className="text-xs text-gray-500">Archivo Excel (.xlsx)</p>
                  <button className="mt-3 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors">
                    Subir Archivo
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl text-primary mb-3">📋</div>
                  <h4 className="font-medium text-gray-900 mb-1">Gestionar Actividades</h4>
                  <p className="text-xs text-gray-500">ONGs, Labs, Misiones</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl text-orange-500 mb-3">📈</div>
                  <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                  <p className="text-xs text-gray-500">Métricas en tiempo real</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl text-purple-500 mb-3">📄</div>
                  <h4 className="font-medium text-gray-900 mb-1">Reportes</h4>
                  <p className="text-xs text-gray-500">Exportar datos</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <FAQChatbot />
    </AppLayout>
  );
}
