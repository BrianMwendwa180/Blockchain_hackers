import express, { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleUssdRequest } from "./ussd-service";
import { insertWorkerSchema, insertJobSchema, SKILLS, LOCATIONS } from "@shared/schema";
import { notificationService } from "./notification-service";
import { z } from "zod";
// Import Africa's Talking SDK
import AfricasTalking from 'africastalking';

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // API Routes
  // -- Workers routes --
  
  // Get worker count by skill and location
  router.get("/workers/count", async (req: Request, res: Response) => {
    try {
      const { skill, location } = req.query;
      
      if (!skill || !location) {
        return res.status(400).json({ message: "Skill and location are required" });
      }
      
      const count = await storage.getWorkerCount(
        skill as string, 
        location as string
      );
      
      return res.json({ count });
    } catch (error) {
      console.error("Error getting worker count:", error);
      return res.status(500).json({ message: "Failed to get worker count" });
    }
  });
  
  // Register worker
  router.post("/workers/register", async (req: Request, res: Response) => {
    try {
      const result = insertWorkerSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid worker data", 
          errors: result.error.errors 
        });
      }
      
      // Check if phone number already exists
      const existingWorker = await storage.getWorkerByPhone(result.data.phone);
      if (existingWorker) {
        return res.status(409).json({ message: "Phone number already registered" });
      }
      
      const worker = await storage.createWorker(result.data);
      return res.status(201).json(worker);
    } catch (error) {
      console.error("Error registering worker:", error);
      return res.status(500).json({ message: "Failed to register worker" });
    }
  });
  
  // -- Jobs routes --
  
  // Post a new job
  router.post("/jobs", async (req: Request, res: Response) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid job data", 
          errors: result.error.errors 
        });
      }
      
      const job = await storage.createJob(result.data);
      
      // Find matching workers
      const workers = await storage.findMatchingWorkers(
        job.skillRequired,
        job.location,
        3 // Maximum number of workers to match
      );
      
      // Create matches and send notifications
      if (workers.length > 0) {
        const matchIds = [];
        
        for (const worker of workers) {
          // Create match
          const match = await storage.createMatch({
            jobId: job.id,
            workerId: worker.id,
            notificationSent: false, // Will be set to true after sending SMS
            notificationTime: new Date(),
            workerResponded: false
          });
          
          matchIds.push(match.id);
        }
        
        // Send SMS notifications for all matches
        const notificationResults = await Promise.all(
          matchIds.map(matchId => notificationService.sendJobMatchSMS(matchId))
        );
        
        console.log('SMS notification results:', notificationResults);
      }
      
      return res.status(201).json({
        ...job,
        matchedWorkers: workers.length
      });
    } catch (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({ message: "Failed to create job" });
    }
  });
  
  // Get available skills
  router.get("/skills", (_req: Request, res: Response) => {
    res.json({ skills: SKILLS });
  });
  
  // Get available locations
  router.get("/locations", (_req: Request, res: Response) => {
    res.json({ locations: LOCATIONS });
  });
  
  // -- USSD endpoint --
  
  // Handle USSD requests
  router.post("/ussd", async (req: Request, res: Response) => {
    try {
      // Log everything to help debugging
      console.log("USSD Raw Request:", {
        body: req.body,
        query: req.query,
        headers: req.headers
      });
      
      // The Africa's Talking parameters could be in a few places - be flexible
      // Note: From Africa's Talking the params are typically sessionId, phoneNumber, serviceCode, text
      const sessionId = req.body.sessionId || req.query.sessionId;
      const phoneNumber = req.body.phoneNumber || req.query.phoneNumber;
      let text = req.body.text || req.query.text || "";
      
      // For debugging - check all possibilities
      console.log("All possible text inputs:", {
        "req.body.text": req.body.text,
        "req.query.text": req.query.text,
        "req.body.ussdString": req.body.ussdString, // Some implementations use this
        "req.query.ussdString": req.query.ussdString
      });
      
      // If text isn't found in the expected places, try alternative fields
      if (!text && req.body.ussdString) {
        text = req.body.ussdString;
      }
      
      if (!sessionId || !phoneNumber) {
        console.error("Missing sessionId or phoneNumber in USSD request");
        return res.status(200).send("END Session ID and phone number are required");
      }
      
      console.log(`USSD Processing: sessionId=${sessionId}, phoneNumber=${phoneNumber}, text='${text}'`);
      
      // Actual processing
      const response = await handleUssdRequest(sessionId, phoneNumber, text);
      
      // Africa's Talking USSD response format must be text/plain with 200 status
      res.set('Content-Type', 'text/plain');
      console.log(`USSD Response: '${response}'`);
      return res.status(200).send(response);
    } catch (error) {
      console.error("Error handling USSD request:", error);
      res.set('Content-Type', 'text/plain');
      return res.status(200).send("END An error occurred. Please try again later.");
    }
  });
  
  // -- SMS endpoints --
  
  // Handle SMS responses (webhook for Africa's Talking)
  router.post("/sms", async (req: Request, res: Response) => {
    try {
      const { from, text } = req.body;
      
      if (!from || !text) {
        return res.status(400).json({ 
          message: "From and text parameters are required" 
        });
      }
      
      // Process SMS responses from workers
      // In a real implementation, this would update the match status
      console.log(`SMS received from ${from}: ${text}`);
      
      return res.status(200).json({ 
        message: "SMS processed successfully" 
      });
    } catch (error) {
      console.error("Error handling SMS:", error);
      return res.status(500).json({ 
        message: "Failed to process SMS" 
      });
    }
  });
  
  // Send SMS notification for a job match
  router.post("/notifications/job-match/:matchId", async (req: Request, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      // Get match details
      const matchDetails = await storage.getMatchWithDetails(matchId);
      
      if (!matchDetails) {
        return res.status(404).json({ message: "Match not found or missing related data" });
      }
      
      // Send SMS notification
      const result = await notificationService.sendJobMatchSMS(matchId);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send SMS notification", 
          error: result.error 
        });
      }
      
      return res.status(200).json({ 
        message: "SMS notification sent successfully",
        result: result.result
      });
    } catch (error) {
      console.error("Error sending job match notification:", error);
      return res.status(500).json({ 
        message: "Failed to send SMS notification" 
      });
    }
  });
  
  // Register API routes
  app.use("/api", router);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
