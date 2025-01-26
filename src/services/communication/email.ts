import { AWS_CONFIG } from '../../config/aws';

class EmailService {
  private static instance: EmailService;
  private readonly defaultFrom = 'info@protaxadvisors.tax';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(to: string, subject: string, body: string, options: {
    html?: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
    from?: string;
  } = {}) {
    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: options.from || this.defaultFrom,
          subject,
          body,
          html: options.html,
          attachments: options.attachments
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      return await response.json();
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  async sendTemplate(to: string, templateId: string, templateData: Record<string, any>, options: {
    from?: string;
  } = {}) {
    try {
      const response = await fetch('/.netlify/functions/send-template-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: options.from || this.defaultFrom,
          templateId,
          templateData
        })
      });

      if (!response.ok) throw new Error('Failed to send template email');
      return await response.json();
    } catch (error) {
      console.error('Template email sending error:', error);
      throw error;
    }
  }
}

export const emailService = EmailService.getInstance();