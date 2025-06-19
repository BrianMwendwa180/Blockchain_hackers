import { storage } from "./storage";
import { atService } from "./at-service";
import { db } from "./db";
import { jobs, SKILLS, LOCATIONS } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Define USSD session states/steps for the simplified flow
enum UssdState {
  MAIN_MENU = "main_menu",
  REGISTER_NAME = "register_name",
  REGISTER_SKILL = "register_skill",
  SELECT_LOCATION = "select_location",
  UPDATE_PROFILE_MENU = "update_profile_menu",
  UPDATE_SKILL = "update_skill",
  UPDATE_LOCATION = "update_location",
  VIEW_JOBS = "view_jobs"
}

/**
 * Handle incoming USSD requests from Africa's Talking
 * 
 * The function processes requests with parameters:
 * @param sessionId - Unique session identifier from Africa's Talking
 * @param phoneNumber - Phone number of the user
 * @param text - User input text which may contain navigation history
 */
export async function handleUssdRequest(
  sessionId: string,
  phoneNumber: string,
  text: string
): Promise<string> {
  console.log(`[USSD] Processing request - sessionId: ${sessionId}, phoneNumber: ${phoneNumber}, text: '${text}'`);
  
  // For new session or empty text, show the initial screen
  if (!text || text === "") {
    // Create new session
    await storage.createUssdSession({
      sessionId,
      phoneNumber,
      step: UssdState.MAIN_MENU,
      data: JSON.stringify({})
    });
    
    // Return initial menu
    return "CON Welcome to Yaya - Construction Jobs\nChoose an option:\n1. Register as a Worker\n2. View Available Job Matches\n3. Update Profile";
  }

  // Get or create session state
  let session = await storage.getUssdSession(sessionId);
  if (!session) {
    // Create session if one doesn't exist
    session = await storage.createUssdSession({
      sessionId,
      phoneNumber,
      step: UssdState.MAIN_MENU,
      data: JSON.stringify({})
    });
  }

  // Parse session data
  let sessionData = JSON.parse(session.data);
  
  try {
    // Extract the user's last input from the text string
    // The text from Africa's Talking contains the full session history
    // Format is typically like: "1*Name*Skill" where each * separates a step
    const parts = text.split('*');
    const lastInput = parts.length > 0 ? parts[parts.length - 1] : '';
    
    console.log(`Text input: "${text}", Split parts: ${JSON.stringify(parts)}, Last input: "${lastInput}"`);
    
    // Check the current step and process accordingly
    if (session.step === UssdState.MAIN_MENU) {
      // Process main menu selection
      const menuChoice = text; // At main menu, text is just "1" or "2"
      
      if (menuChoice === "1") {
        // User selected Register - ask for name
        await storage.updateUssdSession(
          sessionId,
          UssdState.REGISTER_NAME,
          JSON.stringify(sessionData)
        );
        return "CON Enter your full name:";
      } 
      else if (menuChoice === "2") {
        // User selected View Job Matches
        // Check if user exists
        const worker = await storage.getWorkerByPhone(phoneNumber);
        if (!worker) {
          return "END You are not registered yet. Please register first.";
        }
        
        // Find jobs matching worker's current skill and location
        const matchingJobs = await db.select()
          .from(jobs)
          .where(
            and(
              eq(jobs.skillRequired, worker.skill),
              eq(jobs.location, worker.location),
              eq(jobs.isActive, true)
            )
          );
        
        if (matchingJobs.length === 0) {
          return "END No job matches found. We'll notify you when new matching jobs are available.";
        }
        
        // Show a list of available jobs (up to 3 most recent)
        if (matchingJobs.length === 1) {
          // If there's only one job, show it directly
          const job = matchingJobs[0];
          
          // Format payment rate and duration
          const formattedRate = job.dailyRate ? `KSh ${job.dailyRate}/day` : 'Rate not specified';
          const duration = job.projectDuration || 'Not specified';
          
          // Create a comprehensive job response
          const details = job.additionalNotes ? `\nDetails: ${job.additionalNotes}` : '';
          const jobDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
          
          return `END JOB OPPORTUNITY\n
Skill: ${job.skillRequired}
Location: ${job.location}
Payment: ${formattedRate}
Duration: ${duration}${details}
Posted: ${jobDate}

To apply, call: ${job.contactPhone}

Reply YES to +254700000000 if interested.`;
        } else {
          // If there are multiple jobs, show the 3 most recent
          const recentJobs = matchingJobs.slice(-3).reverse(); // Get last 3 and reverse to show newest first
          
          let jobsInfo = "END Your available job matches:\n\n";
          
          for (let i = 0; i < recentJobs.length; i++) {
            const job = recentJobs[i];
            
            // Format date
            const jobDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
            
            jobsInfo += `${i+1}. ${job.skillRequired} in ${job.location}\n`;
            jobsInfo += `   Pay: KSh ${job.dailyRate}/day, ${job.projectDuration}\n`;
            jobsInfo += `   Call: ${job.contactPhone}\n`;
            jobsInfo += `   Posted: ${jobDate}\n\n`;
          }
          
          jobsInfo += "Dial *384*15667# and select option 2 to view again.";
          
          return jobsInfo;
        }
      }
      else if (menuChoice === "3") {
        // User selected Update Profile
        // Check if user exists
        const worker = await storage.getWorkerByPhone(phoneNumber);
        if (!worker) {
          return "END You are not registered yet. Please register first.";
        }
        
        // Move to update profile menu
        await storage.updateUssdSession(
          sessionId,
          UssdState.UPDATE_PROFILE_MENU,
          JSON.stringify({ workerId: worker.id })
        );
        
        return "CON Update Profile\nWhat would you like to update?\n1. Skill\n2. Location\n3. Back to Main Menu";
      }
      else {
        // Invalid option
        return "CON Invalid option. Please choose:\n1. Register as a Worker\n2. View Available Job Matches\n3. Update Profile";
      }
    }
    else if (session.step === UssdState.REGISTER_NAME) {
      // Process name input
      // For multi-part flows, the text will be in format "1*Name", we need to extract just "Name"
      const parts = text.split('*');
      // For name entry, we expect text to be "1*[name]" so we take the second element (index 1)
      const name = parts.length > 1 ? parts[1] : lastInput;
      
      // Save user's name to session data
      sessionData.name = name;
      console.log(`Saving name to session: ${name}`);
      
      // Update session and move to skill selection
      await storage.updateUssdSession(
        sessionId,
        UssdState.REGISTER_SKILL,
        JSON.stringify(sessionData)
      );
      
      // Create numbered list of skills
      const skillOptions = SKILLS.map((skill, index) => `${index + 1}. ${skill}`).join('\n');
      return `CON Select your skill:\n${skillOptions}`;
    }
    else if (session.step === UssdState.REGISTER_SKILL) {
      // Process skill selection
      const name = sessionData.name;
      const skillIndex = parseInt(lastInput) - 1; // Convert to zero-based index
      
      // Validate skill selection
      if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= SKILLS.length) {
        // Invalid selection
        const skillOptions = SKILLS.map((skill, index) => `${index + 1}. ${skill}`).join('\n');
        return `CON Invalid selection. Please select a skill:\n${skillOptions}`;
      }
      
      const skill = SKILLS[skillIndex];
      console.log(`Selected skill: ${skill} (index: ${skillIndex})`);
      
      // Store selected skill in session
      sessionData.skill = skill;
      
      // Move to location selection
      await storage.updateUssdSession(
        sessionId,
        UssdState.SELECT_LOCATION,
        JSON.stringify(sessionData)
      );
      
      // Create numbered list of locations
      const locationOptions = LOCATIONS.map((location, index) => `${index + 1}. ${location}`).join('\n');
      return `CON Select your location:\n${locationOptions}`;
    }
    
    // New step for location selection
    else if (session.step === UssdState.SELECT_LOCATION) {
      const locationIndex = parseInt(lastInput) - 1; // Convert to zero-based index
      
      // Validate location selection
      if (isNaN(locationIndex) || locationIndex < 0 || locationIndex >= LOCATIONS.length) {
        // Invalid selection
        const locationOptions = LOCATIONS.map((location, index) => `${index + 1}. ${location}`).join('\n');
        return `CON Invalid selection. Please select a location:\n${locationOptions}`;
      }
      
      const location = LOCATIONS[locationIndex];
      const name = sessionData.name;
      const skill = sessionData.skill;
      
      console.log(`Registering worker: Name=${name}, Phone=${phoneNumber}, Skill=${skill}, Location=${location}`);
      
      // Check if worker already exists
      const existingWorker = await storage.getWorkerByPhone(phoneNumber);
      if (existingWorker) {
        return "END You are already registered.";
      }
      
      // Create the worker in the database
      await storage.createWorker({
        name: name,
        phone: phoneNumber,
        skill: skill,
        location: location,
        isAvailable: true
      });
      
      // Reset session to main menu
      await storage.updateUssdSession(
        sessionId,
        UssdState.MAIN_MENU,
        JSON.stringify({})
      );
      
      return "END Registration successful!\n\nYour profile:\nName: " + name + "\nPhone: " + phoneNumber + "\nSkill: " + skill + "\nLocation: " + location + "\n\nYou will receive SMS notifications when matching jobs are posted. Dial *384*15667# to check your job matches at any time.";
    }
    else if (session.step === UssdState.UPDATE_PROFILE_MENU) {
      // Process update profile menu selection
      const choice = lastInput;
      const workerId = sessionData.workerId;
      
      if (choice === "1") {
        // Update skill selected
        await storage.updateUssdSession(
          sessionId,
          UssdState.UPDATE_SKILL,
          JSON.stringify(sessionData)
        );
        // Create numbered list of skills
        const skillOptions = SKILLS.map((skill, index) => `${index + 1}. ${skill}`).join('\n');
        return `CON Select your new skill:\n${skillOptions}`;
      } 
      else if (choice === "2") {
        // Update location selected
        await storage.updateUssdSession(
          sessionId,
          UssdState.UPDATE_LOCATION,
          JSON.stringify(sessionData)
        );
        // Create numbered list of locations
        const locationOptions = LOCATIONS.map((location, index) => `${index + 1}. ${location}`).join('\n');
        return `CON Select your new location:\n${locationOptions}`;
      }
      else if (choice === "3") {
        // Back to main menu
        await storage.updateUssdSession(
          sessionId,
          UssdState.MAIN_MENU,
          JSON.stringify({})
        );
        return "CON Welcome to Yaya - Construction Jobs\nChoose an option:\n1. Register as a Worker\n2. View Available Job Matches\n3. Update Profile";
      }
      else {
        // Invalid option
        return "CON Invalid option. Please choose:\n1. Skill\n2. Location\n3. Back to Main Menu";
      }
    }
    else if (session.step === UssdState.UPDATE_SKILL) {
      // Process skill selection for update
      const skillIndex = parseInt(lastInput) - 1; // Convert to zero-based index
      const workerId = sessionData.workerId;
      
      // Validate skill selection
      if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= SKILLS.length) {
        // Invalid selection
        const skillOptions = SKILLS.map((skill, index) => `${index + 1}. ${skill}`).join('\n');
        return `CON Invalid selection. Please select a skill:\n${skillOptions}`;
      }
      
      const newSkill = SKILLS[skillIndex];
      console.log(`Selected new skill: ${newSkill} (index: ${skillIndex})`);
      
      try {
        // Update the skill in the database
        const updatedWorker = await storage.updateWorkerSkill(workerId, newSkill);
        
        // Reset to main menu
        await storage.updateUssdSession(
          sessionId,
          UssdState.MAIN_MENU,
          JSON.stringify({})
        );
        
        return `END Your skill has been updated to: ${newSkill}\n\nYou will now receive job matches for ${newSkill} jobs.`;
      } catch (error) {
        console.error("Error updating worker skill:", error);
        return "END Failed to update your skill. Please try again later.";
      }
    }
    else if (session.step === UssdState.UPDATE_LOCATION) {
      // Process location selection for update
      const locationIndex = parseInt(lastInput) - 1; // Convert to zero-based index
      const workerId = sessionData.workerId;
      
      // Validate location selection
      if (isNaN(locationIndex) || locationIndex < 0 || locationIndex >= LOCATIONS.length) {
        // Invalid selection
        const locationOptions = LOCATIONS.map((location, index) => `${index + 1}. ${location}`).join('\n');
        return `CON Invalid selection. Please select a location:\n${locationOptions}`;
      }
      
      const newLocation = LOCATIONS[locationIndex];
      console.log(`Selected new location: ${newLocation} (index: ${locationIndex})`);
      
      try {
        // Update the location in the database
        const updatedWorker = await storage.updateWorkerLocation(workerId, newLocation);
        
        // Reset to main menu
        await storage.updateUssdSession(
          sessionId,
          UssdState.MAIN_MENU,
          JSON.stringify({})
        );
        
        return `END Your location has been updated to: ${newLocation}\n\nYou will now receive job matches for jobs in ${newLocation}.`;
      } catch (error) {
        console.error("Error updating worker location:", error);
        return "END Failed to update your location. Please try again later.";
      }
    }
    else {
      // Unknown state - reset to main menu
      await storage.updateUssdSession(
        sessionId,
        UssdState.MAIN_MENU,
        JSON.stringify({})
      );
      return "CON Welcome to Yaya - Construction Jobs\nChoose an option:\n1. Register as a Worker\n2. View Available Job Matches\n3. Update Profile";
    }
  } catch (error) {
    console.error("Error in USSD flow:", error);
    return "END An error occurred. Please try again later.";
  }
}
