/**
 * Server Entry Point
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { aiService } from './services/ai.service';
import { emailService } from './services/email.service';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'RFP Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      vendors: '/api/vendors',
      rfps: '/api/rfps',
      proposals: '/api/proposals',
      emailSync: '/api/emails/sync',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with health checks
async function startServer() {
  try {
    console.log('Starting RFP Management System...\n');

    // Check Ollama
    console.log('Checking Ollama connection...');
    const ollamaHealthy = await aiService.healthCheck();
    if (ollamaHealthy) {
      console.log('✓ Ollama is running');
    } else {
      console.warn('⚠ Warning: Ollama is not accessible. AI features may not work.');
      console.warn('  Start Ollama with: ollama serve');
    }

    // Check Mailpit
    console.log('Checking Mailpit connection...');
    const mailpitHealthy = await emailService.healthCheck();
    if (mailpitHealthy) {
      console.log('✓ Mailpit is running');
    } else {
      console.warn('⚠ Warning: Mailpit is not accessible. Email features may not work.');
      console.warn('  Start Mailpit with: mailpit');
    }

    console.log('');

    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('API Endpoints:');
      console.log(`  • Health: http://localhost:${PORT}/api/health`);
      console.log(`  • Vendors: http://localhost:${PORT}/api/vendors`);
      console.log(`  • RFPs: http://localhost:${PORT}/api/rfps`);
      console.log(`  • Proposals: http://localhost:${PORT}/api/proposals`);
      console.log(`  • Email Sync: http://localhost:${PORT}/api/emails/sync`);
      console.log('');
      console.log('External Services:');
      console.log(`  • Ollama: ${process.env.OLLAMA_API_URL || 'http://localhost:11434'}`);
      console.log(`  • Mailpit UI: ${process.env.MAILPIT_API_URL || 'http://localhost:8025'}`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
