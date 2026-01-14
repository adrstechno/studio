# Attendance & Leave Module Implementation Plan

## Current Status
- ✅ Database models exist (Attendance, LeaveRequest)
- ✅ Basic UI pages exist but use mock data
- ❌ No real punch in/out functionality
- ❌ No calendar view with attendance data
- ❌ No monthly reports
- ❌ No leave balance tracking
- ❌ No approval workflow with comments

## Implementation Required

### 1. Attendance Module - Employee Side

#### A) Punch In/Out System
**Files to Create/Update:**
- `src/app/api/attendance/punch/route.ts` - API for punch in/out
- `src/app/employee-dashboard/attendance/page.tsx` - Update UI

**Features:**
- Real-time punch in button (records current time)
- Punch out button (calculates total hours)
- Late detection (if punch in > 9:00 AM)
- Display current status (Not Punched In / Punched In / Punched Out)
- Show today's punch in/out times
- Calculate and display total hours worked

#### B) Monthly Calendar View
**Features:**
- Calendar component showing full month
- Color-coded days:
  - Green: Present
  - Red: Absent
  - Yellow: Late
  - Blue: Half-day
  - Purple: On Leave
- Click day to see details (check in/out times, hours)
- Working hours displayed per day

#### C) Monthly Reports
**Features:**
- Total working days in month
- Total hours worked
- Late days count
- Absent days count
- Leaves used count
- Average hours per day
- Export to PDF/CSV option

### 2. Attendance Module - Admin Side

**Files to Update:**
- `src/app/(app)/attendance/page.tsx`

**Features:**
- View all employees' attendance
- Filter by employee, date range, status
- Calendar view showing team attendance
- Mark attendance manually for employees
- Generate team reports
- Export attendance data

### 3. Leave Request Module - Employee Side

#### A) Apply Leave Form
**Files to Create/Update:**
- `src/app/api/leave-requests/route.ts` - CRUD operations
- `src/app/employee-dashboard/leave/page.tsx` - Update UI

**Features:**
- Leave application form:
  - Leave type (Casual, Sick, Earned, Unpaid)
  - Start date
  - End date
  - Reason (textarea)
  - Half-day option
- Leave balance display:
  - Casual Leave: X/12 remaining
  - Sick Leave: X/10 remaining
  - Earned Leave: X/15 remaining
- Status tracking (Pending/Approved/Rejected)
- View history of all leave requests
- Cancel pending requests

#### B) Leave Balance System
**New Model Needed:**
```prisma
model LeaveBalance {
  id          String   @id @default(cuid())
  employeeId  String   @unique
  casualLeave Int      @default(12)
  sickLeave   Int      @default(10)
  earnedLeave Int      @default(15)
  updatedAt   DateTime @updatedAt
  employee    Employee @relation(fields: [employeeId], references: [id])
}
```

### 4. Leave Request Module - Admin Side

#### A) Approval Interface
**Files to Update:**
- `src/app/(app)/leaves/page.tsx`
- `src/app/api/leave-requests/[id]/approve/route.ts`

**Features:**
- List all leave requests (pending, approved, rejected)
- Filter by status, employee, date range
- Approve/Reject buttons
- Add comment when approving/rejecting
- View employee's leave balance before approving
- View employee's attendance history
- Bulk approve/reject

#### B) History & Logs
**Features:**
- Complete history of all actions
- Who approved/rejected
- When it was approved/rejected
- Admin comments visible
- Audit trail

## API Endpoints Needed

### Attendance APIs
- `POST /api/attendance/punch` - Punch in/out
- `GET /api/attendance?employeeId=X&month=Y` - Get attendance records
- `GET /api/attendance/report?employeeId=X&month=Y` - Get monthly report
- `POST /api/attendance/manual` - Admin manual attendance entry

### Leave Request APIs
- `GET /api/leave-requests` - Get all leave requests (with filters)
- `POST /api/leave-requests` - Create new leave request
- `PATCH /api/leave-requests/[id]` - Update leave request
- `DELETE /api/leave-requests/[id]` - Cancel leave request
- `PATCH /api/leave-requests/[id]/approve` - Approve/reject with comment
- `GET /api/leave-balance?employeeId=X` - Get leave balance

## Database Schema Updates

### Add LeaveBalance Model
```prisma
model LeaveBalance {
  id          String   @id @default(cuid())
  employeeId  String   @unique
  casualLeave Int      @default(12)
  sickLeave   Int      @default(10)
  earnedLeave Int      @default(15)
  updatedAt   DateTime @updatedAt
  employee    Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("leave_balances")
}
```

### Update LeaveRequest Model
- ✅ Add `leaveType` field
- ✅ Add `adminComment` field
- ✅ Add `updatedAt` field

### Update Attendance Model
- Consider adding `totalHours` calculated field
- Consider adding `isLate` boolean field

## UI Components Needed

### Attendance Components
- PunchInOutCard - Shows current status and punch buttons
- AttendanceCalendar - Monthly calendar with color-coded days
- AttendanceStats - Cards showing monthly statistics
- AttendanceReport - Detailed report view

### Leave Components
- LeaveApplicationForm - Form to apply for leave
- LeaveBalanceCard - Shows remaining leave balance
- LeaveRequestCard - Individual leave request display
- LeaveApprovalDialog - Admin approval interface with comment

## Implementation Priority

### Phase 1 (High Priority)
1. ✅ Update database schema
2. Create attendance punch in/out API
3. Update employee attendance page with punch functionality
4. Create leave request API
5. Update employee leave page with application form

### Phase 2 (Medium Priority)
6. Add leave balance system
7. Implement admin approval workflow
8. Add comments to leave approvals
9. Create monthly calendar view

### Phase 3 (Nice to Have)
10. Add monthly reports
11. Add export functionality
12. Add bulk operations
13. Add notifications for approvals

## Testing Checklist

### Attendance
- [ ] Employee can punch in
- [ ] Employee can punch out
- [ ] Late detection works correctly
- [ ] Total hours calculated correctly
- [ ] Calendar shows correct status
- [ ] Monthly report shows accurate data

### Leave Requests
- [ ] Employee can apply for leave
- [ ] Leave balance updates correctly
- [ ] Admin can approve/reject
- [ ] Comments are saved and displayed
- [ ] Status updates correctly
- [ ] Email notifications sent (if implemented)

## Notes
- All times should be stored in UTC and displayed in user's timezone
- Late threshold: 9:00 AM
- Working hours: 9:00 AM - 6:00 PM (9 hours)
- Half-day: 4.5 hours
- Leave balance resets annually on January 1st
