/**
 * Email Controller
 * Handles email synchronization from Mailpit
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/email.service';
import { aiService } from '../services/ai.service';

const prisma = new PrismaClient();

export class EmailController {
  /**
   * Sync emails from Mailpit
   * This is the "magic" endpoint that polls Mailpit API for new vendor responses
   */
  async syncEmails(req: Request, res: Response): Promise<void> {
    try {
      // Fetch messages from Mailpit
      const messages = await emailService.fetchMessages(100);

      if (messages.length === 0) {
        res.json({ message: 'No new messages found', processed: 0 });
        return;
      }

      // Filter messages that are RFP replies
      const rfpReplies = emailService.filterRFPReplies(messages);

      if (rfpReplies.length === 0) {
        res.json({ message: 'No RFP replies found', processed: 0 });
        return;
      }

      // Get all RFP IDs to match
      const allRFPs = await prisma.rFP.findMany({
        select: { id: true },
      });
      const allRFPIds = allRFPs.map(rfp => rfp.id);

      const processedProposals = [];

      // Process each reply
      for (const reply of rfpReplies) {
        try {
          // Match RFP ID
          const rfpId = emailService.extractFullRFPId(allRFPIds, reply.rfpIdSuffix);

          if (!rfpId) {
            console.warn(`Could not match RFP ID for suffix: ${reply.rfpIdSuffix}`);
            continue;
          }

          // Check if this proposal already exists
          const existingProposal = await prisma.proposal.findFirst({
            where: {
              rfpId,
              rawEmailBody: {
                contains: reply.messageId,
              },
            },
          });

          if (existingProposal) {
            console.log(`Proposal already processed for message ${reply.messageId}`);
            continue;
          }

          // Fetch full message content
          const messageDetail = await emailService.fetchMessageDetail(reply.messageId);

          // Find or create vendor
          let vendor = await prisma.vendor.findUnique({
            where: { email: reply.from },
          });

          if (!vendor) {
            // Create vendor on-the-fly
            vendor = await prisma.vendor.create({
              data: {
                name: messageDetail.From.Name || reply.from.split('@')[0],
                email: reply.from,
              },
            });
          }

          // Get RFP details for context
          const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId },
          });

          if (!rfp) {
            console.warn(`RFP not found: ${rfpId}`);
            continue;
          }

          // Use AI to parse the proposal
          const emailBody = messageDetail.Text || messageDetail.HTML;
          const proposalData = await aiService.parseProposal(
            emailBody,
            JSON.stringify(rfp.structuredData)
          );

          // Score the proposal
          const scoring = await aiService.scoreProposal(
            proposalData,
            rfp.structuredData
          );

          // Create proposal in database
          const proposal = await prisma.proposal.create({
            data: {
              rfpId,
              vendorId: vendor.id,
              rawEmailBody: `Message ID: ${reply.messageId}\n\n${emailBody}`,
              aiExtractedData: proposalData as any,
              aiScore: scoring.score,
              aiSummary: scoring.summary,
            },
          });

          processedProposals.push({
            proposalId: proposal.id,
            rfpId,
            vendorName: vendor.name,
            score: scoring.score,
          });
        } catch (error) {
          console.error(`Error processing reply ${reply.messageId}:`, error);
        }
      }

      res.json({
        message: 'Email sync completed',
        totalMessages: messages.length,
        rfpRepliesFound: rfpReplies.length,
        processed: processedProposals.length,
        proposals: processedProposals,
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      res.status(500).json({ error: 'Failed to sync emails', details: String(error) });
    }
  }

  /**
   * Health check for email service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await emailService.healthCheck();
      
      if (isHealthy) {
        res.json({ status: 'healthy', service: 'Mailpit' });
      } else {
        res.status(503).json({ status: 'unhealthy', service: 'Mailpit' });
      }
    } catch (error) {
      res.status(503).json({ status: 'unhealthy', service: 'Mailpit', error: String(error) });
    }
  }
}

export const emailController = new EmailController();
