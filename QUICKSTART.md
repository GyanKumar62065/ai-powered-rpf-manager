# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check
```bash
# Run this first
./scripts/check-services.sh
```

## Installation (One Command)

```bash
# Install all dependencies
npm run install:all
```

## Database Setup (One Command)

```bash
# Automated setup
./scripts/setup-database.sh
```

Or manual:
```sql
CREATE DATABASE rfp_management;
CREATE USER 'rfp_user'@'localhost' IDENTIFIED BY 'rfp_password';
GRANT ALL PRIVILEGES ON rfp_management.* TO 'rfp_user'@'localhost';
FLUSH PRIVILEGES;
```

## Configure Environment

```bash
# Copy example env file
cp server/.env.example server/.env
```

The default `.env` should work as-is:
```env
DATABASE_URL="mysql://rfp_user:rfp_password@localhost:3306/rfp_management"
PORT=5000
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_API_URL=http://localhost:8025
```

## Initialize Database

```bash
cd server
npm run prisma:generate
npm run prisma:push
cd ..
```

## Start Everything

### Option 1: Manual (3 terminals)

**Terminal 1:**
```bash
ollama serve
```

**Terminal 2:**
```bash
mailpit
```

**Terminal 3:**
```bash
npm run dev
```

### Option 2: Automated

```bash
# Start services
./scripts/start-services.sh

# In another terminal, start the app
npm run dev
```

## Access

- **App**: http://localhost:5173
- **API**: http://localhost:5000/api/health
- **Mailpit**: http://localhost:8025

## Test the Flow

1. **Add Vendor**: Go to Vendors → Add vendor with email
2. **Create RFP**: Go to RFPs → Create → Enter: "Need 10 laptops for $10k, delivery in 2 weeks"
3. **Send RFP**: Open RFP → Select vendor → Send
4. **Check Email**: Open http://localhost:8025 → See the email
5. **Reply**: Reply to email in Mailpit (keep subject line)
6. **Sync**: Go to Proposals → Sync Emails → See AI-parsed proposal

## Troubleshooting

### "Cannot connect to database"
```bash
mysql -u rfp_user -prfp_password rfp_management
# If fails, run: ./scripts/setup-database.sh
```

### "Ollama not responding"
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart
killall ollama
ollama serve

# Pull model if needed
ollama pull llama3.2
```

### "Port already in use"
```bash
# Find and kill process
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
kill -9 <PID>
```

## Next Steps

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed documentation.
