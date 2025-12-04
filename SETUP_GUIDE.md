# Setup Guide - RFP Management System

Complete step-by-step guide to set up and run the AI-Powered RFP Management System.

## Prerequisites

### 1. Node.js (v18+)
```bash
# Check if installed
node --version
npm --version

# Install if needed (macOS)
brew install node
```

### 2. MySQL (5.7+ or 8.0)
```bash
# Check if installed
mysql --version

# Install if needed (macOS)
brew install mysql
brew services start mysql
```

### 3. Ollama (Local AI)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Or on macOS
brew install ollama

# Pull the model
ollama pull llama3.2
```

### 4. Mailpit (Email Testing)
```bash
# macOS
brew install mailpit

# Or download from
# https://github.com/axllent/mailpit/releases
```

## Installation Steps

### Step 1: Install Dependencies
```bash
# From project root
cd root/RPF_MANAGEMENT

# Install all dependencies
npm run install:all
```

### Step 2: Set Up Database
```bash
# Option A: Use automated script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh

# Option B: Manual setup
mysql -u root -p
```

If using manual setup, run these SQL commands:
```sql
CREATE DATABASE rfp_management;
CREATE USER 'rfp_user'@'localhost' IDENTIFIED BY 'rfp_password';
GRANT ALL PRIVILEGES ON rfp_management.* TO 'rfp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Configure Environment
```bash
# Create server environment file
cp server/.env.example server/.env
```

Edit `server/.env` with your database credentials:
```env
DATABASE_URL="mysql://rfp_user:rfp_password@localhost:3306/rfp_management"
PORT=5000
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_API_URL=http://localhost:8025
EMAIL_FROM=rfp-system@localhost
EMAIL_FROM_NAME=RFP Management System
```

### Step 4: Initialize Database Schema
```bash
cd server
npm run prisma:generate
npm run prisma:push
cd ..
```

### Step 5: Start Services

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - Mailpit:**
```bash
mailpit
```

**Terminal 3 - Application:**
```bash
# From project root
npm run dev
```

Or use the automated script:
```bash
chmod +x scripts/start-services.sh
./scripts/start-services.sh
# Then in a new terminal:
npm run dev
```

## Verify Installation

Run the health check script:
```bash
chmod +x scripts/check-services.sh
./scripts/check-services.sh
```

You should see all services marked with ✓.

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Mailpit UI**: http://localhost:8025
- **API Documentation**: http://localhost:5000/api/health

## Testing the Workflow

### 1. Add a Vendor
- Navigate to "Vendors" in the UI
- Click "Add Vendor"
- Enter vendor details (name, email, tags)
- Save

### 2. Create an RFP
- Navigate to "RFPs"
- Click "Create RFP"
- Enter requirements in natural language, e.g.:
  ```
  I need 50 high-performance laptops with the following specs:
  - 16GB RAM minimum
  - 512GB SSD storage
  - Intel i7 or equivalent
  - Budget: $50,000
  - Timeline: Need delivery within 2 weeks
  ```
- AI will parse and structure the data automatically
- Save the RFP

### 3. Send RFP to Vendors
- Open the RFP detail page
- Select vendors to send to
- Click "Send to Vendors"
- Check Mailpit UI (http://localhost:8025) to see the sent emails

### 4. Simulate Vendor Response
- Open Mailpit UI
- Find the RFP email
- Click "Reply"
- Write a proposal (keeping the subject line with RFP reference)
- Example reply:
  ```
  Subject: Re: RFP Request - Ref: RFP-#12345678

  Dear Client,

  Thank you for your RFP. We can provide 50 laptops meeting your specifications:

  Price: $48,000 ($960 per unit)
  Specifications:
  - Dell Latitude 5540
  - 16GB DDR4 RAM
  - 512GB NVMe SSD
  - Intel Core i7-1365U
  
  Delivery Timeline: 10 business days
  Payment Terms: Net 30
  Warranty: 3 years on-site
  
  We look forward to working with you.

  Best regards,
  Vendor Team
  ```
- Send the reply

### 5. Sync and View Proposals
- Go back to the application
- Navigate to "Proposals"
- Click "Sync Emails"
- The AI will automatically:
  - Extract the proposal data
  - Score the proposal
  - Generate a summary
- View the parsed proposal with AI scoring

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
mysql -u rfp_user -prfp_password rfp_management

# If fails, recreate user
mysql -u root -p
DROP USER 'rfp_user'@'localhost';
# Then run setup-database.sh again
```

### Ollama Not Responding
```bash
# Restart Ollama
killall ollama
ollama serve

# Verify model is downloaded
ollama list
ollama pull llama3.2
```

### Mailpit Issues
```bash
# Restart Mailpit
killall mailpit
mailpit

# Check if running
curl http://localhost:8025
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000    # Backend
lsof -i :5173    # Frontend
lsof -i :11434   # Ollama
lsof -i :8025    # Mailpit UI
lsof -i :1025    # Mailpit SMTP

# Kill process if needed
kill -9 <PID>
```

### Prisma Issues
```bash
cd server

# Reset and regenerate
npm run prisma:generate
npm run prisma:push

# View database in Prisma Studio
npm run prisma:studio
```

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend (Vite): Changes reflect immediately
- Backend (tsx watch): Server restarts on file changes

### Database Management
```bash
# View database
cd server
npm run prisma:studio
# Opens at http://localhost:5555
```

### API Testing
Use curl or tools like Postman:
```bash
# Health check
curl http://localhost:5000/api/health

# Get vendors
curl http://localhost:5000/api/vendors

# Create RFP
curl -X POST http://localhost:5000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{"content": "Need 10 laptops for $10k"}'
```

### Logs
- Backend logs appear in the terminal running `npm run dev:server`
- Check Ollama logs if AI responses fail
- Check Mailpit UI for email delivery status

## Production Considerations

This is a development/demo setup. For production:
1. Use environment-specific `.env` files
2. Secure MySQL with strong passwords
3. Use a production-grade LLM API or self-hosted model
4. Replace Mailpit with real SMTP service
5. Add authentication and authorization
6. Implement rate limiting
7. Add comprehensive error handling
8. Set up proper logging and monitoring

## Support

For issues or questions:
1. Check the main README.md
2. Review troubleshooting section above
3. Check service logs for detailed error messages

## Quick Commands Reference

```bash
# Start everything
./scripts/start-services.sh
npm run dev

# Check service status
./scripts/check-services.sh

# Database setup
./scripts/setup-database.sh

# Install dependencies
npm run install:all

# Build for production
npm run build

# Database operations
cd server
npm run prisma:generate     # Generate Prisma client
npm run prisma:push        # Push schema to database
npm run prisma:studio      # Open database GUI
```
