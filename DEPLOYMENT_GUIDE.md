# HELIOS AI - Complete Development & Deployment Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Features Overview](#features-overview)
7. [API Documentation](#api-documentation)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

HELIOS AI is a GenAI-powered solar farm monitoring platform that provides:
- Real-time panel health monitoring
- AI-powered diagnostics using Groq LLaMA 3.3
- Virtual EL imaging from RGB photos
- Thermal analysis (IEC 62446-3 compliant)
- Interactive AI chatbot with panel context
- Email alerts for critical panels
- OTP-based authentication

---

## Prerequisites

### System Requirements
- Node.js 18+ with npm
- Python 3.9+
- Firebase account (for real-time database)
- Groq API key (free tier available)

### Required Accounts
1. **Firebase**: https://console.firebase.google.com
2. **Groq**: https://console.groq.com (for AI features)
3. **Gmail** (optional): For email alerts/OTP

---

## Local Development Setup

### 1. Clone the Repository
```bash
cd /path/to/your/folder
git clone <repo-url>
cd helios-ai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# OR: .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8001" > .env
```

---

## Configuration

### Backend (.env)
```env
# Groq API (Required for AI features)
GROQ_API_KEY=your_groq_api_key

# Firebase (Required)
FIREBASE_CREDENTIALS=./firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Email Service (Optional - for OTP & alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAILS=admin@example.com
```

### Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key (JSON)
3. Save as `backend/firebase-credentials.json`
4. Enable Realtime Database in Firebase Console
5. Set database rules for read/write access

### Gmail App Password (for OTP)
1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate new app password for "Mail"
4. Use this password in SMTP_PASS

---

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## Features Overview

### 1. AI Chatbot
- Accessible via floating button on dashboard
- Full context of all solar panels
- Supports English and Hindi
- Quick action buttons for common queries

**Endpoints:**
- `POST /api/chat` - Send message
- `GET /api/chat/summary` - Get farm summary

### 2. Email Alerts
- Critical panel notifications
- Daily summary reports
- Professional HTML email templates

**Endpoints:**
- `POST /api/alerts/email` - Send critical alert
- `POST /api/alerts/email/daily-summary` - Send daily report
- `GET /api/alerts/email/status` - Check email config

### 3. OTP Authentication
- Email-based OTP login/register
- 6-digit codes, 5-minute expiry
- Demo mode (shows OTP in response if email not configured)

**Endpoints:**
- `POST /api/auth/send-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify and login
- `GET /api/auth/status` - Check auth service

### 4. Panel Diagnostics
- Multi-modal AI analysis
- Virtual EL generation
- Thermal imaging analysis

**Endpoints:**
- `POST /api/demo/analyze-panel/{panel_id}` - Full AI analysis
- `GET /api/demo/virtual-el/{panel_id}` - Virtual EL image
- `GET /api/panels` - List all panels

---

## API Documentation

### Chat API

#### Send Message
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Show me critical panels",
  "conversation_history": []
}
```

#### Response
```json
{
  "response": "Currently there are 3 critical panels...",
  "critical_panels": [...],
  "error": false
}
```

### Authentication API

#### Request OTP
```bash
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "is_registration": false
}
```

#### Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Email Alert API

#### Send Critical Alert
```bash
POST /api/alerts/email
Content-Type: application/json

{
  "panel_id": "SP-001",
  "diagnosis": "Bypass diode failure",
  "power": 245.5,
  "temperature": 72.3,
  "zone": "Zone A",
  "priority": "critical",
  "estimated_cost": 1200,
  "recommended_action": "Replace bypass diode immediately"
}
```

---

## Production Deployment

### Option 1: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Frontend Build
```bash
cd frontend
npm run build
# Deploy dist/ folder to any static hosting (Vercel, Netlify, etc.)
```

### Option 2: Cloud Deployment

#### Backend (Railway/Render)
1. Connect GitHub repository
2. Set root directory: `helios-ai/backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from .env

#### Frontend (Vercel)
1. Connect GitHub repository
2. Framework: Vite
3. Root directory: `helios-ai/frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

### Option 3: VPS Deployment (Ubuntu)

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx nodejs npm

# Setup backend
cd /var/www/helios-ai/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/helios-backend.service
```

```ini
[Unit]
Description=HELIOS AI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/helios-ai/backend
Environment="PATH=/var/www/helios-ai/backend/venv/bin"
ExecStart=/var/www/helios-ai/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable helios-backend
sudo systemctl start helios-backend

# Setup frontend
cd /var/www/helios-ai/frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/helios
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/helios-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/helios /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

#### "Firebase credentials not found"
- Ensure `firebase-credentials.json` exists in backend folder
- Check FIREBASE_CREDENTIALS path in .env

#### "GROQ_API_KEY not set"
- Get API key from https://console.groq.com
- Add to .env file

### Frontend Issues

#### "CORS Error"
- Check backend CORS settings in `main.py`
- Ensure frontend URL is in allowed origins

#### "Connection refused"
- Verify backend is running on correct port
- Check VITE_API_URL in frontend .env

### Email/OTP Issues

#### "Email not sending"
- For Gmail: Use App Password, not regular password
- Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Without email config, demo mode shows OTP in API response

---

## Team

**L&T Techgium 2026 - Team R.C. Patel Institute of Technology**
- Yashodip More
- Tejas Patil
- Jaykumar Girase
- Komal Kumavat

---

## License

This project was developed for the L&T Mission Hackathon 2026.
