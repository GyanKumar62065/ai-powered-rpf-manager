/**
 * RFP Controller
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/ai.service';
import { emailService } from '../services/email.service';

const prisma = new PrismaClient();

export class RFPController {
  /**
   * Create a new RFP with AI parsing
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { content, title } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      // Use AI to parse the RFP content
      const structuredData = await aiService.parseRFP(content);

      const rfp = await prisma.rFP.create({
        data: {
          title: title || structuredData.title,
          content,
          structuredData: structuredData as any,
          status: 'DRAFT',
        },
      });

      res.status(201).json(rfp);
    } catch (error) {
      console.error('Error creating RFP:', error);
      res.status(500).json({ error: 'Failed to create RFP', details: String(error) });
    }
  }

  /**
   * Get all RFPs
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const rfps = await prisma.rFP.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          proposals: {
            include: {
              vendor: true,
            },
          },
        },
      });

      res.json(rfps);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      res.status(500).json({ error: 'Failed to fetch RFPs' });
    }
  }

  /**
   * Get RFP by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              vendor: true,
            },
          },
        },
      });

      if (!rfp) {
        res.status(404).json({ error: 'RFP not found' });
        return;
      }

      res.json(rfp);
    } catch (error) {
      console.error('Error fetching RFP:', error);
      res.status(500).json({ error: 'Failed to fetch RFP' });
    }
  }

  /**
   * Send RFP to vendors
   */
  async send(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { vendorIds } = req.body;

      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        res.status(400).json({ error: 'vendorIds array is required' });
        return;
      }

      // Get RFP
      const rfp = await prisma.rFP.findUnique({
        where: { id },
      });

      if (!rfp) {
        res.status(404).json({ error: 'RFP not found' });
        return;
      }

      // Get vendors
      const vendors = await prisma.vendor.findMany({
        where: {
          id: {
            in: vendorIds,
          },
        },
      });

      if (vendors.length === 0) {
        res.status(404).json({ error: 'No vendors found' });
        return;
      }

      // Send emails to all vendors
      const results = await Promise.allSettled(
        vendors.map(vendor =>
          emailService.sendRFPEmail(
            rfp.id,
            vendor.email,
            vendor.name,
            rfp.title,
            rfp.content,
            rfp.structuredData as any
          )
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      // Update RFP status to SENT
      await prisma.rFP.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      res.json({
        message: 'RFP sent to vendors',
        total: vendors.length,
        success: successCount,
        failed: failureCount,
      });
    } catch (error) {
      console.error('Error sending RFP:', error);
      res.status(500).json({ error: 'Failed to send RFP', details: String(error) });
    }
  }

  /**
   * Update RFP status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['DRAFT', 'SENT', 'CLOSED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const rfp = await prisma.rFP.update({
        where: { id },
        data: { status },
      });

      res.json(rfp);
    } catch (error: any) {
      console.error('Error updating RFP status:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'RFP not found' });
      } else {
        res.status(500).json({ error: 'Failed to update RFP status' });
      }
    }
  }

  /**
   * Delete RFP
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.rFP.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting RFP:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'RFP not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete RFP' });
      }
    }
  }
}

export const rfpController = new RFPController();
