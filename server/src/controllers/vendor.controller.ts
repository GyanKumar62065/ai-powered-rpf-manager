/**
 * Vendor Controller
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VendorController {
  /**
   * Create a new vendor
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, tags } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required' });
        return;
      }

      const vendor = await prisma.vendor.create({
        data: {
          name,
          email,
          tags: tags || null,
        },
      });

      res.status(201).json(vendor);
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create vendor' });
      }
    }
  }

  /**
   * Get all vendors
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const vendors = await prisma.vendor.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  }

  /**
   * Get vendor by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              rfp: true,
            },
          },
        },
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      res.json(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  }

  /**
   * Update vendor
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, tags } = req.body;

      const vendor = await prisma.vendor.update({
        where: { id },
        data: {
          name,
          email,
          tags,
        },
      });

      res.json(vendor);
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Vendor not found' });
      } else {
        res.status(500).json({ error: 'Failed to update vendor' });
      }
    }
  }

  /**
   * Delete vendor
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.vendor.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Vendor not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete vendor' });
      }
    }
  }
}

export const vendorController = new VendorController();
