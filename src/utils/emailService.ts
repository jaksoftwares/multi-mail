// Email service for sending emails and tracking responses
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailResponse {
  id: string;
  emailId: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  responseType: 'reply' | 'bounce' | 'delivery_failure';
}

// Simulated email sending service
export class EmailService {
  private static instance: EmailService;
  private responses: EmailResponse[] = [];

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(
    to: string[],
    subject: string,
    content: string,
    settings: any
  ): Promise<EmailSendResult> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Validate SMTP settings
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      return {
        success: false,
        error: 'SMTP settings not configured. Please check your settings.'
      };
    }

    // Simulate success/failure rates (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate some responses coming back (20% response rate)
      setTimeout(() => {
        this.simulateResponses(messageId, to, subject);
      }, 5000 + Math.random() * 10000);

      return {
        success: true,
        messageId
      };
    } else {
      return {
        success: false,
        error: 'Failed to send email. Please check your SMTP configuration.'
      };
    }
  }

  private simulateResponses(emailId: string, recipients: string[], originalSubject: string) {
    // Simulate responses from some recipients
    recipients.forEach(recipient => {
      if (Math.random() < 0.2) { // 20% response rate
        const responseTypes = ['reply', 'bounce', 'delivery_failure'] as const;
        const responseType = responseTypes[Math.floor(Math.random() * responseTypes.length)];
        
        let content = '';
        let subject = '';
        
        switch (responseType) {
          case 'reply':
            subject = `Re: ${originalSubject}`;
            content = this.generateReplyContent();
            break;
          case 'bounce':
            subject = `Delivery Status Notification (Failure)`;
            content = `The email could not be delivered to ${recipient}. The mailbox may be full or the address may not exist.`;
            break;
          case 'delivery_failure':
            subject = `Mail Delivery Failed`;
            content = `Your message to ${recipient} could not be delivered due to a temporary server error. Please try again later.`;
            break;
        }

        const response: EmailResponse = {
          id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          emailId,
          sender: recipient,
          subject,
          content,
          timestamp: new Date().toISOString(),
          isRead: false,
          responseType
        };

        this.responses.push(response);
        
        // Trigger a custom event to notify the app of new responses
        window.dispatchEvent(new CustomEvent('newEmailResponse', { detail: response }));
      }
    });
  }

  private generateReplyContent(): string {
    const replies = [
      "Thank you for reaching out. I'm interested in learning more about your solutions. Could we schedule a call next week?",
      "This looks interesting, but I'm not the right person for this. You should contact our IT director instead.",
      "We're currently evaluating similar solutions. Could you send me more detailed pricing information?",
      "Thanks for the email. We're not looking for new solutions at this time, but I'll keep your information on file.",
      "I'd like to discuss this further. What's the best time to reach you for a quick call?",
      "Could you provide some case studies of companies similar to ours that you've worked with?",
      "We're interested but need to understand the implementation timeline better. Can you provide more details?",
      "This seems like it could be a good fit. What's the next step in your process?",
      "I'm currently out of office but will review this when I return next week.",
      "Please remove me from your mailing list. I'm no longer with this company."
    ];
    
    return replies[Math.floor(Math.random() * replies.length)];
  }

  getResponses(): EmailResponse[] {
    return [...this.responses];
  }

  markResponseAsRead(responseId: string) {
    const response = this.responses.find(r => r.id === responseId);
    if (response) {
      response.isRead = true;
    }
  }

  clearResponses() {
    this.responses = [];
  }
}

// Email template variable replacement
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  
  return result;
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Batch email sending
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  content: string,
  settings: any,
  batchSize: number = 50,
  delayBetweenBatches: number = 5000
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const emailService = EmailService.getInstance();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Split recipients into batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    try {
      const result = await emailService.sendEmail(batch, subject, content, settings);
      if (result.success) {
        sent += batch.length;
      } else {
        failed += batch.length;
        errors.push(result.error || 'Unknown error');
      }
    } catch (error) {
      failed += batch.length;
      errors.push(`Batch error: ${error}`);
    }

    // Delay between batches (except for the last batch)
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return { sent, failed, errors };
}