import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/api';

interface ExcelUploadProps {
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export default function ExcelUpload({ onSuccess, onError }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      onError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      onError('El archivo es demasiado grande. Máximo 10MB permitido.');
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      onError('Por favor selecciona un archivo Excel');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResult = await api.uploadUsers(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setResult(uploadResult);
      
      if (uploadResult.success) {
        onSuccess(uploadResult);
      } else {
        onError(uploadResult.message || 'Error en la carga del archivo');
      }
    } catch (error: any) {
      onError(error.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } } as any;
      handleFileSelect(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Subir archivo Excel de usuarios
              </h3>
              <p className="text-gray-600 mb-4">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
              </p>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar Archivo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Formatos soportados: .xlsx, .xls (máximo 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando archivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Cargar Usuarios
                  </>
                )}
              </Button>
            </div>
          )}
          
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Result */}
      {result && (
        <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <div className="ml-3">
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                <div className="font-medium mb-1">{result.message}</div>
                
                {result.success && (
                  <div className="text-sm space-y-1">
                    <p>✅ Usuarios creados: {result.createdUsers}</p>
                    {result.failedUsers > 0 && (
                      <p>⚠️ Usuarios fallidos: {result.failedUsers}</p>
                    )}
                  </div>
                )}
                
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm mb-1">Errores encontrados:</p>
                    <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((error: string, index: number) => (
                        <li key={index} className="text-red-700">• {error}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-red-600 font-medium">
                          ... y {result.errors.length - 10} errores más
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Formato del archivo Excel</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Columnas requeridas:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <code>nombre completo</code> - Nombre y apellidos del empleado</li>
              <li>• <code>correo electrónico</code> - Email corporativo válido</li>
              <li>• <code>sede</code> - Oficina o sede del empleado</li>
              <li>• <code>cargo</code> - Puesto de trabajo</li>
              <li>• <code>área</code> - Departamento o área</li>
              <li>• <code>número de celular</code> - Teléfono de contacto</li>
            </ul>
            <p className="mt-2"><strong>Notas importantes:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Los nombres de las columnas deben coincidir exactamente</li>
              <li>• No incluir fila de encabezados adicionales</li>
              <li>• Los emails duplicados serán rechazados</li>
              <li>• Se generarán contraseñas automáticamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
