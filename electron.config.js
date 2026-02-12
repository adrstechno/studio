// Electron Configuration
require('dotenv').config({ path: '.env.electron' });

module.exports = {
  // URL Configuration
  urls: {
    development: process.env.ELECTRON_DEVELOPMENT_URL || "http://localhost:9002",
    production: process.env.ELECTRON_PRODUCTION_URL || "https://studio-flame-three-95.vercel.app"
  },
  
  // Window Configuration
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },
  
  // App Configuration
  app: {
    name: "NextN",
    version: "0.1.0",
    description: "ADRS Studio Desktop Application"
  },
  
  // Development Settings
  development: {
    openDevTools: true,
    showConsole: true
  }
};