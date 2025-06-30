import { storage } from '../storage';
import type { User, Activity, Certificate } from '@shared/schema';

export interface CertificateData {
  userId: number;
  type: 'poap' | 'pdf';
  title: string;
  description: string;
  activityId?: number;
  metadata?: any;
}

export class CertificateService {
  async generateQuarterlyCertificate(userId: number, quarter: string, year: number): Promise<Certificate> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userStats = await storage.getUserStats(userId);
      
      // Generate POAP certificate for quarterly achievement
      const certificateData: CertificateData = {
        userId,
        type: 'poap',
        title: `Certificado POAP - ${quarter} ${year}`,
        description: `Certificado de participación en voluntariado corporativo. Horas completadas: ${userStats.totalHours}, Puntos obtenidos: ${userStats.totalPoints}`,
        metadata: {
          quarter,
          year,
          totalHours: userStats.totalHours,
          totalPoints: userStats.totalPoints,
          badgeCount: userStats.badgeCount,
          level: userStats.level,
          sdgCount: userStats.sdgCount
        }
      };

      // In a real implementation, this would call POAP API or generate PDF
      const certificateUrl = await this.generateCertificateFile(certificateData);
      
      const certificate = await storage.createCertificate({
        ...certificateData,
        certificateUrl,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Valid for 1 year
      });

      return certificate;

    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  async generateActivityCertificate(userId: number, activityId: number): Promise<Certificate> {
    try {
      const user = await storage.getUser(userId);
      const activity = await storage.getActivity(activityId);
      
      if (!user || !activity) {
        throw new Error('User or activity not found');
      }

      const certificateData: CertificateData = {
        userId,
        activityId,
        type: 'pdf',
        title: `Certificado de Participación - ${activity.title}`,
        description: `Certificado de participación en la actividad "${activity.title}" organizada por Manuchar Perú`,
        metadata: {
          activityTitle: activity.title,
          activityType: activity.type,
          duration: activity.duration,
          sdgGoals: activity.sdgGoals,
          completionDate: new Date().toISOString()
        }
      };

      const certificateUrl = await this.generateCertificateFile(certificateData);
      
      const certificate = await storage.createCertificate({
        ...certificateData,
        certificateUrl
      });

      return certificate;

    } catch (error) {
      console.error('Error generating activity certificate:', error);
      throw error;
    }
  }

  private async generateCertificateFile(data: CertificateData): Promise<string> {
    // In a real implementation, this would:
    // 1. For POAP: Call POAP API to mint NFT certificate
    // 2. For PDF: Generate PDF using libraries like jsPDF or Puppeteer
    
    if (data.type === 'poap') {
      // Mock POAP URL - in production, integrate with POAP API
      return `https://poap.gallery/event/${Date.now()}`;
    } else {
      // Mock PDF URL - in production, generate actual PDF and store in cloud storage
      return `https://certificates.manuchar.com/pdf/${data.userId}-${Date.now()}.pdf`;
    }
  }

  async checkCertificateEligibility(userId: number): Promise<{
    quarterlyEligible: boolean;
    quarterlyHours: number;
    requiredHours: number;
  }> {
    try {
      const userStats = await storage.getUserStats(userId);
      const requiredHoursForQuarterly = 15; // Minimum hours for quarterly certificate
      
      return {
        quarterlyEligible: userStats.totalHours >= requiredHoursForQuarterly,
        quarterlyHours: userStats.totalHours,
        requiredHours: requiredHoursForQuarterly
      };

    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return {
        quarterlyEligible: false,
        quarterlyHours: 0,
        requiredHours: 15
      };
    }
  }
}

export const certificateService = new CertificateService();
