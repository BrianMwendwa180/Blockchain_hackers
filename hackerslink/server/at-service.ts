import AfricasTalking from 'africastalking';

// Initialize Africa's Talking SDK with API credentials
const username = process.env.AFRICAS_TALKING_USERNAME || '';
const apiKey = process.env.AFRICAS_TALKING_API_KEY || '';

if (!username || !apiKey) {
  console.warn('Africa\'s Talking credentials not found. SMS functionality will be limited.');
}

// Initialize the SDK
const africasTalking = AfricasTalking({
  username,
  apiKey,
});

// Get SMS service
const sms = africasTalking.SMS;

// Service to handle Africa's Talking related operations
export class ATService {
  // Send SMS to a phone number
  async sendSMS(to: string, message: string): Promise<any> {
    try {
      console.log(`Sending SMS to ${to}: ${message}`);
      
      if (!username || !apiKey) {
        console.warn('Africa\'s Talking credentials not configured. SMS not sent.');
        return { success: false, error: 'Credentials not configured' };
      }
      
      const result = await sms.send({
        to,
        message,
        // Optional parameters:
        // from: 'your-shortcode-or-sender-id',
      });
      
      console.log('SMS sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error };
    }
  }
  
  // Make an outbound call
  async makeCall(to: string, clientDialedNumber: string): Promise<any> {
    try {
      const voice = africasTalking.VOICE;
      
      const result = await voice.call({
        callFrom: clientDialedNumber,
        callTo: [to]
      });
      
      console.log('Call initiated:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Error making call:', error);
      return { success: false, error };
    }
  }
}

// Export a singleton instance of the service
export const atService = new ATService();