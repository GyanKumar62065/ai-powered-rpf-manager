# AI-Powered RFP Management System

A single-user, local-first AI-powered RFP (Request for Proposal) management system built with open-source technologies.

## 🚀 Tech Stack

### Frontend
- **React** (Vite) - Fast, modern development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Beautiful, accessible components
- **Lucide React** - Icon library

### Backend
- **Node.js** with **TypeScript**
- **Express** - Web framework
- **Prisma ORM** - Type-safe database access
- **MySQL 5.7+/8.0** - Relational database

### AI & Email (Local)
- **Ollama** - Local AI engine (port 11434)
- **Mailpit** - SMTP testing (ports 1025/8025)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **MySQL** (v5.7 or 8.0)
   ```bash
   mysql --version
   ```

3. **Ollama** (for AI features)
   ```bash
   # Install Ollama (macOS)
   brew install ollama
   # Or
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Pull model (recommended, smaller)
   ollama pull llama3.2:1b
   # Or full model
   ollama pull llama3.2
   ```

4. **Mailpit** (for email simulation)
   ```bash
   # macOS with Homebrew
   brew install mailpit
   
   # Or download from: https://github.com/axllent/mailpit/releases
   ```

## 🛠️ Setup Instructions (Quick)

For a detailed, step-by-step guide see **SETUP_GUIDE.md**. For a short version see **QUICKSTART.md**.

### Quick Start (Copy-Paste)

You can get from zero to running with this single block:

```bash
# 1) Clone & enter project
git clone <your-repo-url> RPF_MANAGEMENT
cd RPF_MANAGEMENT

# 2) Install Node deps (root + client + server)
npm run install:all

# 3) Install Ollama & Mailpit (macOS, optional helper)
chmod +x scripts/install-services.sh
./scripts/install-services.sh
ollama pull llama3.2:1b   # or: ollama pull llama3.2

# 4) Setup MySQL DB & user
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh

# 5) Configure env
cp server/.env.example server/.env

# 6) Initialize Prisma schema
cd server
npm run prisma:generate
npm run prisma:push
cd ..

# 7) Start AI + Mailpit services
chmod +x scripts/start-services.sh
./scripts/start-services.sh

# 8) Run the app
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Mailpit:  http://localhost:8025
```

---

### 1. Navigate to Project
```bash
cd /path/to/RPF_MANAGEMENT
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Database

Recommended: use the helper script:
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

This will create:
- Database: `rfp_management`
- User: `rfp_user` / `rfp_password`

### 4. Configure Environment

Create `server/.env` from the example:
```bash
cp server/.env.example server/.env
```

The defaults are ready for local development:
```env
DATABASE_URL="mysql://rfp_user:rfp_password@localhost:3306/rfp_management"
PORT=3000
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_API_URL=http://localhost:8025
EMAIL_FROM=rfp-system@localhost
EMAIL_FROM_NAME=RFP Management System

# Optional: send real emails via Gmail
USE_REAL_SMTP=false
REAL_SMTP_HOST=smtp.gmail.com
REAL_SMTP_PORT=587
REAL_SMTP_USER=your-email@gmail.com
REAL_SMTP_PASS=your-app-password-here
```

If you enable `USE_REAL_SMTP=true`, configure a **Gmail App Password** for `REAL_SMTP_PASS`.

### 5. Initialize Database (Prisma)
```bash
cd server
npm run prisma:generate
npm run prisma:push
cd ..
```

### 6. Start Services (Ollama & Mailpit)

Use the helper script from project root:
```bash
chmod +x scripts/start-services.sh
./scripts/start-services.sh
```

This starts:
- Ollama on `http://localhost:11434`
- Mailpit on `http://localhost:8025` (UI) and `localhost:1025` (SMTP)

### 7. Start the App
```bash
npm run dev
```

You now have:
- Frontend at **http://localhost:5173**
- Backend API at **http://localhost:3000**
- Mailpit UI at **http://localhost:8025**

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Mailpit UI**: http://localhost:8025
- **Ollama API**: http://localhost:11434

---

## 👤 Who Is This For?

- **OS**: Optimized for macOS with Homebrew
- **Skill level**: Comfortable with basic terminal commands
- **Database**: Local MySQL running on the same machine
- **AI**: Local-only via Ollama, no cloud AI providers

For Windows/Linux, the concepts are the same but install commands differ.

## ✅ Known Good Versions

These versions are known to work well with this project:

- **Node.js**: 18.x or 20.x
- **MySQL**: 8.0.x
- **Ollama**: 0.13.x
- **Mailpit**: 1.28.x or newer 1.x

Other versions may work, but if you hit issues, try matching these.

## 📧 Email Modes

The app supports two modes for outbound email:

| Mode        | USE_REAL_SMTP | Where emails go             | Recommended for        |
|------------|----------------|-----------------------------|------------------------|
| Local-only | false          | Mailpit UI (localhost:8025) | Development / demos    |
| Gmail live | true           | Real inboxes                | Personal testing only  |

- For quickest setup, keep `USE_REAL_SMTP=false` and use **Mailpit** only.
- If you turn on `USE_REAL_SMTP=true`, configure a **Gmail App Password**.

## 🧪 First Run Smoke Test

After `npm run dev` is running and services are up:

1. **Open the app**: visit `http://localhost:5173`
2. **Add a vendor**:
   - Go to **Vendors** → *Add Vendor*
   - Use your own email address (or a test one)
3. **Create an RFP**:
   - Go to **RFPs** → *Create RFP*
   - Example content:
     ```
     Need 2 laptops for $3000, delivery in 2 weeks.
     ```
4. **Send to vendor**:
   - Click into the new RFP card
   - Select your vendor
   - Click **Send to Vendors**
5. **Verify email**:
   - If using Mailpit: open `http://localhost:8025` and confirm the email appears
   - If using Gmail mode: check the recipient inbox
6. **Simulate reply & sync (Mailpit mode)**:
   - In Mailpit, open the email and click **Reply**
   - Write a simple proposal (price, delivery, terms) and send
   - In the app, go to **Proposals** → click **Sync Emails**
   - You should see at least one parsed proposal row

If this flow works, your end-to-end setup (DB + AI + email) is healthy.

## 📁 Project Structure

```
rfp-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── lib/           # Utilities
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   └── types/         # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
└── package.json           # Root package
```

## 🔄 Key Workflows

### 1. Creating an RFP
- User enters requirements in natural language
- AI (Ollama) parses and structures the data
- RFP is saved with JSON structured data

### 2. Sending RFP to Vendors
- System sends email via Mailpit SMTP
- Each email contains unique RFP reference ID
- Emails appear in Mailpit inbox

### 3. Receiving Proposals
- Backend polls Mailpit API for new messages
- Matches emails by RFP reference in subject
- AI extracts and scores proposal data
- Stores structured proposal in database

### 4. Comparing Proposals
- AI compares multiple proposals
- Generates ranked summary
- Displays side-by-side comparison

## 🧪 Testing Email Flow

1. Create an RFP via the UI
2. Send it to test vendors
3. Open Mailpit UI: http://localhost:8025
4. Reply to the RFP email (keeping subject line)
5. Click "Sync Emails" in the app
6. View parsed proposals

## 📝 API Endpoints

- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - List vendors
- `POST /api/rfps` - Create RFP
- `GET /api/rfps` - List RFPs
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `POST /api/emails/sync` - Sync emails from Mailpit
- `GET /api/proposals` - List proposals
- `GET /api/proposals/compare/:rfpId` - Compare proposals

## 🤝 Contributing

This is a demonstration project showcasing local-first AI architecture.

## 📄 License

MIT License
