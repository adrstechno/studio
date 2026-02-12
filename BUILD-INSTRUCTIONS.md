# Quick Build Instructions for Desktop App

## ✅ Your Setup is Complete!

Your Electron app is now configured to automatically connect to your Vercel deployment:
- **Production URL**: `https://studio-flame-three-95.vercel.app`
- **Configuration**: `.env.electron` and `electron.config.js`

## 🚀 Build the .exe (One-Time Setup)

### Step 1: Build the Desktop App

```bash
npm run electron:build
```

This will create:
- `dist/ADRS Studio Setup 0.1.0.exe` - Installer for users
- `dist/win-unpacked/ADRS Studio.exe` - Portable version

### Step 2: Distribute to Users

Share the installer with your team:
- Email the `ADRS Studio Setup 0.1.0.exe` file
- Or place it on a shared network drive
- Users run the installer once

### Step 3: That's It! 🎉

From now on:
1. Make changes to your code
2. Deploy to Vercel (push to GitHub)
3. Users just **refresh** the desktop app (Ctrl+R) or restart it
4. **No need to rebuild or redistribute the .exe!**

## 📝 How It Works

```
┌─────────────────┐
│  Desktop App    │
│    (.exe)       │
└────────┬────────┘
         │
         │ Loads URL
         ▼
┌─────────────────┐
│  Vercel Deploy  │
│  (Web App)      │
└─────────────────┘
```

The .exe is just a desktop wrapper that loads your Vercel URL. When you update Vercel, the desktop app automatically shows the new version!

## 🔄 Making Updates

### For Code/Feature Changes:
1. Update your code
2. Push to GitHub (auto-deploys to Vercel)
3. Tell users to refresh (Ctrl+R) or restart the app
4. ✅ Done! No .exe rebuild needed

### For Configuration Changes:
Only rebuild the .exe if you change:
- The Vercel URL (`.env.electron`)
- Window size or app settings (`electron.config.js`)
- App icon (`assets/icon.ico`)
- Desktop-specific features

## 🎯 User Instructions

Send this to your users:

---

**Installing ADRS Studio Desktop App:**

1. Download `ADRS Studio Setup 0.1.0.exe`
2. Run the installer
3. Launch "ADRS Studio" from your Start Menu

**Getting Updates:**
- When we release updates, just press `Ctrl+R` in the app or restart it
- No need to reinstall!

**Keyboard Shortcuts:**
- `Ctrl+R` - Refresh to get latest updates
- `F11` - Fullscreen mode
- `Ctrl+Q` - Quit app

---

## 🔧 Troubleshooting

### Build Fails with Icon Error
The icon was removed from the build config. The app will use the default Electron icon.

To add a custom icon later:
1. Create a valid `.ico` file (256x256 or 512x512)
2. Place it in `assets/icon.ico`
3. Update `package.json` build config to include the icon

### App Shows Blank Screen
- Check internet connection
- Verify Vercel URL is accessible: https://studio-flame-three-95.vercel.app
- Try Ctrl+Shift+R (force refresh)

### Changes Not Showing
- Press Ctrl+Shift+R (force reload with cache clear)
- Or restart the app

## 📊 Advantages

✅ **No Rebuilding** - Update once on Vercel, all users get it
✅ **Instant Updates** - Changes available immediately after Vercel deploy
✅ **Centralized** - All users connect to same database
✅ **Easy Distribution** - Distribute .exe once, updates happen automatically
✅ **Native Feel** - Desktop app with native menus and shortcuts

## 🎨 Customization

### Change Production URL

Edit `.env.electron`:
```env
ELECTRON_PRODUCTION_URL=https://your-new-url.com
```

Then rebuild: `npm run electron:build`

### Change App Name

Edit `package.json`:
```json
"build": {
  "productName": "Your App Name"
}
```

### Change Window Size

Edit `electron.config.js`:
```javascript
window: {
  width: 1400,
  height: 900
}
```

## 📚 More Information

See `ELECTRON-DEPLOYMENT.md` for detailed documentation.

## ✨ Summary

Your desktop app is ready! Build it once with `npm run electron:build`, distribute to users, and from then on just deploy to Vercel for updates. No more rebuilding or redistributing! 🚀
