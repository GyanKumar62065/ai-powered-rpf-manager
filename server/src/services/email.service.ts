/**
 * Email Service - Mailpit Integration
 * 
 * Handles sending emails via Mailpit SMTP and fetching emails via Mailpit API
 */

import nodemailer, { Transporter } from 'nodemailer';
import axios from 'axios';

interface MailpitMessage {
  ID: string;
  From: { Address: string; Name: string };
  To: Array<{ Address: string; Name: string }>;
  Subject: string;
  Date: string;
  Size: number;
  Snippet: string;
}

interface MailpitMessageDetail extends MailpitMessage {
  Text: string;
  HTML: string;
}

interface MailpitAPIResponse {
  total: number;
  messages: MailpitMessage[];
}

export class EmailService {
  private transporter: Transporter;
  private mailpitApiUrl: string;
  private fromEmail: string;
  private fromName: string;
  private useRealSMTP: boolean;

  constructor() {
    this.useRealSMTP = process.env.USE_REAL_SMTP === 'true';
    
    if (this.useRealSMTP) {
      // Configure Nodemailer for Real SMTP (Gmail)
      console.log('📧 Using Real SMTP for email delivery');
      this.transporter = nodemailer.createTransport({
        host: process.env.REAL_SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.REAL_SMTP_PORT || '587'),
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.REAL_SMTP_USER,
          pass: process.env.REAL_SMTP_PASS,
        },
      });
      this.fromEmail = process.env.REAL_SMTP_USER || process.env.EMAIL_FROM || 'rfp-system@localhost';
    } else {
      // Configure Nodemailer for Mailpit SMTP (Testing)
      console.log('📧 Using Mailpit for email testing');
      this.transporter = nodemailer.createTransport({
        host: process.env.MAILPIT_SMTP_HOST || 'localhost',
        port: parseInt(process.env.MAILPIT_SMTP_PORT || '1025'),
        secure: false, // No TLS for local Mailpit
        // No authentication required for Mailpit
      });
      this.fromEmail = process.env.EMAIL_FROM || 'rfp-system@localhost';
    }

    this.mailpitApiUrl = process.env.MAILPIT_API_URL || 'http://localhost:8025';
    this.fromName = process.env.EMAIL_FROM_NAME || 'RFP Management System';
  }

  /**
   * Send RFP email to a vendor
   */
  async sendRFPEmail(
    rfpId: string,
    vendorEmail: string,
    vendorName: string,
    rfpTitle: string,
    rfpContent: string,
    structuredData: any
  ): Promise<boolean> {
    try {
      const subject = `RFP Request - Ref: RFP-#${rfpId.slice(-8)}`;
      
      // Create email body
      const emailBody = this.generateRFPEmailBody(
        rfpId,
        vendorName,
        rfpTitle,
        rfpContent,
        structuredData
      );

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: `"${vendorName}" <${vendorEmail}>`,
        subject: subject,
        text: emailBody.text,
        html: emailBody.html,
      });

      console.log(`RFP email sent to ${vendorEmail} for RFP ${rfpId}`);
      return true;
    } catch (error) {
      console.error('Error sending RFP email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Generate RFP email body (text and HTML)
   */
  private generateRFPEmailBody(
    rfpId: string,
    vendorName: string,
    rfpTitle: string,
    rfpContent: string,
    structuredData: any
  ): { text: string; html: string } {
    const rfpRef = `RFP-#${rfpId.slice(-8)}`;
    
    const text = `
Dear ${vendorName},

We are pleased to invite you to submit a proposal for the following requirement:

${rfpTitle}

REFERENCE: ${rfpRef}
(Please keep this reference in your reply subject line)

REQUIREMENTS:
${rfpContent}

${structuredData.items ? '\nITEMS REQUESTED:\n' + structuredData.items.map((item: any) => 
  `- ${item.name} (Quantity: ${item.quantity})${item.specifications ? ' - ' + item.specifications : ''}`
).join('\n') : ''}

${structuredData.budget ? `\nBUDGET: ${structuredData.currency || 'USD'} ${structuredData.budget.toLocaleString()}` : ''}
${structuredData.timeline ? `TIMELINE: ${structuredData.timeline}` : ''}

Please submit your proposal by replying to this email. Make sure to include:
- Detailed pricing breakdown
- Delivery timeline
- Payment terms
- Any additional terms and conditions

We look forward to your proposal.

Best regards,
RFP Management System
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #4F46E5; color: white; padding: 20px; }
    .content { padding: 20px; }
    .reference { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 15px 0; }
    .items { background-color: #F3F4F6; padding: 15px; margin: 15px 0; }
    .footer { background-color: #F9FAFB; padding: 15px; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Request for Proposal</h1>
  </div>
  <div class="content">
    <p>Dear ${vendorName},</p>
    <p>We are pleased to invite you to submit a proposal for the following requirement:</p>
    
    <h2>${rfpTitle}</h2>
    
    <div class="reference">
      <strong>REFERENCE: ${rfpRef}</strong><br>
      <em>(Please keep this reference in your reply subject line)</em>
    </div>
    
    <h3>Requirements:</h3>
    <p>${rfpContent.replace(/\n/g, '<br>')}</p>
    
    ${structuredData.items ? `
    <div class="items">
      <h3>Items Requested:</h3>
      <ul>
        ${structuredData.items.map((item: any) => 
          `<li><strong>${item.name}</strong> - Quantity: ${item.quantity}${item.specifications ? '<br><em>' + item.specifications + '</em>' : ''}</li>`
        ).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${structuredData.budget ? `<p><strong>Budget:</strong> ${structuredData.currency || 'USD'} ${structuredData.budget.toLocaleString()}</p>` : ''}
    ${structuredData.timeline ? `<p><strong>Timeline:</strong> ${structuredData.timeline}</p>` : ''}
    
    <h3>Please include in your proposal:</h3>
    <ul>
      <li>Detailed pricing breakdown</li>
      <li>Delivery timeline</li>
      <li>Payment terms</li>
      <li>Any additional terms and conditions</li>
    </ul>
    
    <p>We look forward to your proposal.</p>
    <p>Best regards,<br><strong>RFP Management System</strong></p>
  </div>
  <div class="footer">
    This is an automated message from the RFP Management System.
  </div>
</body>
</html>
    `.trim();

    return { text, html };
  }

  /**
   * Fetch all messages from Mailpit API
   */
  async fetchMessages(limit: number = 50): Promise<MailpitMessage[]> {
    try {
      const response = await axios.get<MailpitAPIResponse>(
        `${this.mailpitApiUrl}/api/v1/messages`,
        {
          params: {
            limit,
          },
        }
      );

      return response.data.messages || [];
    } catch (error) {
      console.error('Error fetching Mailpit messages:', error);
      throw new Error(`Failed to fetch emails from Mailpit: ${error}`);
    }
  }

  /**
   * Fetch single message detail from Mailpit
   */
  async fetchMessageDetail(messageId: string): Promise<MailpitMessageDetail> {
    try {
      const response = await axios.get<MailpitMessageDetail>(
        `${this.mailpitApiUrl}/api/v1/message/${messageId}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      throw new Error(`Failed to fetch message detail: ${error}`);
    }
  }

  /**
   * Extract RFP ID from email subject line
   * Looks for pattern: "RFP-#XXXXXXXX"
   */
  extractRFPIdFromSubject(subject: string): string | null {
    const match = subject.match(/RFP-#([a-f0-9]{8})/i);
    if (match) {
      // Return the last 8 characters of the RFP ID
      return match[1];
    }
    return null;
  }

  /**
   * Find RFP ID by matching the extracted ID suffix
   */
  extractFullRFPId(allRFPIds: string[], extractedSuffix: string): string | null {
    const rfpId = allRFPIds.find(id => id.slice(-8).toLowerCase() === extractedSuffix.toLowerCase());
    return rfpId || null;
  }

  /**
   * Filter messages that are replies to RFPs
   * Returns array of { messageId, rfpIdSuffix, subject, from }
   */
  filterRFPReplies(
    messages: MailpitMessage[]
  ): Array<{ messageId: string; rfpIdSuffix: string; subject: string; from: string; date: string }> {
    const replies: Array<{ messageId: string; rfpIdSuffix: string; subject: string; from: string; date: string }> = [];

    for (const message of messages) {
      const rfpIdSuffix = this.extractRFPIdFromSubject(message.Subject);
      if (rfpIdSuffix) {
        replies.push({
          messageId: message.ID,
          rfpIdSuffix,
          subject: message.Subject,
          from: message.From.Address,
          date: message.Date,
        });
      }
    }

    return replies;
  }

  /**
   * Health check for Mailpit service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.mailpitApiUrl}/api/v1/messages?limit=1`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Mailpit health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
