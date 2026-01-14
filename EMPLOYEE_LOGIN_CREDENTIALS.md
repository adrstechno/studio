# 🔐 Employee Login Credentials

## 📋 Default Login Information

Since your system uses **Firebase Authentication**, employees need to be registered in Firebase to log in.

### 🎯 **Default Password for All Employees:**
```
password
```

### 📧 **Login IDs (Email Addresses):**

| Name | Email (Login ID) | Password | Role |
|------|------------------|----------|------|
| Ishant Patel | ishuustuf@gmail.com | password | Developer |
| Sapeksh Vishwakarma | sapekshvishwakarma@gmail.com | password | QA |
| Sachin Sen | sachinsen1920@gmail.com | password | Developer |
| Srajal Vishwakarma | srajalvishwakarma8@gmail.com | password | Designer |
| Sparsh Sahu | sparshsahu8435@gmail.com | password | Developer |
| Sakshi Jain | sakshi2408jain@gmail.com | password | Manager |
| Sneha Koshta | snehakoshta1@gmail.com | password | Designer |
| Danish Khan | danish.prof21@gmail.com | password | Developer |
| Ayush Kachhi | ayushkachhi52@gmail.com | password | Developer |
| Annpurna Sharma | annpurnasha474@gmail.com | password | Developer |
| Roshan Sachdev | manalks1805@gmail.com | password | Developer |
| Pragati Mishra | pragatimis2004@gmail.com | password | QA |
| Aman Mansooree | mansooreeaman@gmail.com | password | Developer |

---

## ⚠️ IMPORTANT: Firebase Setup Required

The employees you added to the database **cannot log in yet** because they need to be registered in Firebase Authentication.

### 🔧 **Option 1: Manual Registration (Recommended for Testing)**

Each employee needs to:
1. Go to: `http://localhost:9002/login`
2. Click "Sign Up" or "Create Account"
3. Register with their email and a password
4. Then they can log in

### 🔧 **Option 2: Bulk Create in Firebase (Automated)**

I can create a script to automatically register all employees in Firebase. Would you like me to create this?

---

## 🎯 **Quick Test Login**

To test the system, use the existing admin account:

**Admin Login:**
- Email: `admin@company.com`
- Password: `password`

Or use any of the existing test accounts from `src/lib/data.ts`:

**Existing Test Accounts:**
- sachin@company.com / password (Developer)
- sparsh@company.com / password (Developer)
- danish@company.com / password (Developer)
- srajal@company.com / password (Designer)
- sneha@company.com / password (Designer)
- sakshi@company.com / password (Manager)
- sapeksh@company.com / password (QA)
- ishant@company.com / password (QA)

---

## 🔐 **How Your Authentication Works**

Your system uses **Firebase Authentication** which means:

1. **Database (Prisma)** - Stores employee data (name, role, projects, etc.)
2. **Firebase Auth** - Handles login/passwords separately

**Both need to be set up for employees to log in!**

---

## 🚀 **Solution: Create Firebase Accounts**

Let me create a tool to automatically register all employees in Firebase.

### Would you like me to create:

1. **Automated Firebase Registration Script** - Registers all 13 employees in Firebase with default password
2. **Manual Registration Page** - A page where you can register employees one by one
3. **Bulk Import Tool** - Upload CSV and create both database + Firebase accounts

---

## 💡 **Temporary Solution**

For now, you can:

1. **Use existing test accounts** to test the system
2. **Manually register** new employees through the signup page
3. **Wait for automated script** (I can create this for you)

---

## 📝 **What Happens When Employee Logs In?**

1. Firebase checks email/password
2. If valid, Firebase returns user token
3. System looks up employee in database by email
4. Loads employee data (role, projects, etc.)
5. Redirects to appropriate dashboard

---

## ⚡ **Quick Fix: Let Me Create Firebase Registration Script**

I can create a script that will:
- ✅ Register all 13 employees in Firebase
- ✅ Set default password: "password"
- ✅ Link to database records
- ✅ Send welcome emails (optional)

**Should I create this for you?** 🚀

---

## 🔍 **Check Current Firebase Users**

To see who's already registered in Firebase:
1. Go to Firebase Console
2. Navigate to Authentication
3. Check Users tab

---

**For now, use the existing test accounts to test the system!**
