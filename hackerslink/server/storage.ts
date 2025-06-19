import { 
  workers, type Worker, type InsertWorker,
  jobs, type Job, type InsertJob,
  matches, type Match, type InsertMatch,
  ussdSessions, type UssdSession, type InsertUssdSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Worker operations
  getWorker(id: number): Promise<Worker | undefined>;
  getWorkerByPhone(phone: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorkerSkill(workerId: number, skill: string): Promise<Worker>;
  updateWorkerLocation(workerId: number, location: string): Promise<Worker>;
  getWorkerCount(skill: string, location: string): Promise<number>;
  findMatchingWorkers(skill: string, location: string, limit: number): Promise<Worker[]>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  getActiveJobs(): Promise<Job[]>;
  
  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByJobId(jobId: number): Promise<Match[]>;
  getMatchesByWorkerId(workerId: number): Promise<Match[]>;
  getMatchWithDetails(matchId: number): Promise<{match: Match, worker: Worker, job: Job} | undefined>;
  updateMatchNotification(matchId: number, notificationSent: boolean, notificationTime?: Date): Promise<Match>;
  
  // USSD Session operations
  getUssdSession(sessionId: string): Promise<UssdSession | undefined>;
  createUssdSession(session: InsertUssdSession): Promise<UssdSession>;
  updateUssdSession(sessionId: string, step: string, data: string): Promise<UssdSession>;
}

export class DatabaseStorage implements IStorage {
  // Worker Methods
  async getWorker(id: number): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id));
    return result[0];
  }

  async getWorkerByPhone(phone: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.phone, phone));
    return result[0];
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const result = await db.insert(workers).values(worker).returning();
    return result[0];
  }

  async getWorkerCount(skill: string, location: string): Promise<number> {
    const result = await db.select()
      .from(workers)
      .where(
        and(
          eq(workers.skill, skill),
          eq(workers.location, location),
          eq(workers.isAvailable, true)
        )
      );
    return result.length;
  }

  async findMatchingWorkers(skill: string, location: string, limit: number): Promise<Worker[]> {
    return db.select()
      .from(workers)
      .where(
        and(
          eq(workers.skill, skill),
          eq(workers.location, location),
          eq(workers.isAvailable, true)
        )
      )
      .limit(limit);
  }
  
  async updateWorkerSkill(workerId: number, skill: string): Promise<Worker> {
    const result = await db.update(workers)
      .set({ skill })
      .where(eq(workers.id, workerId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }
    
    return result[0];
  }
  
  async updateWorkerLocation(workerId: number, location: string): Promise<Worker> {
    const result = await db.update(workers)
      .set({ location })
      .where(eq(workers.id, workerId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }
    
    return result[0];
  }

  // Job Methods
  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async getActiveJobs(): Promise<Job[]> {
    return db.select()
      .from(jobs)
      .where(eq(jobs.isActive, true));
  }

  // Match Methods
  async createMatch(match: InsertMatch): Promise<Match> {
    const result = await db.insert(matches).values(match).returning();
    return result[0];
  }

  async getMatchesByJobId(jobId: number): Promise<Match[]> {
    return db.select()
      .from(matches)
      .where(eq(matches.jobId, jobId));
  }

  async getMatchesByWorkerId(workerId: number): Promise<Match[]> {
    return db.select()
      .from(matches)
      .where(eq(matches.workerId, workerId));
  }
  
  async getMatchWithDetails(matchId: number): Promise<{match: Match, worker: Worker, job: Job} | undefined> {
    const matchResult = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId));
    
    if (matchResult.length === 0) {
      return undefined;
    }
    
    const match = matchResult[0];
    const worker = await this.getWorker(match.workerId);
    const job = await this.getJob(match.jobId);
    
    if (!worker || !job) {
      return undefined;
    }
    
    return {
      match,
      worker,
      job
    };
  }
  
  async updateMatchNotification(matchId: number, notificationSent: boolean, notificationTime: Date = new Date()): Promise<Match> {
    const result = await db.update(matches)
      .set({
        notificationSent,
        notificationTime
      })
      .where(eq(matches.id, matchId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Match with ID ${matchId} not found`);
    }
    
    return result[0];
  }

  // USSD Session Methods
  async getUssdSession(sessionId: string): Promise<UssdSession | undefined> {
    const result = await db.select()
      .from(ussdSessions)
      .where(eq(ussdSessions.sessionId, sessionId));
    return result[0];
  }

  async createUssdSession(session: InsertUssdSession): Promise<UssdSession> {
    const result = await db.insert(ussdSessions).values(session).returning();
    return result[0];
  }

  async updateUssdSession(sessionId: string, step: string, data: string): Promise<UssdSession> {
    const session = await this.getUssdSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    const result = await db.update(ussdSessions)
      .set({ step, data })
      .where(eq(ussdSessions.sessionId, sessionId))
      .returning();
    return result[0];
  }

  // Seed data method can be used for initial setup if needed
  async seedData() {
    // Check if we have any workers
    const workersResult = await db.select().from(workers);
    
    if (workersResult.length === 0) {
      // Add sample workers
      await this.createWorker({
        name: "David Odhiambo",
        phone: "0711222333",
        skill: "Mason",
        location: "Pipeline",
        isAvailable: true,
      });
      
      await this.createWorker({
        name: "John Mwangi",
        phone: "0722333444",
        skill: "Carpenter",
        location: "Pipeline",
        isAvailable: true,
      });
      
      await this.createWorker({
        name: "James Kimani",
        phone: "0733444555",
        skill: "Electrician",
        location: "Gikambura",
        isAvailable: true,
      });
      
      // Add a sample job
      await this.createJob({
        contactPhone: "0799888777",
        skillRequired: "Electrician",
        location: "Gikambura",
        dailyRate: 1500,
        projectDuration: "1 day",
        additionalNotes: "Need wiring installation for a new kitchen.",
        isActive: true,
      });
    }
  }
}

export const storage = new DatabaseStorage();
