import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, count, sum, sql, inArray } from "drizzle-orm";
import { 
  users, 
  organizations, 
  activities, 
  participations, 
  nominations,
  badges,
  userBadges,
  certificates,
  trainingModules,
  trainingProgress,
  aiMatchingData,
  type User, 
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Activity,
  type InsertActivity,
  type Participation,
  type InsertParticipation,
  type Badge,
  type Certificate,
  type TrainingModule
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = postgres(process.env.DATABASE_URL);
const db = drizzle(sql_client);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  bulkCreateUsers(users: InsertUser[]): Promise<User[]>;
  
  // Organization operations
  getOrganizations(): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Activity operations
  getActivities(type?: string): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity>;
  getActivitiesByOrganization(organizationId: number): Promise<Activity[]>;
  
  // Participation operations
  getUserParticipations(userId: number): Promise<Participation[]>;
  createParticipation(participation: InsertParticipation): Promise<Participation>;
  updateParticipation(id: number, updates: Partial<Participation>): Promise<Participation>;
  getActivityParticipants(activityId: number): Promise<User[]>;
  
  // AI Matching operations
  getAIRecommendationsForUser(userId: number): Promise<Activity[]>;
  updateUserMatchingData(userId: number, data: any): Promise<void>;
  
  // Gamification operations
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(userId: number, badgeId: number, activityId?: number): Promise<void>;
  getUserStats(userId: number): Promise<{
    totalHours: number;
    totalPoints: number;
    badgeCount: number;
    level: string;
    sdgCount: number;
  }>;
  
  // Certificate operations
  getUserCertificates(userId: number): Promise<Certificate[]>;
  createCertificate(certificate: any): Promise<Certificate>;
  
  // Training operations
  getTrainingModules(): Promise<TrainingModule[]>;
  getUserTrainingProgress(userId: number): Promise<any[]>;
  updateTrainingProgress(userId: number, moduleId: number, progress: any): Promise<void>;
  
  // Analytics operations
  getAnalytics(): Promise<{
    totalUsers: number;
    totalHours: number;
    totalActivities: number;
    completedActivities: number;
  }>;
  getOfficeStats(): Promise<any[]>;
  getDepartmentStats(): Promise<any[]>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async bulkCreateUsers(userList: InsertUser[]): Promise<User[]> {
    if (userList.length === 0) return [];
    const result = await db.insert(users).values(userList).returning();
    return result;
  }

  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).where(eq(organizations.isActive, true));
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(org).returning();
    return result[0];
  }

  async getActivities(type?: string): Promise<Activity[]> {
    let query = db.select().from(activities).where(eq(activities.status, 'published'));
    
    if (type) {
      query = query.where(eq(activities.type, type as any));
    }
    
    return await query.orderBy(desc(activities.createdAt));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
    return result[0];
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    const result = await db.update(activities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async getActivitiesByOrganization(organizationId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(and(
        eq(activities.organizationId, organizationId),
        eq(activities.status, 'published')
      ));
  }

  async getUserParticipations(userId: number): Promise<Participation[]> {
    return await db.select().from(participations)
      .where(eq(participations.userId, userId))
      .orderBy(desc(participations.appliedAt));
  }

  async createParticipation(participation: InsertParticipation): Promise<Participation> {
    const result = await db.insert(participations).values(participation).returning();
    return result[0];
  }

  async updateParticipation(id: number, updates: Partial<Participation>): Promise<Participation> {
    const result = await db.update(participations)
      .set(updates)
      .where(eq(participations.id, id))
      .returning();
    return result[0];
  }

  async getActivityParticipants(activityId: number): Promise<User[]> {
    const result = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      office: users.office,
      position: users.position,
      department: users.department
    })
    .from(users)
    .innerJoin(participations, eq(users.id, participations.userId))
    .where(eq(participations.activityId, activityId));
    
    return result as User[];
  }

  async getAIRecommendationsForUser(userId: number): Promise<Activity[]> {
    // Get user preferences and matching data
    const user = await this.getUser(userId);
    if (!user) return [];

    // For now, return activities of type 'ong_volunteering' that match user interests
    // In production, this would use the AI matching algorithm
    return await db.select().from(activities)
      .where(and(
        eq(activities.type, 'ong_volunteering'),
        eq(activities.status, 'published')
      ))
      .limit(5);
  }

  async updateUserMatchingData(userId: number, data: any): Promise<void> {
    await db.insert(aiMatchingData)
      .values({
        userId,
        matchingScore: data.matchingScore,
        preferences: data.preferences,
        recommendationHistory: data.recommendationHistory
      })
      .onConflictDoUpdate({
        target: aiMatchingData.userId,
        set: {
          lastUpdateDate: new Date(),
          matchingScore: data.matchingScore,
          preferences: data.preferences,
          recommendationHistory: data.recommendationHistory
        }
      });
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const result = await db.select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      iconUrl: badges.iconUrl,
      requirements: badges.requirements,
      pointsRequired: badges.pointsRequired,
      isActive: badges.isActive,
      createdAt: badges.createdAt
    })
    .from(badges)
    .innerJoin(userBadges, eq(badges.id, userBadges.badgeId))
    .where(eq(userBadges.userId, userId));
    
    return result as Badge[];
  }

  async awardBadge(userId: number, badgeId: number, activityId?: number): Promise<void> {
    await db.insert(userBadges).values({
      userId,
      badgeId,
      activityId
    });
  }

  async getUserStats(userId: number): Promise<{
    totalHours: number;
    totalPoints: number;
    badgeCount: number;
    level: string;
    sdgCount: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        totalHours: 0,
        totalPoints: 0,
        badgeCount: 0,
        level: 'Voluntario Novato',
        sdgCount: 0
      };
    }

    const badgeCountResult = await db.select({ count: count() })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    // Calculate unique SDGs from user's activities
    const sdgResult = await db.select({ sdgGoals: activities.sdgGoals })
      .from(activities)
      .innerJoin(participations, eq(activities.id, participations.activityId))
      .where(and(
        eq(participations.userId, userId),
        eq(participations.status, 'completed')
      ));

    const uniqueSdgs = new Set();
    sdgResult.forEach(row => {
      if (row.sdgGoals && Array.isArray(row.sdgGoals)) {
        row.sdgGoals.forEach(sdg => uniqueSdgs.add(sdg));
      }
    });

    return {
      totalHours: parseFloat(user.totalHours || '0'),
      totalPoints: user.totalPoints || 0,
      badgeCount: badgeCountResult[0]?.count || 0,
      level: user.currentLevel || 'Voluntario Novato',
      sdgCount: uniqueSdgs.size
    };
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return await db.select().from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issueDate));
  }

  async createCertificate(certificate: any): Promise<Certificate> {
    const result = await db.insert(certificates).values(certificate).returning();
    return result[0];
  }

  async getTrainingModules(): Promise<TrainingModule[]> {
    return await db.select().from(trainingModules)
      .where(eq(trainingModules.isActive, true))
      .orderBy(trainingModules.moduleNumber);
  }

  async getUserTrainingProgress(userId: number): Promise<any[]> {
    return await db.select({
      moduleId: trainingProgress.moduleId,
      status: trainingProgress.status,
      progressPercentage: trainingProgress.progressPercentage,
      completedAt: trainingProgress.completedAt,
      module: {
        id: trainingModules.id,
        title: trainingModules.title,
        description: trainingModules.description,
        moduleNumber: trainingModules.moduleNumber,
        duration: trainingModules.duration,
        pointsReward: trainingModules.pointsReward
      }
    })
    .from(trainingProgress)
    .innerJoin(trainingModules, eq(trainingProgress.moduleId, trainingModules.id))
    .where(eq(trainingProgress.userId, userId));
  }

  async updateTrainingProgress(userId: number, moduleId: number, progress: any): Promise<void> {
    await db.insert(trainingProgress)
      .values({
        userId,
        moduleId,
        ...progress
      })
      .onConflictDoUpdate({
        target: [trainingProgress.userId, trainingProgress.moduleId],
        set: progress
      });
  }

  async getAnalytics(): Promise<{
    totalUsers: number;
    totalHours: number;
    totalActivities: number;
    completedActivities: number;
  }> {
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalHoursResult = await db.select({ 
      total: sum(users.totalHours) 
    }).from(users);
    const totalActivitiesResult = await db.select({ count: count() }).from(activities);
    const completedActivitiesResult = await db.select({ count: count() })
      .from(participations)
      .where(eq(participations.status, 'completed'));

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalHours: parseFloat(totalHoursResult[0]?.total || '0'),
      totalActivities: totalActivitiesResult[0]?.count || 0,
      completedActivities: completedActivitiesResult[0]?.count || 0
    };
  }

  async getOfficeStats(): Promise<any[]> {
    return await db.select({
      office: users.office,
      userCount: count(users.id),
      totalHours: sum(users.totalHours)
    })
    .from(users)
    .where(sql`${users.office} IS NOT NULL`)
    .groupBy(users.office);
  }

  async getDepartmentStats(): Promise<any[]> {
    return await db.select({
      department: users.department,
      userCount: count(users.id),
      totalHours: sum(users.totalHours)
    })
    .from(users)
    .where(sql`${users.department} IS NOT NULL`)
    .groupBy(users.department);
  }
}

export const storage = new PostgresStorage();
