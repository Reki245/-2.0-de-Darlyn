import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingData {
  interests: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    timeSlots: string[];
  };
  gallupStrengths: Record<string, number>;
  personalityType: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    interests: [],
    availability: {
      weekdays: false,
      weekends: false,
      timeSlots: []
    },
    gallupStrengths: {},
    personalityType: ''
  });

  const interestOptions = [
    'Educación', 'Salud', 'Medio Ambiente', 'Tecnología', 'Arte y Cultura',
    'Deportes', 'Desarrollo Comunitario', 'Inclusión Social', 'Emprendimiento',
    'Derechos Humanos'
  ];

  const timeSlotOptions = [
    '06:00 - 09:00', '09:00 - 12:00', '12:00 - 15:00',
    '15:00 - 18:00', '18:00 - 21:00', '21:00 - 24:00'
  ];

  const gallupStrengths = [
    'Analítico', 'Armonía', 'Carisma', 'Comunicación', 'Competitivo',
    'Conexión', 'Consistencia', 'Contexto', 'Creencia', 'Desarrollador',
    'Disciplina', 'Empatía', 'Enfoque', 'Estratégico', 'Estudioso',
    'Flexibilidad', 'Futurista', 'Ideación', 'Inclusión', 'Individualización',
    'Insumo', 'Intelectual', 'Logrador', 'Mando', 'Maximizador',
    'Positivo', 'Relacional', 'Responsabilidad', 'Restaurador', 'Significación'
  ];

  const personalityTypes = [
    { value: 'extrovertido_estable', label: 'Extrovertido Estable' },
    { value: 'extrovertido_inestable', label: 'Extrovertido Inestable' },
    { value: 'introvertido_estable', label: 'Introvertido Estable' },
    { value: 'introvertido_inestable', label: 'Introvertido Inestable' }
  ];

  const handleInterestToggle = (interest: string) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvailabilityChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setOnboardingData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.includes(timeSlot)
          ? prev.availability.timeSlots.filter(t => t !== timeSlot)
          : [...prev.availability.timeSlots, timeSlot]
      }
    }));
  };

  const handleGallupStrengthChange = (strength: string, score: number) => {
    setOnboardingData(prev => ({
      ...prev,
      gallupStrengths: {
        ...prev.gallupStrengths,
        [strength]: score
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await api.completeOnboarding(onboardingData);
      updateUser({ isOnboarded: true });
      
      toast({
        title: "¡Onboarding completado!",
        description: "Tu perfil ha sido configurado exitosamente.",
      });
      
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el onboarding. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return onboardingData.interests.length > 0;
      case 2:
        return onboardingData.availability.weekdays || onboardingData.availability.weekends;
      case 3:
        return Object.keys(onboardingData.gallupStrengths).length >= 5;
      case 4:
        return onboardingData.personalityType !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Selecciona tus áreas de interés</h3>
              <p className="text-gray-600 mb-4">
                Elige las áreas en las que te gustaría participar como voluntario
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {interestOptions.map((interest) => (
                <div
                  key={interest}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    onboardingData.interests.includes(interest)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={onboardingData.interests.includes(interest)}
                      onChange={() => {}}
                    />
                    <span className="text-sm font-medium">{interest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Disponibilidad de tiempo</h3>
              <p className="text-gray-600 mb-4">
                Cuéntanos cuándo tienes disponibilidad para actividades de voluntariado
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={onboardingData.availability.weekdays}
                  onCheckedChange={(checked) => handleAvailabilityChange('weekdays', checked)}
                />
                <Label>Días de semana (Lunes - Viernes)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={onboardingData.availability.weekends}
                  onCheckedChange={(checked) => handleAvailabilityChange('weekends', checked)}
                />
                <Label>Fines de semana (Sábado - Domingo)</Label>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Horarios preferidos (selecciona todos los que apliquen)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlotOptions.map((timeSlot) => (
                  <div
                    key={timeSlot}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                      onboardingData.availability.timeSlots.includes(timeSlot)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTimeSlotToggle(timeSlot)}
                  >
                    <span className="text-sm">{timeSlot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Test de Fortalezas de Gallup</h3>
              <p className="text-gray-600 mb-4">
                Selecciona tus 5 fortalezas principales y califica su intensidad del 1 al 10
              </p>
            </div>
            
            <div className="space-y-4">
              {gallupStrengths.map((strength) => (
                <div key={strength} className="flex items-center justify-between p-3 border rounded-lg">
                  <Label className="font-medium">{strength}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      className="w-16"
                      placeholder="0"
                      value={onboardingData.gallupStrengths[strength] || ''}
                      onChange={(e) => handleGallupStrengthChange(strength, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Test de Personalidad de Eysenck</h3>
              <p className="text-gray-600 mb-4">
                Selecciona el tipo de personalidad que mejor te describe
              </p>
            </div>
            
            <RadioGroup
              value={onboardingData.personalityType}
              onValueChange={(value) => setOnboardingData(prev => ({ ...prev, personalityType: value }))}
            >
              {personalityTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="font-medium cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido/a {user.fullName}!
          </h1>
          <p className="text-gray-600">
            Completa tu perfil para comenzar tu experiencia de voluntariado
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-4 mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                stepNumber < step
                  ? 'bg-green-500 text-white'
                  : stepNumber === step
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber < step ? <Check className="h-5 w-5" /> : stepNumber}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paso {step} de 4</CardTitle>
            <CardDescription>
              {step === 1 && 'Configuración de intereses'}
              {step === 2 && 'Disponibilidad de tiempo'}
              {step === 3 && 'Test de Fortalezas de Gallup'}
              {step === 4 && 'Test de Personalidad de Eysenck'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepComplete()}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepComplete() || isLoading}
                >
                  {isLoading ? 'Completando...' : 'Finalizar Onboarding'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
