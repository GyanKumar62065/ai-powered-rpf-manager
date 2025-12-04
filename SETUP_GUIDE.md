# Setup Guide - RFP Management System

Complete step-by-step guide to set up and run the AI-Powered RFP Management System.

## Prerequisites

### 1. Node.js (v18+)
```bash
node --version
npm --version

# Install if needed (macOS)
brew install node
```

### 2. MySQL (5.7+ or 8.0)
```bash
mysql --version

# Install if needed (macOS)
brew install mysql
brew services start mysql
```

### 3. Ollama (Local AI)
```bash
# Install Ollama (one-time)
brew install ollama

# Or
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (recommended: smaller, faster)
ollama pull llama3.2:1b

# Or full model
ollama pull llama3.2
```

### 4. Mailpit (Email Testing)
```bash
# macOS
brew install mailpit

# Or download from
# https://github.com/axllent/mailpit/releases
```

---

### Optional: Install Ollama & Mailpit via Script (macOS)

If you are on macOS with Homebrew, you can automatically install **Ollama** and **Mailpit** using the helper script from the project root:

```bash
chmod +x scripts/install-services.sh
./scripts/install-services.sh
```

This will:
- Ensure Homebrew is installed
- Install **Ollama**
- Install **Mailpit**

You still need to **pull the Ollama model** separately:

```bash
ollama pull llama3.2:1b   # or llama3.2
```

---

## Installation Steps (Do These In Order)

### Step 1: Install Dependencies
From the project root:
```bash
npm run install:all
```

This installs dependencies for:
- root workspace
- client (React app)
- server (API + Prisma)

### Step 2: Set Up Database (MySQL)

Use the automated script (recommended):
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

The script will:
- Create `rfp_management` database
- Create `rfp_user` with password `rfp_password`
- Grant privileges and print the connection string

If you prefer manual setup, run:
```bash
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
cp server/.env.example server/.env
```

The default `.env` is already configured for local development:
```env
DATABASE_URL="mysql://rfp_user:rfp_password@localhost:3306/rfp_management"

PORT=3000
NODE_ENV=development

OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b

MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_API_URL=http://localhost:8025

EMAIL_FROM=rfp-system@localhost
EMAIL_FROM_NAME=RFP Management System

# Real SMTP (optional, for sending to real Gmail addresses)
USE_REAL_SMTP=false
REAL_SMTP_HOST=smtp.gmail.com
REAL_SMTP_PORT=587
REAL_SMTP_USER=your-email@gmail.com
REAL_SMTP_PASS=your-app-password-here
```

If you want **real Gmail emails**, set:
```env
USE_REAL_SMTP=true
REAL_SMTP_USER=your-email@gmail.com
REAL_SMTP_PASS=your-16-char-app-password
```

> Use a Gmail **App Password**, not your normal password.

### Step 4: Initialize Database Schema
```bash
cd server
npm run prisma:generate
npm run prisma:push
cd ..
```

### Step 5: Start Services (Ollama & Mailpit)

Recommended: use the helper script from project root:
```bash
chmod +x scripts/start-services.sh
./scripts/start-services.sh
```

This will:
- Start **Ollama** on port `11434`
- Start **Mailpit** on ports `1025` (SMTP) and `8025` (Web UI)

### Step 6: Start the Application

From the project root:
```bash
npm run dev
```

This starts:
- Backend API on **http://localhost:3000**
- Frontend (Vite) on **http://localhost:5173**

## Verify Installation

Run the health check script:
```bash
chmod +x scripts/check-services.sh
./scripts/check-services.sh
```

You should see all services marked with ✓.

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Mailpit UI**: http://localhost:8025
- **API Health**: http://localhost:3000/api/health

---

## Who Is This Guide For?

- **OS**: macOS with Homebrew (commands assume this)
- **Skill level**: Comfortable with terminal and basic Node.js tooling
- **Database**: Local MySQL on the same machine
- **AI**: Local-only via Ollama (no external AI APIs)

For Windows or Linux, adapt the install commands for Node, MySQL, Ollama, and Mailpit.

## Known Good Versions

This guide has been tested with:

- **Node.js**: 18.x / 20.x
- **MySQL**: 8.0.x
- **Ollama**: 0.13.x
- **Mailpit**: 1.28.x (or later 1.x)

If you see strange behavior, first check that your versions are in this range.

## Email Modes

Email delivery can work in two modes controlled by `USE_REAL_SMTP` in `server/.env`:

| Mode        | USE_REAL_SMTP | Where emails go             | Recommended for        |
|------------|----------------|-----------------------------|------------------------|
| Local-only | false          | Mailpit UI (localhost:8025) | Development / demos    |
| Gmail live | true           | Real inboxes                | Personal testing only  |

- For easiest setup, leave `USE_REAL_SMTP=false` and only use Mailpit.
- If you set `USE_REAL_SMTP=true`, configure `REAL_SMTP_USER` and **Gmail App Password** in `REAL_SMTP_PASS`.

## First Run Smoke Test

After completing all installation steps and running `npm run dev`:

1. **Open the app**: `http://localhost:5173`
2. **Add a vendor**:
   - Go to **Vendors** → *Add Vendor*
   - Use an email you can access (or a test address)
3. **Create a simple RFP**:
   - Go to **RFPs** → *Create RFP*
   - Example:
     ```
     Need 2 laptops for $3000, delivery in 2 weeks.
     ```
4. **Send to vendor**:
   - Open the RFP detail page
   - Select the vendor
   - Click **Send to Vendors**
5. **Check email**:
   - Mailpit mode: open `http://localhost:8025` and confirm the email is present
   - Gmail mode: check the recipient inbox
6. **(Mailpit mode) Simulate reply and sync**:
   - In Mailpit, open the email and click **Reply**
   - Write a short proposal including price, delivery, and terms
   - Back in the app, go to **Proposals** → click **Sync Emails**
   - Confirm at least one proposal appears with AI-parsed details

If this end-to-end flow works, your environment (database, AI, and email) is set up correctly.

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
ollama pull llama3.2:1b   # or llama3.2
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
lsof -i :3000    # Backend
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
