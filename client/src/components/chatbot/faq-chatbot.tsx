import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User, Search, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export default function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy tu asistente virtual de Manuchar Voluntariado. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre actividades, certificados, puntos o cualquier duda sobre la plataforma.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showFAQs, setShowFAQs] = useState(false);

  // FAQ Database
  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo puedo registrarme para una actividad de voluntariado?',
      answer: 'Para registrarte en una actividad: 1) Ve a la sección correspondiente (Voluntariados ONG, Labs, o Micro-Misiones), 2) Busca la actividad que te interese, 3) Haz clic en "Postular" o "Unirse", 4) Recibirás una confirmación por email con los detalles.',
      category: 'Actividades',
      keywords: ['registrar', 'postular', 'unirse', 'actividad', 'voluntariado']
    },
    {
      id: '2',
      question: '¿Qué son los puntos y cómo los gano?',
      answer: 'Los puntos son la moneda de gamificación de nuestra plataforma. Los ganas completando actividades de voluntariado, módulos de formación, y alcanzando logros. Cada actividad tiene una recompensa específica de puntos que puedes ver en su descripción.',
      category: 'Gamificación',
      keywords: ['puntos', 'ganar', 'recompensa', 'gamificación', 'XP']
    },
    {
      id: '3',
      question: '¿Cómo descargo mis certificados?',
      answer: 'Puedes descargar tus certificados desde la sección "Certificados" en el menú principal. Ahí encontrarás todos tus certificados disponibles, tanto POAP como PDF. Haz clic en "Descargar" o "Ver POAP" según el tipo de certificado.',
      category: 'Certificados',
      keywords: ['certificado', 'descargar', 'POAP', 'PDF']
    },
    {
      id: '4',
      question: '¿Qué es un certificado POAP?',
      answer: 'POAP (Proof of Attendance Protocol) es un certificado digital tipo NFT que demuestra tu participación en actividades de voluntariado. Es permanente, verificable en blockchain y lo puedes compartir en redes sociales. Se genera automáticamente cuando cumples los requisitos trimestrales.',
      category: 'Certificados',
      keywords: ['POAP', 'NFT', 'blockchain', 'certificado', 'digital']
    },
    {
      id: '5',
      question: '¿Cómo funciona la IA de recomendaciones?',
      answer: 'Nuestra IA analiza tu perfil de Gallup, test de personalidad Eysenck, intereses declarados, disponibilidad y historial de actividades para sugerirte voluntariados que mejor se adapten a ti. Mientras más completes tu perfil, mejores serán las recomendaciones.',
      category: 'IA y Recomendaciones',
      keywords: ['IA', 'recomendaciones', 'personalizada', 'Gallup', 'Eysenck']
    },
    {
      id: '6',
      question: '¿Qué son las Micro-Misiones?',
      answer: 'Las Micro-Misiones son actividades de voluntariado breves (1-3 horas) que puedes realizar solo o en pareja. Incluyen el sistema de nominación donde puedes invitar a un compañero, y si completan la actividad juntos, ambos reciben puntos extra y reconocimiento especial.',
      category: 'Actividades',
      keywords: ['micro-misión', 'pareja', 'nominación', 'breve', 'compañero']
    },
    {
      id: '7',
      question: '¿Cómo accedo a los módulos de formación?',
      answer: 'Los módulos de formación están en la sección "Formación". Siguen un orden secuencial: primero "Autoliderazgo y Propósito", luego "Liderazgo Colaborativo" y finalmente "Innovación y Liderazgo para el Cambio". Cada módulo se desbloquea al completar el anterior.',
      category: 'Formación',
      keywords: ['formación', 'módulos', 'liderazgo', 'secuencial', 'desbloquear']
    },
    {
      id: '8',
      question: '¿Puedo cambiar mi perfil después del onboarding?',
      answer: 'Sí, puedes actualizar tu perfil en cualquier momento desde la configuración. Esto incluye tus intereses, disponibilidad, y información de contacto. Sin embargo, los tests de Gallup y Eysenck solo se pueden hacer una vez durante el onboarding.',
      category: 'Perfil',
      keywords: ['perfil', 'cambiar', 'actualizar', 'onboarding', 'configuración']
    }
  ];

  const findBestAnswer = (query: string): FAQItem | null => {
    const normalizedQuery = query.toLowerCase();
    
    // First, try to find exact keyword matches
    for (const faq of faqs) {
      if (faq.keywords.some(keyword => normalizedQuery.includes(keyword))) {
        return faq;
      }
    }

    // If no keyword match, try partial matches in questions
    for (const faq of faqs) {
      if (faq.question.toLowerCase().includes(normalizedQuery) || 
          normalizedQuery.includes(faq.question.toLowerCase().substring(0, 10))) {
        return faq;
      }
    }

    return null;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot thinking delay
    setTimeout(() => {
      const bestAnswer = findBestAnswer(inputValue);
      
      let botResponse: string;
      if (bestAnswer) {
        botResponse = bestAnswer.answer;
      } else {
        botResponse = `No encontré una respuesta específica para "${inputValue}". Te recomiendo revisar nuestras preguntas frecuentes o contactar al equipo de RSE para obtener ayuda personalizada. ¿Hay algo más específico en lo que pueda ayudarte?`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputValue('');
  };

  const handleFAQClick = (faq: FAQItem) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: faq.answer,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setShowFAQs(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md h-[600px] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 border-b bg-primary text-white rounded-t-lg">
            <DialogTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Asistente Virtual Manuchar
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-900 shadow-sm border'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            {showFAQs && (
              <div className="border-t bg-white p-4 max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Preguntas Frecuentes</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowFAQs(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {categories.map(category => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-gray-500 mb-2">{category}</h5>
                      <div className="space-y-1">
                        {faqs.filter(faq => faq.category === category).map(faq => (
                          <button
                            key={faq.id}
                            onClick={() => handleFAQClick(faq)}
                            className="text-left w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            {faq.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFAQs(!showFAQs)}
                  className="text-xs"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  FAQs
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
