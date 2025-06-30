import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { excelProcessor } from "./services/excel-processor";
import { aiMatchingService } from "./services/ai-matching";
import { certificateService } from "./services/certificates";
import { emailService } from "./services/email";
import {
  insertActivitySchema,
  insertParticipationSchema,
  insertOrganizationSchema
} from "@shared/schema";

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Auth middleware
async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const user = await authService.getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get full user data from database
    const dbUser = await storage.getUserBySupabaseId(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    req.user = { ...user, dbUser };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

// Admin middleware
function adminMiddleware(req: any, res: any, next: any) {
  if (req.user?.dbUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Public routes - Auth
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // In a real implementation, this would authenticate with Supabase
      // For now, we'll return a mock response
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Return user data (in production, return actual JWT token)
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isOnboarded: user.isOnboarded
        },
        token: 'mock-jwt-token' // In production, return real JWT
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  // Protected routes
  app.use("/api/protected", authMiddleware);

  // User profile routes
  app.get("/api/protected/profile", async (req, res) => {
    try {
      const user = req.user.dbUser;
      const stats = await storage.getUserStats(user.id);
      
      res.json({
        ...user,
        stats
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  });

  app.patch("/api/protected/profile", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  });

  // Onboarding route
  app.post("/api/protected/onboarding", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const { gallupStrengths, personalityType, interests, availability } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        gallupStrengths,
        personalityType,
        interests,
        availability,
        isOnboarded: true
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Onboarding failed', error: error.message });
    }
  });

  // Activities routes
  app.get("/api/protected/activities", async (req, res) => {
    try {
      const { type } = req.query;
      const activities = await storage.getActivities(type as string);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get activities', error: error.message });
    }
  });

  app.get("/api/protected/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get activity', error: error.message });
    }
  });

  // AI Recommendations
  app.get("/api/protected/recommendations", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const recommendations = await aiMatchingService.generateRecommendationsForUser(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
  });

  // Participation routes
  app.post("/api/protected/activities/:id/participate", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user.dbUser.id;
      
      const participation = await storage.createParticipation({
        userId,
        activityId,
        status: 'registered'
      });

      // Send confirmation email
      const activity = await storage.getActivity(activityId);
      if (activity) {
        await emailService.sendActivityNotification(
          req.user.dbUser.email,
          activity.title,
          'confirmation'
        );
      }

      res.json(participation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to register for activity', error: error.message });
    }
  });

  app.get("/api/protected/my-activities", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const participations = await storage.getUserParticipations(userId);
      res.json(participations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user activities', error: error.message });
    }
  });

  // Certificates
  app.get("/api/protected/certificates", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get certificates', error: error.message });
    }
  });

  app.post("/api/protected/certificates/quarterly", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const { quarter, year } = req.body;
      
      const certificate = await certificateService.generateQuarterlyCertificate(userId, quarter, year);
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
    }
  });

  // Training routes
  app.get("/api/protected/training/modules", async (req, res) => {
    try {
      const modules = await storage.getTrainingModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get training modules', error: error.message });
    }
  });

  app.get("/api/protected/training/progress", async (req, res) => {
    try {
      const userId = req.user.dbUser.id;
      const progress = await storage.getUserTrainingProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get training progress', error: error.message });
    }
  });

  // Admin routes
  app.use("/api/protected/admin", adminMiddleware);

  // Excel upload for bulk user creation
  app.post("/api/protected/admin/upload-users", upload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No Excel file provided' });
      }

      const result = await excelProcessor.processExcelFile(req.file.buffer);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Excel processing failed', error: error.message });
    }
  });

  // Organization management
  app.get("/api/protected/admin/organizations", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get organizations', error: error.message });
    }
  });

  app.post("/api/protected/admin/organizations", async (req, res) => {
    try {
      const validatedData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(validatedData);
      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create organization', error: error.message });
    }
  });

  // Activity management
  app.post("/api/protected/admin/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        createdBy: req.user.dbUser.id
      });
      const activity = await storage.createActivity(validatedData);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create activity', error: error.message });
    }
  });

  app.patch("/api/protected/admin/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const updates = req.body;
      
      const activity = await storage.updateActivity(activityId, updates);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update activity', error: error.message });
    }
  });

  // Analytics
  app.get("/api/protected/admin/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      const officeStats = await storage.getOfficeStats();
      const departmentStats = await storage.getDepartmentStats();
      
      res.json({
        overview: analytics,
        byOffice: officeStats,
        byDepartment: departmentStats
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
