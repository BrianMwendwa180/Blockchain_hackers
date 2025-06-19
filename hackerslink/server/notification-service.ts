import { atService } from './at-service';
import { storage } from './storage';
import { Match, Worker, Job } from '@shared/schema';

export class NotificationService {
  /**
   * Send job match notification SMS to a worker
   * 
   * @param matchId The ID of the match to send notification for
   * @returns Object with success status and result/error
   */
  async sendJobMatchSMS(matchId: number): Promise<{ success: boolean, result?: any, error?: any }> {
    try {
      // Get the match with related worker and job details
      const matchDetails = await storage.getMatchWithDetails(matchId);
      
      if (!matchDetails) {
        return { 
          success: false, 
          error: `Match with ID ${matchId} not found or missing related data` 
        };
      }
      
      const { worker, job } = matchDetails;
      
      // Format phone number by ensuring it has the correct format for Africa's Talking API
      // Africa's Talking expects phone numbers in international format: +254XXXXXXXXX or 254XXXXXXXXX
      let phoneNumber = worker.phone.trim();
      
      // Add '+' prefix if it doesn't exist and isn't already there
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }
      
      // Ensure there are no spaces in the phone number
      phoneNumber = phoneNumber.replace(/\s+/g, '');
      
      // Format the SMS message with job details
      const message = this.formatJobMatchSMS(job);
      
      // Send the SMS via Africa's Talking service
      const result = await atService.sendSMS(phoneNumber, message);
      
      // If successful, update the match record to indicate notification was sent
      if (result.success) {
        await this.updateMatchNotificationStatus(matchId);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending job match SMS:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Format SMS message for job match notification
   * 
   * @param job The job data to include in the message
   * @returns Formatted SMS message
   */
  private formatJobMatchSMS(job: Job): string {
    return `Job alert: ${job.skillRequired} needed in ${job.location}. Pay: KSh ${job.dailyRate}/day, Duration: ${job.projectDuration} days. Details: ${job.additionalNotes || 'N/A'}. Call ${job.contactPhone} to apply. By Yaya Labor.`;
  }
  
  /**
   * Update the match record to mark notification as sent
   * 
   * @param matchId The ID of the match to update
   */
  private async updateMatchNotificationStatus(matchId: number): Promise<void> {
    try {
      const match = await storage.getMatchWithDetails(matchId);
      if (match) {
        // Update the match notification status in the database
        await storage.updateMatchNotification(matchId, true);
      }
    } catch (error) {
      console.error('Error updating match notification status:', error);
    }
  }
  
  /**
   * Send multiple job match notifications to workers
   * 
   * @param matchIds Array of match IDs to send notifications for
   * @returns Array of results for each notification attempt
   */
  async sendBulkJobMatchSMS(matchIds: number[]): Promise<Array<{ matchId: number, success: boolean, error?: any }>> {
    const results = [];
    
    for (const matchId of matchIds) {
      const result = await this.sendJobMatchSMS(matchId);
      results.push({
        matchId,
        success: result.success,
        error: result.error
      });
    }
    
    return results;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();