# PowerShell script to push commits one by one
Write-Host "Starting commit process..." -ForegroundColor Green

# Commit 1: Prisma setup
git add prisma/schema.prisma
git commit -m "feat: add Prisma schema with Employee, Project, Task, Attendance models"

git add prisma/seed.ts
git commit -m "feat: add database seed script for initial data"

git add prisma.config.ts
git commit -m "chore: add Prisma config for Neon PostgreSQL"

# Commit 2: Database connection
git add src/lib/db.ts
git commit -m "feat: add PostgreSQL database connection with Prisma"

# Commit 3: API routes - Employees
git add src/app/api/employees/route.ts
git commit -m "feat: add employees API - GET all and POST new employee"

git add src/app/api/employees/*/route.ts
git commit -m "feat: add employee API - GET, PUT, DELETE by ID"

git add src/app/api/employees/*/assign-project/route.ts
git commit -m "feat: add API to assign project to employee"

# Commit 4: API routes - Attendance
git add src/app/api/attendance/route.ts
git commit -m "feat: add attendance API - GET and POST attendance records"

git add src/app/api/attendance/*/route.ts
git commit -m "feat: add attendance API - PUT and DELETE by ID"

# Commit 5: API routes - Tasks
git add src/app/api/tasks/route.ts
git commit -m "feat: add tasks API - GET all and POST new task"

git add src/app/api/tasks/*/submit/route.ts
git commit -m "feat: add task submission API with selfie support"

# Commit 6: API routes - Projects
git add src/app/api/projects/route.ts
git commit -m "feat: add projects API with team members"

git add src/app/api/projects/*/team/route.ts
git commit -m "feat: add API to get project team members"

# Commit 7: Fix admin API
git add src/app/api/fix-admin/route.ts
git commit -m "feat: add admin role fix helper API"

# Commit 8: Theme components
git add src/components/theme-provider.tsx
git commit -m "feat: add theme provider for dark/light mode"

git add src/components/theme-toggle.tsx
git commit -m "feat: add theme toggle component"

# Commit 9: Update globals CSS
git add src/app/globals.css
git commit -m "style: add light mode CSS variables for theme switching"

# Commit 10: Update root layout
git add src/app/layout.tsx
git commit -m "feat: integrate ThemeProvider in root layout"

# Commit 11: Auth improvements
git add src/firebase/auth/use-user.tsx
git commit -m "feat: add auto admin role assignment for admin emails"

# Commit 12: Admin layout
git add "src/app/(app)/layout.tsx"
git commit -m "feat: add theme toggle and leaves link to admin sidebar"

# Commit 13: Employee management page
git add "src/app/(app)/employees/page.tsx"
git commit -m "feat: add full employee management with image upload and team view"

# Commit 14: Leaves management page
git add "src/app/(app)/leaves/"
git commit -m "feat: add leave management page for admin"

# Commit 15: Employee dashboard layout
git add src/app/employee-dashboard/layout.tsx
git commit -m "feat: add employee dashboard layout with theme toggle"

# Commit 16: Employee tasks page
git add src/app/employee-dashboard/tasks/
git commit -m "feat: add employee tasks page with selfie submission"

# Commit 17: Employee attendance page
git add src/app/employee-dashboard/attendance/
git commit -m "feat: add employee attendance page"

# Commit 18: Employee leave page
git add src/app/employee-dashboard/leave/
git commit -m "feat: add employee leave request page"

# Commit 19: Employee dashboard home
git add src/app/employee-dashboard/page.tsx
git commit -m "feat: update employee dashboard home page"

# Commit 20: Login page update
git add src/app/login/page.tsx
git commit -m "feat: add theme toggle to login page"

# Commit 21: Data file update
git add src/lib/data.ts
git commit -m "docs: add detailed login credentials documentation"

# Commit 22: Package updates
git add package.json package-lock.json
git commit -m "chore: add prisma, pg, next-themes dependencies"

# Commit 23: Other updates
git add src/app/page.tsx
git commit -m "chore: update home page"

git add src/ai/genkit.ts
git commit -m "chore: update genkit config"

# Commit 24: Push script
git add push-commits.ps1
git commit -m "chore: add commit automation script"

# Push all commits
Write-Host "`nPushing all commits to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`nDone! All commits pushed successfully." -ForegroundColor Green
