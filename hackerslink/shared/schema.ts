import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Worker Schema
export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  skill: text("skill").notNull(),
  location: text("location").notNull(),
  isAvailable: boolean("is_available").default(true),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertWorkerSchema = createInsertSchema(workers).pick({
  name: true,
  phone: true,
  skill: true,
  location: true,
  isAvailable: true,
});

// Job Schema
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  contactPhone: text("contact_phone").notNull(),
  skillRequired: text("skill_required").notNull(),
  location: text("location").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  projectDuration: text("project_duration").notNull(),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  contactPhone: true,
  skillRequired: true,
  location: true,
  dailyRate: true,
  projectDuration: true,
  additionalNotes: true,
  isActive: true,
});

// Matching Schema for keeping track of job matches
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  workerId: integer("worker_id").notNull(),
  notificationSent: boolean("notification_sent").default(false),
  notificationTime: timestamp("notification_time"),
  workerResponded: boolean("worker_responded").default(false),
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  jobId: true,
  workerId: true,
  notificationSent: true,
  notificationTime: true,
  workerResponded: true,
});

// Define relations
export const workersRelations = relations(workers, ({ many }) => ({
  matches: many(matches),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  job: one(jobs, {
    fields: [matches.jobId],
    references: [jobs.id],
  }),
  worker: one(workers, {
    fields: [matches.workerId],
    references: [workers.id],
  }),
}));

// Export types
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// Constants
export const SKILLS = [
  "Mason",
  "Carpenter",
  "Electrician",
  "Plumber",
  "Painter",
  "Welder",
  "General Labor"
];

export const LOCATIONS = [
  "Pipeline",
  "Gikambura",
  "Kawangware",
  "Kasarani",
  "Rongai",
  "Kitengela"
];

export const DURATIONS = [
  "1 day",
  "2-3 days",
  "1 week",
  "2 weeks",
  "1 month",
  "3+ months"
];

// USSD session schema
export const ussdSessions = pgTable("ussd_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  step: text("step").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUssdSessionSchema = createInsertSchema(ussdSessions).pick({
  sessionId: true,
  phoneNumber: true,
  step: true,
  data: true,
});

export type UssdSession = typeof ussdSessions.$inferSelect;
export type InsertUssdSession = z.infer<typeof insertUssdSessionSchema>;
