# 🔥 Create Firebase Accounts - Complete Guide

## ✅ What This Does

Automatically creates Firebase Authentication accounts for all 13 employees so they can log in to the system.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open the Tool
```
http://localhost:9002/create-firebase-accounts.html
```

### Step 3: Choose Option and Click Button

**Option 1:** Use original emails (ishuustuf@gmail.com, etc.)
**Option 2:** Use company emails (ishant@adrs.com, etc.)

Click **"Create Firebase Accounts"** and wait!

---

## 📋 What Happens

The tool will:
1. ✅ Create Firebase Authentication account for each employee
2. ✅ Set default password: `password`
3. ✅ Set display name to employee's full name
4. ✅ Show progress bar
5. ✅ Display results (success/failed/already exists)

---

## 🎯 Email Format Options

### Option 1: Original Emails
Uses the actual employee emails from database:
- ishuustuf@gmail.com
- sapekshvishwakarma@gmail.com
- sachinsen1920@gmail.com
- etc.

**Use this if:** Employees will use their personal emails to log in

### Option 2: Company Emails (@adrs.com)
Creates company email format:
- ishant@adrs.com
- sapeksh@adrs.com
- sachin@adrs.com
- etc.

**Use this if:** You want company-managed email accounts

---

## 📊 Expected Results

After running, you'll see:

```
✅ Successfully created: 13
⚠️ Already exists: 0
❌ Failed: 0
Total: 13
```

Each employee will show:
- ✅ Name and role
- ✅ Email created
- ✅ Password: password

---

## 🔐 Login Credentials After Creation

### If you chose Option 1 (Original Emails):

| Name | Email | Password |
|------|-------|----------|
| Ishant Patel | ishuustuf@gmail.com | password |
| Sapeksh Vishwakarma | sapekshvishwakarma@gmail.com | password |
| Sachin Sen | sachinsen1920@gmail.com | password |
| Srajal Vishwakarma | srajalvishwakarma8@gmail.com | password |
| Sparsh Sahu | sparshsahu8435@gmail.com | password |
| Sakshi Jain | sakshi2408jain@gmail.com | password |
| Sneha Koshta | snehakoshta1@gmail.com | password |
| Danish Khan | danish.prof21@gmail.com | password |
| Ayush Kachhi | ayushkachhi52@gmail.com | password |
| Annpurna Sharma | annpurnasha474@gmail.com | password |
| Roshan Sachdev | manalks1805@gmail.com | password |
| Pragati Mishra | pragatimis2004@gmail.com | password |
| Aman Mansooree | mansooreeaman@gmail.com | password |

### If you chose Option 2 (Company Emails):

| Name | Email | Password |
|------|-------|----------|
| Ishant Patel | ishant@adrs.com | password |
| Sapeksh Vishwakarma | sapeksh@adrs.com | password |
| Sachin Sen | sachin@adrs.com | password |
| Srajal Vishwakarma | srajal@adrs.com | password |
| Sparsh Sahu | sparsh@adrs.com | password |
| Sakshi Jain | sakshi@adrs.com | password |
| Sneha Koshta | sneha@adrs.com | password |
| Danish Khan | danish@adrs.com | password |
| Ayush Kachhi | ayush@adrs.com | password |
| Annpurna Sharma | annpurna@adrs.com | password |
| Roshan Sachdev | roshan@adrs.com | password |
| Pragati Mishra | pragati@adrs.com | password |
| Aman Mansooree | aman@adrs.com | password |

---

## ✅ Verify Accounts Were Created

### Method 1: Try Logging In
1. Go to: `http://localhost:9002/login`
2. Try logging in with any employee email and password: `password`
3. Should work! ✅

### Method 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `studio-1745974288-26e6a`
3. Go to **Authentication** → **Users**
4. You should see all 13 employees listed

---

## 🐛 Troubleshooting

### Error: "Email already in use"
**Solution:** Account already exists! This is fine. The tool will mark it as "Already exists" and continue.

### Error: "Firebase initialization failed"
**Solution:** Make sure dev server is running and you're accessing via `localhost:9002`

### Error: "Too many requests"
**Solution:** The tool adds a 500ms delay between each account. Just wait and it will complete.

### Some accounts failed
**Solution:** Check the error message. Common issues:
- Invalid email format
- Firebase quota exceeded (wait a bit and try again)
- Network issues

---

## 🎯 After Creation

### Share Credentials with Employees

**Send them this:**
```
Hi [Employee Name],

Your account has been created!

Login Page: http://localhost:9002/login
Email: [their email]
Password: password

Please log in and change your password.

Welcome to the team!
```

### Or Share the Credentials Page

Send them: `http://localhost:9002/register-employees.html`

This page shows all credentials in a nice format.

---

## 🔒 Security Notes

- Default password is `password` - employees should change it after first login
- In production, use stronger default passwords
- Consider enabling email verification
- Enable 2FA for sensitive accounts

---

## 📝 What Gets Created

For each employee:
1. **Firebase Authentication Account**
   - Email
   - Password (hashed)
   - Display Name
   - UID (unique identifier)

2. **Database Record** (already exists)
   - Name
   - Email
   - Role
   - Projects
   - etc.

Both are now linked by email!

---

## ✨ Next Steps

1. ✅ Create Firebase accounts (this tool)
2. ✅ Share credentials with employees
3. ✅ Employees log in and change password
4. ✅ Start using the system!

---

## 🎉 Summary

**Before:** Employees in database, can't log in ❌
**After:** Employees can log in with email/password ✅

**Tool URL:** `http://localhost:9002/create-firebase-accounts.html`

**Just open it, choose an option, and click the button!** 🚀

---

**This is the easiest way to set up all employee accounts at once!**
