# Leave Quota Management System

## Overview
A comprehensive leave quota management system where admins can set individual leave quotas for employees, and employees can view their balances and apply for different types of leaves including Work From Home.

## Features Implemented

### 1. Database Schema Updates
- Added leave quota fields to Employee model:
  - `casualLeaveQuota` (default: 1 day - Full Day Leave)
  - `sickLeaveQuota` (default: 2 days - Half Day Leave)
  - `earnedLeaveQuota` (default: 0 days)
  - `maternityLeaveQuota` (default: 0 days)
  - `paternityLeaveQuota` (default: 0 days)
  - `workFromHomeQuota` (default: 4 days - Work From Home)

- Added `WorkFromHome` to LeaveType enum

**Note:** The naming convention uses "casualLeaveQuota" for Full Day Leave and "sickLeaveQuota" for Half Day Leave for backward compatibility, but the UI displays them correctly.

### 2. API Endpoints

#### GET `/api/employees/[id]/leave-quota`
Fetches employee leave quotas and calculates used/remaining leaves.

**Response:**
```json
{
  "employee": {
    "id": "...",
    "name": "...",
    "email": "...",
    "casualLeaveQuota": 12,
    "sickLeaveQuota": 10,
    ...
  },
  "quotas": {
    "casual": {
      "total": 12,
      "used": 3,
      "remaining": 9
    },
    "sick": { ... },
    "earned": { ... },
    "workFromHome": { ... },
    "maternity": { ... },
    "paternity": { ... }
  }
}
```

#### PATCH `/api/employees/[id]/leave-quota`
Updates employee leave quotas (admin only).

**Request Body:**
```json
{
  "casualLeaveQuota": 15,
  "sickLeaveQuota": 12,
  "earnedLeaveQuota": 20,
  "maternityLeaveQuota": 90,
  "paternityLeaveQuota": 15,
  "workFromHomeQuota": 30
}
```

### 3. Admin Features

#### Manage Leave Quotas Page
- Location: `/employees/[id]/leave-quota`
- Accessible from Employees page → Employee dropdown menu → "Manage Leave Quotas"
- Features:
  - Set individual quotas for each leave type
  - Different quotas per employee
  - Real-time validation
  - Save and cancel options

### 4. Employee Features

#### My Leaves Page Updates
- Fetches real-time leave quotas from API
- Displays all leave types including Work From Home
- Shows used/remaining balance for each type
- Visual progress bars for quota utilization
- Only shows Maternity/Paternity if quota > 0

#### Leave Application
- All leave types available in dropdown:
  - Casual
  - Sick
  - Earned
  - Unpaid
  - Maternity
  - Paternity
  - Work From Home
- Half-day options for all leave types:
  - Full Day
  - Half Day
  - First Half
  - Second Half

### 5. Leave Calculation Logic
- Automatically calculates used leaves from approved requests
- Handles half-day leaves (counts as 0.5 days)
- Multi-day leave calculation
- Real-time remaining quota display

## Usage

### For Admins

1. **Set Leave Quotas:**
   - Go to Employees page
   - Click on employee dropdown menu (three dots)
   - Select "Manage Leave Quotas"
   - Set quotas for each leave type
   - Click "Save Quotas"

2. **Default Quotas:**
   - New employees get default quotas automatically
   - Can be customized per employee

### For Employees

1. **View Leave Balance:**
   - Go to "My Leaves" page
   - See all available leave types with quotas
   - Check used/remaining days for each type

2. **Apply for Leave:**
   - Click "Apply for Leave"
   - Select leave type (including Work From Home)
   - Choose duration (Full Day, Half Day, etc.)
   - Select dates
   - Provide reason
   - Submit for approval

## Important Notes

⚠️ **After Schema Changes:**
1. Run `npx prisma generate` to regenerate Prisma client
2. Restart the development server
3. The new fields will be available in the database

## Leave Types

| Type | Default Quota | Description |
|------|---------------|-------------|
| Casual | 12 days | Standard casual leave |
| Sick | 10 days | Medical/sick leave |
| Earned | 15 days | Earned/privilege leave |
| Work From Home | 24 days | Remote work days |
| Maternity | 0 days | Set per employee as needed |
| Paternity | 0 days | Set per employee as needed |
| Unpaid | Unlimited | No quota limit |

## Files Modified/Created

### Created:
- `src/app/api/employees/[id]/leave-quota/route.ts` - API endpoint
- `src/app/(app)/employees/[id]/leave-quota/page.tsx` - Admin page

### Modified:
- `prisma/schema.prisma` - Added leave quota fields
- `src/app/employee-dashboard/my-leaves/page.tsx` - Fetch and display quotas
- `src/app/(app)/employees/page.tsx` - Added "Manage Leave Quotas" button

## Next Steps

To use the system:
1. Restart your development server
2. Navigate to Employees page
3. Set leave quotas for employees
4. Employees can now see their quotas and apply for leaves
