/**
 * API Routes
 */

import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller';
import { rfpController } from '../controllers/rfp.controller';
import { proposalController } from '../controllers/proposal.controller';
import { emailController } from '../controllers/email.controller';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vendor routes
router.post('/vendors', (req, res) => vendorController.create(req, res));
router.get('/vendors', (req, res) => vendorController.getAll(req, res));
router.get('/vendors/:id', (req, res) => vendorController.getById(req, res));
router.put('/vendors/:id', (req, res) => vendorController.update(req, res));
router.delete('/vendors/:id', (req, res) => vendorController.delete(req, res));

// RFP routes
router.post('/rfps', (req, res) => rfpController.create(req, res));
router.get('/rfps', (req, res) => rfpController.getAll(req, res));
router.get('/rfps/:id', (req, res) => rfpController.getById(req, res));
router.post('/rfps/:id/send', (req, res) => rfpController.send(req, res));
router.patch('/rfps/:id/status', (req, res) => rfpController.updateStatus(req, res));
router.delete('/rfps/:id', (req, res) => rfpController.delete(req, res));

// Proposal routes
router.get('/proposals', (req, res) => proposalController.getAll(req, res));
router.get('/proposals/:id', (req, res) => proposalController.getById(req, res));
router.get('/proposals/compare/:rfpId', (req, res) => proposalController.compare(req, res));
router.delete('/proposals/:id', (req, res) => proposalController.delete(req, res));

// Email routes
router.post('/emails/sync', (req, res) => emailController.syncEmails(req, res));
router.get('/emails/health', (req, res) => emailController.healthCheck(req, res));

export default router;
