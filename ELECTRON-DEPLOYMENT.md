# Electron Desktop App - Deployment Guide

## Overview

Your Electron desktop app (.exe) is configured to connect to your deployed Vercel URL. This means:

✅ **No rebuilding needed** - Any changes you make to your Vercel deployment are automatically available in the .exe
✅ **Automatic updates** - Users get the latest features without reinstalling
✅ **Centralized backend** - All users connect to the same database and backend
✅ **Easy maintenance** - Update once on Vercel, all desktop apps get the changes

## How It Works

The Electron app acts as a **desktop browser wrapper** that loads your Vercel-deployed web app. When you:

1. Make changes to your code
2. Deploy to Vercel
3. Users simply **refresh** the desktop app (View → Reload) or restart it

The changes are immediately available!

## Configuration

### Production URL

The production URL is configured in `.env.electron`:

```env
ELECTRON_PRODUCTION_URL=https://studio-flame-three-95.vercel.app
```

### Updating the Production URL

If you deploy to a new Vercel URL or custom domain:

1. Update `.env.electron`:
   ```env
   ELECTRON_PRODUCTION_URL=https://your-new-url.vercel.app
   ```

2. Rebuild the .exe:
   ```bash
   npm run electron:build
   ```

3. Distribute the new .exe to users

## Building the Desktop App

### Prerequisites

Make sure you have a valid icon file (or the build will use default):
- Windows: `assets/icon.ico` (256x256 or 512x512 recommended)
- macOS: `assets/icon.icns`
- Linux: `assets/icon.png`

### Build Commands

```bash
# Build for Windows (creates .exe installer)
npm run electron:build

# Build for specific platform
npm run electron:dist -- --win
npm run electron:dist -- --mac
npm run electron:dist -- --linux

# Build without installer (portable)
npm run electron:pack
```

### Output

Built files will be in the `dist/` folder:
- Windows: `dist/ADRS Studio Setup 0.1.0.exe` (installer)
- Windows: `dist/win-unpacked/` (portable version)

## Development vs Production

### Development Mode
```bash
npm run electron:dev
```
- Connects to `http://localhost:9002`
- Opens DevTools automatically
- Hot reload enabled

### Production Mode (.exe)
- Connects to your Vercel URL
- No DevTools by default
- Optimized for end users

## User Instructions

### For End Users

1. **Install**: Run the `ADRS Studio Setup.exe`
2. **Launch**: Open "ADRS Studio" from Start Menu or Desktop
3. **Update**: When you make changes:
   - Option 1: Click View → Reload (or press Ctrl+R)
   - Option 2: Restart the app
   - No reinstallation needed!

### Keyboard Shortcuts

- `Ctrl+R` - Reload the app (get latest changes)
- `Ctrl+Shift+R` - Force reload (clear cache)
- `F11` - Toggle fullscreen
- `Ctrl+Q` - Quit app
- `F12` - Toggle DevTools (for debugging)

## Advantages of This Approach

### 1. **Instant Updates**
- Deploy to Vercel → Changes available immediately
- No need to rebuild or redistribute .exe files
- Users always have the latest version

### 2. **Centralized Data**
- All users connect to the same database
- Real-time synchronization
- No data migration issues

### 3. **Easy Maintenance**
- Fix bugs once on Vercel
- All desktop users get the fix
- No version fragmentation

### 4. **Reduced Distribution**
- Only distribute .exe once
- Updates happen through Vercel
- Smaller download sizes for users

## Troubleshooting

### App Shows Blank Screen

**Cause**: Vercel URL is not accessible or incorrect

**Solution**:
1. Check `.env.electron` has correct URL
2. Verify Vercel deployment is live
3. Check internet connection
4. Try View → Force Reload

### Changes Not Showing

**Cause**: Browser cache

**Solution**:
1. Press `Ctrl+Shift+R` (force reload)
2. Or restart the app
3. Clear cache: View → Toggle DevTools → Application → Clear Storage

### Connection Errors

**Cause**: Network or CORS issues

**Solution**:
1. Check internet connection
2. Verify Vercel deployment is accessible in browser
3. Check Vercel logs for errors
4. Ensure CORS is configured correctly

## Advanced Configuration

### Custom Domain

If you have a custom domain:

1. Update `.env.electron`:
   ```env
   ELECTRON_PRODUCTION_URL=https://yourdomain.com
   ```

2. Rebuild and distribute

### Multiple Environments

You can create different builds for different environments:

```javascript
// electron.config.js
urls: {
  development: "http://localhost:9002",
  staging: "https://staging.yourdomain.com",
  production: "https://yourdomain.com"
}
```

### Auto-Update (Optional)

For automatic .exe updates, you can integrate:
- [electron-updater](https://www.electron.build/auto-update)
- Checks for new .exe versions
- Downloads and installs automatically

## Security Considerations

✅ **HTTPS Required**: Always use HTTPS for production URL
✅ **Authentication**: Implement proper login/auth on Vercel
✅ **API Security**: Secure your API endpoints
✅ **Content Security**: Configure CSP headers on Vercel

## Distribution

### For Internal Use (Your Team)

1. Build the .exe: `npm run electron:build`
2. Share via:
   - Network drive
   - Email
   - Cloud storage (Google Drive, Dropbox)
   - Internal file server

### For External Users

1. Build the .exe
2. Distribute via:
   - Company website
   - Direct download link
   - USB drives
   - Software distribution platforms

## Summary

Your Electron app is now configured as a **smart desktop wrapper** that:
- Loads your Vercel-deployed web app
- Provides native desktop experience
- Updates automatically when you deploy to Vercel
- Requires no rebuilding for content/feature updates

**Remember**: Only rebuild the .exe when you need to change:
- The Vercel URL
- Electron configuration (window size, menu, etc.)
- Desktop-specific features
- App icon or branding

For everything else, just deploy to Vercel and users get the updates automatically! 🚀
