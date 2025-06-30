import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['employee', 'admin']);
export const activityTypeEnum = pgEnum('activity_type', ['ong_volunteering', 'lab', 'micro_mission', 'training']);
export const activityStatusEnum = pgEnum('activity_status', ['draft', 'published', 'completed', 'cancelled']);
export const participationStatusEnum = pgEnum('participation_status', ['registered', 'confirmed', 'completed', 'cancelled']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: uuid("supabase_id").unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('employee').notNull(),
  office: text("office"), // sede
  position: text("position"), // cargo
  department: text("department"), // área
  phoneNumber: text("phone_number"),
  isOnboarded: boolean("is_onboarded").default(false),
  gallupStrengths: jsonb("gallup_strengths"), // Results from Gallup test
  personalityType: text("personality_type"), // Eysenck test result
  interests: jsonb("interests"), // Array of interest areas
  availability: jsonb("availability"), // Time availability preferences
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default('0'),
  currentLevel: text("current_level").default('Voluntario Novato'),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Organizations (ONGs)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  focusAreas: jsonb("focus_areas"), // Array of SDG areas
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: activityTypeEnum("type").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  sdgGoals: jsonb("sdg_goals"), // Array of SDG numbers
  requiredSkills: jsonb("required_skills"), // Array of required skills
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false),
  maxParticipants: integer("max_participants"),
  duration: integer("duration"), // in hours
  scheduledDate: timestamp("scheduled_date"),
  registrationDeadline: timestamp("registration_deadline"),
  pointsReward: integer("points_reward").default(0),
  status: activityStatusEnum("status").default('draft'),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User Activity Participations
export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityId: integer("activity_id").references(() => activities.id).notNull(),
  status: participationStatusEnum("status").default('registered'),
  appliedAt: timestamp("applied_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  hoursLogged: decimal("hours_logged", { precision: 5, scale: 2 }),
  pointsEarned: integer("points_earned").default(0),
  feedback: text("feedback"),
  rating: integer("rating") // 1-5 rating
});

// Micro-Mission Nominations
export const nominations = pgTable("nominations", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").references(() => activities.id).notNull(),
  nominatorId: integer("nominator_id").references(() => users.id).notNull(),
  nomineeId: integer("nominee_id").references(() => users.id).notNull(),
  message: text("message"),
  status: text("status").default('pending'), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow()
});

// Badges and Achievements
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  requirements: jsonb("requirements"), // Criteria for earning the badge
  pointsRequired: integer("points_required"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// User Badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  activityId: integer("activity_id").references(() => activities.id)
});

// Certificates (POAP or PDF)
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'poap' or 'pdf'
  title: text("title").notNull(),
  description: text("description"),
  issueDate: timestamp("issue_date").defaultNow(),
  validUntil: timestamp("valid_until"),
  certificateUrl: text("certificate_url"), // URL to PDF or POAP
  metadata: jsonb("metadata"), // Additional certificate data
  activityId: integer("activity_id").references(() => activities.id)
});

// Training Modules
export const trainingModules = pgTable("training_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  moduleNumber: integer("module_number").notNull(),
  prerequisiteModuleId: integer("prerequisite_module_id").references(() => trainingModules.id),
  content: jsonb("content"), // Module content structure
  duration: integer("duration"), // in hours
  pointsReward: integer("points_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// User Training Progress
export const trainingProgress = pgTable("training_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => trainingModules.id).notNull(),
  status: text("status").default('not_started'), // not_started, in_progress, completed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0),
  finalScore: integer("final_score")
});

// AI Matching Preferences (for ONG volunteering)
export const aiMatchingData = pgTable("ai_matching_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lastUpdateDate: timestamp("last_update_date").defaultNow(),
  matchingScore: jsonb("matching_score"), // Scores for different activity types
  preferences: jsonb("preferences"), // AI-calculated preferences
  recommendationHistory: jsonb("recommendation_history") // Past recommendations
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertParticipationSchema = createInsertSchema(participations).omit({
  id: true,
  appliedAt: true
});

export const insertNominationSchema = createInsertSchema(nominations).omit({
  id: true,
  createdAt: true
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issueDate: true
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertParticipation = z.infer<typeof insertParticipationSchema>;
export type Participation = typeof participations.$inferSelect;
export type InsertNomination = z.infer<typeof insertNominationSchema>;
export type Nomination = typeof nominations.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type TrainingModule = typeof trainingModules.$inferSelect;
