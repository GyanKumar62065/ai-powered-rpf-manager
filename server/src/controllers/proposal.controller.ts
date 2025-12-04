/**
 * Proposal Controller
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/ai.service';

const prisma = new PrismaClient();

export class ProposalController {
  /**
   * Get all proposals
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { rfpId } = req.query;

      const where = rfpId ? { rfpId: String(rfpId) } : {};

      const proposals = await prisma.proposal.findMany({
        where,
        include: {
          vendor: true,
          rfp: true,
        },
        orderBy: {
          aiScore: 'desc',
        },
      });

      res.json(proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  }

  /**
   * Get proposal by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          vendor: true,
          rfp: true,
        },
      });

      if (!proposal) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }

      res.json(proposal);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({ error: 'Failed to fetch proposal' });
    }
  }

  /**
   * Compare proposals for an RFP using AI
   */
  async compare(req: Request, res: Response): Promise<void> {
    try {
      const { rfpId } = req.params;

      // Get RFP
      const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
      });

      if (!rfp) {
        res.status(404).json({ error: 'RFP not found' });
        return;
      }

      // Get all proposals for this RFP
      const proposals = await prisma.proposal.findMany({
        where: { rfpId },
        include: {
          vendor: true,
        },
      });

      if (proposals.length === 0) {
        res.status(404).json({ error: 'No proposals found for this RFP' });
        return;
      }

      // Prepare data for AI comparison
      const proposalData = proposals.map(p => ({
        vendorName: p.vendor.name,
        proposalData: p.aiExtractedData,
      }));

      // Use AI to compare proposals
      const comparison = await aiService.compareProposals(rfp.title, proposalData);

      res.json({
        rfp: {
          id: rfp.id,
          title: rfp.title,
        },
        proposalCount: proposals.length,
        comparison,
      });
    } catch (error) {
      console.error('Error comparing proposals:', error);
      res.status(500).json({ error: 'Failed to compare proposals', details: String(error) });
    }
  }

  /**
   * Delete proposal
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.proposal.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Proposal not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete proposal' });
      }
    }
  }
}

export const proposalController = new ProposalController();
