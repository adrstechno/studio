# 👥 Add Employees Guide

I've created **3 different ways** to add the 13 employees to your database. Choose the one that works best for you:

---

## ✅ Method 1: Using Web Interface (Easiest)

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Open this URL in your browser:**
   ```
   http://localhost:9002/seed-employees.html
   ```

3. **Click the "Add Employees to Database" button**

4. **Done!** You'll see a success message with all added employees.

---

## ✅ Method 2: Using Command Line Script

1. **Run the seed script:**
   ```bash
   npm run seed:employees
   ```

2. **You'll see output like:**
   ```
   🌱 Starting employee seeding...
   ✓ Created employee: Ishant Patel (ishuustuf@gmail.com)
   ✓ Created employee: Sapeksh Vishwakarma (sapekshvishwakarma@gmail.com)
   ...
   ✅ Employee seeding completed!
   ```

---

## ✅ Method 3: Using API Directly (For Testing)

**Using curl:**
```bash
curl -X POST http://localhost:9002/api/employees/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "employees": [
      {
        "name": "Ishant Patel",
        "email": "ishuustuf@gmail.com",
        "role": "Developer"
      }
    ]
  }'
```

**Using Postman or Thunder Client:**
- Method: POST
- URL: `http://localhost:9002/api/employees/bulk`
- Body (JSON):
```json
{
  "employees": [
    {
      "name": "Ishant Patel",
      "email": "ishuustuf@gmail.com",
      "role": "Developer",
      "project": "Unassigned"
    }
  ]
}
```

---

## 📋 Employee List Being Added

| Name | Email | Role |
|------|-------|------|
| Ishant Patel | ishuustuf@gmail.com | Developer |
| Sapeksh Vishwakarma | sapekshvishwakarma@gmail.com | QA |
| Sachin Sen | sachinsen1920@gmail.com | Developer |
| Srajal Vishwakarma | srajalvishwakarma8@gmail.com | Designer |
| Sparsh Sahu | sparshsahu8435@gmail.com | Developer |
| Sakshi Jain | sakshi2408jain@gmail.com | Manager |
| Sneha Koshta | snehakoshta1@gmail.com | Designer |
| Danish Khan | danish.prof21@gmail.com | Developer |
| Ayush Kachhi | ayushkachhi52@gmail.com | Developer |
| Annpurna Sharma | annpurnasha474@gmail.com | Developer |
| Roshan Sachdev | manalks1805@gmail.com | Developer |
| Pragati Mishra | pragatimis2004@gmail.com | QA |
| Aman Mansooree | mansooreeaman@gmail.com | Developer |

---

## 🔍 Verify Employees Were Added

**Option 1: Check in the app**
- Go to: `http://localhost:9002/employees`
- You should see all 13 employees listed

**Option 2: Use Prisma Studio**
```bash
npx prisma studio
```
- Open the `Employee` table
- You'll see all employees

**Option 3: Check via API**
```bash
curl http://localhost:9002/api/employees
```

---

## 🎯 Features

- ✅ **Duplicate Prevention**: Won't add employees that already exist (checks by email)
- ✅ **Auto Avatars**: Generates unique avatar for each employee
- ✅ **Bulk Creation**: Adds all 13 employees at once
- ✅ **Error Handling**: Shows clear error messages if something goes wrong
- ✅ **Success Feedback**: Displays list of added employees

---

## 🐛 Troubleshooting

### Error: "Failed to create employees"
**Solution:** Make sure you've run the database migration:
```bash
npx prisma db push
```

### Error: "Cannot connect to database"
**Solution:** Check your `.env` file has the correct `DATABASE_URL`

### Error: "Employee already exists"
**Solution:** This is normal! The script skips existing employees automatically.

---

## 📝 Files Created

1. **`src/app/api/employees/bulk/route.ts`** - API endpoint for bulk creation
2. **`scripts/seed-employees.ts`** - Command-line seed script
3. **`public/seed-employees.html`** - Web interface for seeding
4. **`ADD_EMPLOYEES_GUIDE.md`** - This guide

---

## 🎉 Recommended Method

**Use Method 1 (Web Interface)** - It's the easiest and gives you visual feedback!

Just open `http://localhost:9002/seed-employees.html` and click the button. Done! ✅

---

**Need help?** All methods are safe and won't create duplicates!
