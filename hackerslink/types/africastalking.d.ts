declare module 'africastalking' {
  export interface SMSOptions {
    to: string | string[];
    message: string;
    from?: string;
    enqueue?: boolean;
  }

  export interface CallOptions {
    callFrom: string;
    callTo: string[];
  }

  export interface AfricasTalkingOptions {
    username: string;
    apiKey: string;
    format?: 'json' | 'xml';
  }

  export interface SMS {
    send(options: SMSOptions): Promise<any>;
    sendBulk(options: SMSOptions): Promise<any>;
    sendPremium(options: SMSOptions & { keyword?: string; linkId?: string; retryDurationInHours?: number }): Promise<any>;
    fetchMessages(options?: { lastReceivedId?: string }): Promise<any>;
    createSubscription(options: { shortCode: string; keyword: string; phoneNumber: string }): Promise<any>;
    fetchSubscription(options: { shortCode: string; keyword: string }): Promise<any>;
    deleteSubscription(options: { shortCode: string; keyword: string; phoneNumber: string }): Promise<any>;
  }

  export interface VOICE {
    call(options: CallOptions): Promise<any>;
    getNumQueuedCalls(options: { phoneNumbers: string[] }): Promise<any>;
    uploadMediaFile(options: { phoneNumber: string; url: string }): Promise<any>;
  }

  export interface USSD {
    sendRequest(options: { sessionId: string; serviceCode: string; phoneNumber: string; text: string }): Promise<any>;
  }

  export interface AfricasTalking {
    SMS: SMS;
    VOICE: VOICE;
    USSD?: USSD;
    PAYMENT?: any;
    AIRTIME?: any;
    TOKEN?: any;
    APPLICATION?: any;
  }

  function AfricasTalking(options: AfricasTalkingOptions): AfricasTalking;
  export default AfricasTalking;
}