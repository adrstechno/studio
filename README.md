# ADRS Studio - Employee Management System

A comprehensive employee management system built with Next.js, Prisma, and PostgreSQL. Available as both a web application and desktop app.

## 🚀 Quick Start

### Web Application
```bash
npm install
npm run dev
```

### Desktop Application (.exe)
```bash
npm run electron:build
```

See [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md) for detailed desktop app setup.

## 📱 Deployment Options

### 1. Web App (Vercel)
- Deployed at: https://studio-flame-three-95.vercel.app
- Auto-deploys on GitHub push
- Accessible from any browser

### 2. Desktop App (Electron)
- Windows .exe installer
- Connects to Vercel deployment
- Native desktop experience
- Auto-updates when you deploy to Vercel

## 🎯 Features

- Employee Management
- Project Tracking
- Task Management
- Leave Management
- Attendance Tracking
- Intern Management
- Bulk Messaging & Notifications
- Real-time Updates

## 📚 Documentation

- [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md) - Quick guide to build desktop app
- [ELECTRON-DEPLOYMENT.md](ELECTRON-DEPLOYMENT.md) - Detailed Electron documentation
- [ELECTRON.md](ELECTRON.md) - Electron setup guide

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Desktop**: Electron
- **Deployment**: Vercel

## 💡 Desktop App Benefits

✅ **No Rebuilding** - Update Vercel, all desktop users get changes
✅ **Instant Updates** - Changes available immediately
✅ **Centralized Data** - All users share same database
✅ **Native Experience** - Desktop menus and shortcuts

# Logo Management

## ADRS Logo

![ADRS Light Logo](/images/adrs-logo-light.svg)
![ADRS Dark Logo](/images/adrs-logo-dark.svg)

## About ADRS

ADRS is dedicated to providing exceptional services and solutions tailored to meet the needs of our clients. Our commitment to excellence drives us to innovate and deliver the best results possible.

---

### Managed by GitHub Copilot

This project is assisted by GitHub Copilot, an AI-powered coding assistant that helps streamline development processes and improve code quality.
