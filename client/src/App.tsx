import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";

// Pages
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import OnboardingPage from "./pages/onboarding";
import VolunteeringPage from "./pages/activities/volunteering";
import LabsPage from "./pages/activities/labs";
import MissionsPage from "./pages/activities/missions";
import TrainingPage from "./pages/training/modules";
import CertificatesPage from "./pages/certificates";
import UserManagementPage from "./pages/admin/user-management";
import ActivityManagementPage from "./pages/admin/activity-management";
import AnalyticsPage from "./pages/admin/analytics";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  
  if (!user.isOnboarded && window.location.pathname !== "/onboarding") {
    window.location.href = "/onboarding";
    return null;
  }
  
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    window.location.href = "/dashboard";
    return null;
  }
  
  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding">
        <ProtectedRoute component={OnboardingPage} />
      </Route>
      <Route path="/" nest>
        <Switch>
          <Route path="/">
            <ProtectedRoute component={DashboardPage} />
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute component={DashboardPage} />
          </Route>
          <Route path="/activities/volunteering">
            <ProtectedRoute component={VolunteeringPage} />
          </Route>
          <Route path="/activities/labs">
            <ProtectedRoute component={LabsPage} />
          </Route>
          <Route path="/activities/missions">
            <ProtectedRoute component={MissionsPage} />
          </Route>
          <Route path="/training">
            <ProtectedRoute component={TrainingPage} />
          </Route>
          <Route path="/certificates">
            <ProtectedRoute component={CertificatesPage} />
          </Route>
          <Route path="/admin/users">
            <AdminRoute component={UserManagementPage} />
          </Route>
          <Route path="/admin/activities">
            <AdminRoute component={ActivityManagementPage} />
          </Route>
          <Route path="/admin/analytics">
            <AdminRoute component={AnalyticsPage} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
