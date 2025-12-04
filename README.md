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
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Pull the model
   ollama pull llama3.2:1b
   ```

4. **Mailpit** (for email simulation)
   ```bash
   # macOS with Homebrew
   brew install mailpit
   
   # Or download from: https://github.com/axllent/mailpit/releases
   ```

## 🛠️ Setup Instructions

### 1. Clone/Navigate to Project
```bash
cd /Users/gyankumar/Personal/RPF_MANAGEMENT
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Database
Create a MySQL database:
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE rfp_management;
CREATE USER 'rfp_user'@'localhost' IDENTIFIED BY 'rfp_password';
GRANT ALL PRIVILEGES ON rfp_management.* TO 'rfp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configure Environment
Create `server/.env` file:
```env
DATABASE_URL="mysql://rfp_user:rfp_password@localhost:3306/rfp_management"
PORT=5000
OLLAMA_API_URL=http://localhost:11434
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_API_URL=http://localhost:8025
```

### 5. Initialize Database
```bash
npm run setup:db
```

### 6. Start Services

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
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Mailpit UI**: http://localhost:8025
- **Ollama API**: http://localhost:11434

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
