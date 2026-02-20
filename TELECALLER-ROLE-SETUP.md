# Telecaller Role Setup

## Overview
Successfully created a complete Telecaller role and dashboard with punch in/out functionality, mirroring the employee dashboard structure.

## Changes Made

### 1. Database Schema
- **File**: `prisma/schema.prisma`
- **Change**: Added `Telecaller` to the `Role` enum
- **Command Run**: `npx prisma generate` to update Prisma client

### 2. Telecaller Dashboard Structure
Created the following files:

#### Main Dashboard
- `src/app/telecaller-dashboard/layout.tsx` - Dashboard layout with sidebar
- `src/app/telecaller-dashboard/page.tsx` - Main dashboard with stats and punch in/out card

#### My Attendance Page
- `src/app/telecaller-dashboard/my-attendance/page.tsx` - Full attendance tracking with:
  - Punch In/Out functionality
  - Monthly attendance records
  - Attendance statistics (Present, Absent, Percentage)
  - Calendar view of attendance history

#### Additional Pages
- `src/app/telecaller-dashboard/change-password/page.tsx` - Password change functionality
- `src/app/telecaller-dashboard/call-logs/page.tsx` - Placeholder for future call logging features

### 3. Components
- **File**: `src/components/telecaller-sidebar.tsx`
- **Features**:
  - Navigation menu (Dashboard, My Attendance, Call Logs)
  - User profile dropdown
  - Logout functionality
  - Responsive design

### 4. Authentication Updates
- **File**: `src/hooks/use-auth.tsx`
- **Change**: Updated login redirect logic to route telecallers to `/telecaller-dashboard`
- **Logic**: Checks if `user.employee.role === 'Telecaller'` and redirects accordingly

## Features

### Punch In/Out System
- Uses local timezone for accurate time tracking
- Sends time from client to avoid server timezone issues
- Same functionality as employee dashboard
- Real-time status updates

### Attendance Tracking
- View today's attendance status
- Monthly attendance history
- Statistics: Total days, Present, Absent, Attendance percentage
- Month selector for historical data

### Navigation
- Dashboard - Overview with stats
- My Attendance - Full attendance management
- Call Logs - Placeholder for future features
- Change Password - Security settings

## How to Use

### Creating a Telecaller User
1. Create an employee with role `Telecaller` in the database
2. Create a user account linked to that employee
3. Login with the telecaller credentials
4. System will automatically redirect to `/telecaller-dashboard`

### Accessing Features
- **Punch In**: Click "Punch In" button on dashboard or attendance page
- **Punch Out**: Click "Punch Out" button after punching in
- **View History**: Navigate to "My Attendance" and select month
- **Change Password**: Use dropdown menu → Change Password

## Technical Details

### Timezone Handling
- Client captures local time using `new Date()`
- Formats time as HH:MM (24-hour format)
- Sends to API in request body
- API accepts client time or falls back to server time

### API Endpoints Used
- `GET /api/employees?email={email}` - Fetch employee data
- `GET /api/attendance?employeeId={id}&date={date}` - Get today's attendance
- `GET /api/attendance?employeeId={id}&month={month}&year={year}` - Get monthly attendance
- `POST /api/attendance` - Punch in
- `PUT /api/attendance` - Punch out
- `POST /api/auth/change-password` - Change password

### Role-Based Access
- Telecaller dashboard is accessible only to employees with role `Telecaller`
- Layout checks user role and redirects if unauthorized
- Sidebar shows telecaller-specific navigation

## Future Enhancements
- Call logging and management
- Call statistics and analytics
- Lead tracking
- Performance metrics
- Call recording integration

## Files Created
```
src/app/telecaller-dashboard/
├── layout.tsx
├── page.tsx
├── my-attendance/
│   └── page.tsx
├── change-password/
│   └── page.tsx
└── call-logs/
    └── page.tsx

src/components/
└── telecaller-sidebar.tsx
```

## Database Migration
Run the following to apply schema changes:
```bash
npx prisma db push
npx prisma generate
```

## Testing
1. Create a test employee with role `Telecaller`
2. Create a user account for that employee
3. Login and verify redirect to telecaller dashboard
4. Test punch in/out functionality
5. Verify attendance records are saved correctly
6. Check monthly attendance view
