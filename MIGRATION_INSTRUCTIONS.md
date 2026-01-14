# 🔧 Database Migration Instructions

## ⚠️ IMPORTANT: Follow These Steps Carefully

The error you're seeing is because the database schema hasn't been updated with the new fields we added. Here's how to fix it:

---

## Step 1: Stop the Development Server

**Press `Ctrl + C` in your terminal to stop the dev server.**

This is crucial - the migration won't work while the server is running.

---

## Step 2: Run the Migration

Open a new terminal and run:

```bash
npx prisma migrate dev --name complete_system_enhancements
```

This will:
- Create a new migration file
- Apply the changes to your database
- Generate the Prisma client

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database

Applying migration `20260114_complete_system_enhancements`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260114_complete_system_enhancements/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

---

## Step 3: If Migration Fails

If you get an error about existing data or constraints, you have two options:

### Option A: Reset Database (Recommended for Development)

```bash
npx prisma migrate reset
```

This will:
- Drop all tables
- Run all migrations from scratch
- Seed the database (if you have a seed file)

**⚠️ WARNING: This will delete all existing data!**

### Option B: Manual Migration (For Production)

If you need to keep existing data, you'll need to:

1. Backup your database
2. Manually add the new columns with default values
3. Run the migration

---

## Step 4: Generate Prisma Client

After successful migration, generate the client:

```bash
npx prisma generate
```

---

## Step 5: Restart Development Server

```bash
npm run dev
```

---

## 🔍 What Changed in the Database?

### New Tables:
1. **project_documents** - For storing project files and docs
2. **project_daily_logs** - For developer daily updates
3. **task_assignments** - For multiple employee task assignments

### New Columns in Existing Tables:

**projects table:**
- `techStack` (String, nullable)
- `githubRepo` (String, nullable)
- `projectType` (Enum: Company/EmployeeSpecific)
- `assignedTo` (String, nullable)

**tasks table:**
- `taskType` (Enum: Daily/ProjectBased)

**leave_requests table:**
- `leaveType` (Enum: Casual/Sick/Earned/etc.)
- `leaveDuration` (Enum: FullDay/HalfDay/etc.)

### New Enums:
- ProjectType
- DocumentType
- TaskType
- LeaveType
- LeaveDuration

---

## 🐛 Troubleshooting

### Error: "Column already exists"

This means some columns were partially added. Solution:

```bash
npx prisma migrate reset
npx prisma generate
```

### Error: "Cannot connect to database"

Check your `.env` file has the correct `DATABASE_URL`.

### Error: "Prisma Client not generated"

Run:
```bash
npx prisma generate
```

### Error: "Migration failed"

1. Check if dev server is stopped
2. Check database connection
3. Try reset option

---

## ✅ Verification

After migration, verify it worked:

```bash
npx prisma studio
```

This opens Prisma Studio where you can see:
- All tables including new ones
- New columns in existing tables
- All enums

---

## 📝 Alternative: SQL Migration Script

If automated migration doesn't work, here's the SQL to run manually:

```sql
-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN "techStack" TEXT;
ALTER TABLE projects ADD COLUMN "githubRepo" TEXT;
ALTER TABLE projects ADD COLUMN "projectType" TEXT DEFAULT 'Company';
ALTER TABLE projects ADD COLUMN "assignedTo" TEXT;

-- Add new column to tasks table
ALTER TABLE tasks ADD COLUMN "taskType" TEXT DEFAULT 'ProjectBased';

-- Update leave_requests table
ALTER TABLE leave_requests ADD COLUMN "leaveType" TEXT DEFAULT 'Casual';
ALTER TABLE leave_requests ADD COLUMN "leaveDuration" TEXT DEFAULT 'FullDay';

-- Create new tables
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT DEFAULT 'General',
    "content" TEXT,
    "fileUrl" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE TABLE "project_daily_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "hoursWorked" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE TABLE "task_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
    UNIQUE("taskId", "employeeId")
);
```

---

## 🎯 Quick Fix (If Nothing Else Works)

1. Stop dev server
2. Delete `node_modules/.prisma` folder
3. Run:
```bash
npx prisma generate
npx prisma db push
```

This will force-sync your schema to the database.

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ No more "column does not exist" errors
- ✅ `/api/projects` returns 200 status
- ✅ Projects page loads without errors
- ✅ All features work correctly

---

**Need Help?** If you're still stuck, share the exact error message and I'll help you fix it!
