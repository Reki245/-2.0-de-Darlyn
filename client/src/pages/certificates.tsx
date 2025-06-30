import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag, Download, Award, Calendar, ExternalLink, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CertificatesPage() {
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['/api/protected/certificates'],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/protected/profile'],
  });

  const generateCertificateMutation = useMutation({
    mutationFn: ({ quarter, year }: { quarter: string; year: number }) => 
      api.generateQuarterlyCertificate(quarter, year),
    onSuccess: () => {
      toast({
        title: "¡Certificado generado!",
        description: "Tu certificado trimestral ha sido creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protected/certificates'] });
      setShowGenerateDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el certificado.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateCertificate = () => {
    if (!selectedQuarter || !selectedYear) {
      toast({
        title: "Datos incompletos",
        description: "Selecciona el trimestre y año para generar el certificado.",
        variant: "destructive",
      });
      return;
    }

    generateCertificateMutation.mutate({
      quarter: selectedQuarter,
      year: parseInt(selectedYear)
    });
  };

  const handleDownloadCertificate = (certificate: any) => {
    if (certificate.certificateUrl) {
      window.open(certificate.certificateUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "URL del certificado no disponible.",
        variant: "destructive",
      });
    }
  };

  const getQuarterFromDate = (date: string) => {
    const month = new Date(date).getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  };

  const canGenerateQuarterlyCertificate = () => {
    const stats = profile?.stats;
    return stats && stats.totalHours >= 15; // Minimum 15 hours for quarterly certificate
  };

  // Sample certificates if none exist
  const sampleCertificates = [
    {
      id: 1,
      type: 'poap',
      title: 'Certificado POAP - Q1 2024',
      description: 'Certificado de participación en voluntariado corporativo del primer trimestre 2024',
      issueDate: '2024-03-31T23:59:59Z',
      certificateUrl: 'https://poap.gallery/event/123456',
      metadata: {
        quarter: 'Q1',
        year: 2024,
        totalHours: 24,
        totalPoints: 480
      }
    },
    {
      id: 2,
      type: 'pdf',
      title: 'Certificado de Participación - Mentoría Profesional',
      description: 'Certificado por completar actividad de mentoría con jóvenes profesionales',
      issueDate: '2024-02-15T10:30:00Z',
      certificateUrl: 'https://certificates.manuchar.com/pdf/mentoria-123.pdf',
      activityId: 1
    }
  ];

  const displayCertificates = certificates?.length > 0 ? certificates : sampleCertificates;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
            <p className="text-gray-600 mt-2">
              Descarga y comparte tus certificados de participación en voluntariado
            </p>
          </div>
          
          <Button
            onClick={() => setShowGenerateDialog(true)}
            disabled={!canGenerateQuarterlyCertificate()}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Award className="mr-2 h-4 w-4" />
            Generar Certificado Trimestral
          </Button>
        </div>

        {/* Tag Eligibility Info */}
        <div className={`rounded-lg p-6 ${
          canGenerateQuarterlyCertificate() 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              canGenerateQuarterlyCertificate() 
                ? 'bg-green-100' 
                : 'bg-orange-100'
            }`}>
              <Award className={`h-6 w-6 ${
                canGenerateQuarterlyCertificate() 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${
                canGenerateQuarterlyCertificate() 
                  ? 'text-green-900' 
                  : 'text-orange-900'
              }`}>
                {canGenerateQuarterlyCertificate() 
                  ? '¡Elegible para certificado trimestral!' 
                  : 'Progreso hacia certificado trimestral'
                }
              </h3>
              <p className={`text-sm ${
                canGenerateQuarterlyCertificate() 
                  ? 'text-green-800' 
                  : 'text-orange-800'
              }`}>
                {canGenerateQuarterlyCertificate() 
                  ? `Has completado ${Math.round(profile?.stats?.totalHours || 0)} horas de voluntariado. ¡Puedes generar tu certificado POAP!`
                  : `Necesitas al menos 15 horas de voluntariado para generar un certificado trimestral. Tienes ${Math.round(profile?.stats?.totalHours || 0)} horas.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCertificates.map((certificate: any) => (
            <Card key={certificate.id} className="activity-card group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge 
                    variant="secondary" 
                    className={certificate.type === 'poap' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                  >
                    {certificate.type === 'poap' ? 'POAP NFT' : 'PDF'}
                  </Badge>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                    certificate.type === 'poap' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {certificate.type === 'poap' ? (
                      <Tag className={`h-4 w-4 ${certificate.type === 'poap' ? 'text-purple-600' : 'text-blue-600'}`} />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {certificate.description}
                </p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Emitido el {format(new Date(certificate.issueDate), 'dd/MM/yyyy')}</span>
                  </div>
                  
                  {certificate.metadata && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Detalles del Certificado</p>
                      {certificate.metadata.totalHours && (
                        <p className="text-xs text-gray-600">
                          Horas: {certificate.metadata.totalHours}h
                        </p>
                      )}
                      {certificate.metadata.totalPoints && (
                        <p className="text-xs text-gray-600">
                          Puntos: {certificate.metadata.totalPoints}
                        </p>
                      )}
                      {certificate.metadata.quarter && certificate.metadata.year && (
                        <p className="text-xs text-gray-600">
                          Período: {certificate.metadata.quarter} {certificate.metadata.year}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Verificado
                    </Badge>
                    {certificate.validUntil && (
                      <Badge variant="outline" className="text-xs">
                        Válido hasta {format(new Date(certificate.validUntil), 'yyyy')}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleDownloadCertificate(certificate)}
                    className={certificate.type === 'poap' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {certificate.type === 'poap' ? (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver POAP
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayCertificates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Tag className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes certificados aún
              </h3>
              <p className="text-gray-600">
                Completa actividades de voluntariado para comenzar a ganar certificados
              </p>
            </CardContent>
          </Card>
        )}

        {/* Generate Tag Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-600" />
                Generar Certificado Trimestral
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Genera tu certificado POAP trimestral seleccionando el período correspondiente.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Trimestre
                  </label>
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar trimestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 - Enero a Marzo</SelectItem>
                      <SelectItem value="Q2">Q2 - Abril a Junio</SelectItem>
                      <SelectItem value="Q3">Q3 - Julio a Septiembre</SelectItem>
                      <SelectItem value="Q4">Q4 - Octubre a Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Año
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Información del Certificado POAP</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Certificado NFT verificable en blockchain</li>
                  <li>• Válido permanentemente</li>
                  <li>• Incluye tus estadísticas del período</li>
                  <li>• Compartible en redes sociales</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleGenerateCertificate}
                  disabled={!selectedQuarter || !selectedYear || generateCertificateMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {generateCertificateMutation.isPending ? 'Generando...' : 'Generar POAP'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
