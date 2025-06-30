import nodemailer from 'nodemailer';

interface EmailCredentials {
  email: string;
  password: string;
  fullName: string;
  office: string;
  position: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter (using environment variables)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendCredentials(credentials: EmailCredentials): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a Manuchar Voluntariado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #1E40AF; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; }
          .btn { background: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤝 Bienvenido a Manuchar Voluntariado</h1>
        </div>
        
        <div class="content">
          <h2>¡Hola ${credentials.fullName}!</h2>
          
          <p>Te damos la bienvenida a la plataforma de Voluntariado Corporativo de Manuchar Perú. Tu cuenta ha sido creada exitosamente.</p>
          
          <div class="credentials">
            <h3>🔐 Tus credenciales de acceso:</h3>
            <p><strong>Email:</strong> ${credentials.email}</p>
            <p><strong>Contraseña temporal:</strong> ${credentials.password}</p>
            <p><strong>Sede:</strong> ${credentials.office}</p>
            <p><strong>Cargo:</strong> ${credentials.position}</p>
          </div>
          
          <p><strong>⚠️ Importante:</strong> Por seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.</p>
          
          <p>Una vez que ingreses, completarás un proceso de onboarding que incluye:</p>
          <ul>
            <li>🎯 Configuración de tu perfil personal</li>
            <li>💪 Test de Fortalezas de Gallup</li>
            <li>🧠 Test de Personalidad de Eysenck</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/login" class="btn">Iniciar Sesión</a>
          
          <p>Si tienes alguna pregunta, no dudes en contactar al equipo de Responsabilidad Social Empresarial.</p>
          
          <p>¡Esperamos verte participando activamente en nuestras iniciativas de voluntariado!</p>
        </div>
        
        <div class="footer">
          <p>Manuchar Perú - Plataforma de Voluntariado Corporativo</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: credentials.email,
      subject: '🤝 Bienvenido a Manuchar Voluntariado - Credenciales de Acceso',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Credentials sent successfully to ${credentials.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${credentials.email}:`, error);
      throw new Error(`Failed to send credentials email: ${error}`);
    }
  }

  async sendActivityNotification(email: string, activityTitle: string, type: 'confirmation' | 'reminder' | 'completion'): Promise<void> {
    let subject = '';
    let content = '';

    switch (type) {
      case 'confirmation':
        subject = `✅ Confirmación de registro - ${activityTitle}`;
        content = `Te has registrado exitosamente para la actividad "${activityTitle}". Recibirás más detalles próximamente.`;
        break;
      case 'reminder':
        subject = `⏰ Recordatorio - ${activityTitle}`;
        content = `Te recordamos que tienes una actividad programada: "${activityTitle}". No olvides asistir.`;
        break;
      case 'completion':
        subject = `🎉 Actividad completada - ${activityTitle}`;
        content = `¡Felicitaciones! Has completado la actividad "${activityTitle}". Tus puntos y certificados han sido actualizados.`;
        break;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1E40AF; color: white; padding: 20px; text-align: center;">
            <h1>Manuchar Voluntariado</h1>
          </div>
          <div style="padding: 20px;">
            <p>${content}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" 
               style="background: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Dashboard
            </a>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
