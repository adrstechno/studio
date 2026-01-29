# Dashboard Improvements and Critical Fixes

## Overview
This specification addresses multiple critical issues and improvements needed across the intern and employee dashboards, attendance system, and intern management functionality.

## Critical Issues to Fix

### 1. Cloudinary Upload Error
**Issue**: "Must supply api_key" error when uploading images for employee/intern profiles
**Root Cause**: Environment variables are present but may not be properly loaded in production
**Priority**: HIGH

### 2. Intern Dashboard Dynamic Content
**Issue**: Intern dashboard needs to be fully dynamic with real-time data
**Current State**: Partially dynamic but missing some real-time updates
**Priority**: HIGH

### 3. Punch In/Out Transfer
**Issue**: Move punch in/out functionality from main dashboard to attendance page
**Current State**: Punch in/out exists in employee attendance page but needs to be moved
**Priority**: MEDIUM

### 4. Attendance Page Access
**Issue**: Attendance page not opening properly
**Current State**: Page exists but may have routing or permission issues
**Priority**: HIGH

### 5. Mentor Assignment Filter
**Issue**: When creating/editing interns, mentor dropdown should only show active employees
**Current State**: Already implemented but needs verification
**Priority**: MEDIUM

### 6. Edit Intern Photo Upload
**Issue**: Edit intern dialog doesn't have photo upload option
**Current State**: Photo upload exists in add dialog but missing in edit dialog
**Priority**: MEDIUM

### 7. Duration Display in Interns
**Issue**: Duration is not showing properly in interns table
**Current State**: Duration column exists but calculation may be incorrect
**Priority**: MEDIUM

## User Stories

### US-1: Fix Image Upload System
**As an admin**, I want to upload profile images for employees and interns without errors, so that I can maintain complete profiles.

**Acceptance Criteria:**
- Image upload works consistently across all forms
- Proper error handling for upload failures
- Support for common image formats (JPG, PNG, WebP)
- File size validation (max 5MB)
- Progress indication during upload

### US-2: Dynamic Intern Dashboard
**As an intern**, I want my dashboard to show real-time data about my tasks, evaluations, and projects, so that I have up-to-date information.

**Acceptance Criteria:**
- Real-time task status updates
- Current project progress
- Recent evaluations display
- Live attendance status
- Dynamic statistics (completed tasks, ratings, etc.)

### US-3: Centralized Attendance Management
**As an employee**, I want to manage my punch in/out from the attendance page, so that all attendance-related functions are in one place.

**Acceptance Criteria:**
- Punch in/out functionality moved to attendance page
- Today's attendance status clearly visible
- Historical attendance data accessible
- Mobile-responsive design for on-the-go access

### US-4: Reliable Attendance Page Access
**As a user**, I want the attendance page to load consistently, so that I can track my attendance without issues.

**Acceptance Criteria:**
- Attendance page loads without errors
- Proper error handling for data fetch failures
- Loading states for better UX
- Fallback content when data is unavailable

### US-5: Active Employee Mentor Selection
**As an admin**, I want to see only active employees when assigning mentors to interns, so that I don't assign inactive mentors.

**Acceptance Criteria:**
- Mentor dropdown filters to active employees only
- Clear indication of employee status
- Proper role-based filtering (only eligible roles as mentors)

### US-6: Complete Intern Profile Management
**As an admin**, I want to upload and update intern profile photos during editing, so that I can maintain current profile images.

**Acceptance Criteria:**
- Photo upload available in edit intern dialog
- Preview of current and new images
- Ability to remove/replace existing photos
- Consistent upload behavior across add/edit forms

### US-7: Accurate Duration Display
**As an admin**, I want to see accurate internship duration in the interns table, so that I can quickly assess internship timelines.

**Acceptance Criteria:**
- Duration calculated correctly from start/end dates
- Proper handling of ongoing internships (no end date)
- Human-readable format (e.g., \"3 months\", \"6 weeks\")
- Consistent formatting across the application

## Technical Requirements

### 1. Image Upload System Fix

#### Environment Variables Verification
```typescript
// Add environment validation in upload route
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Validate all required variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}
```

#### Enhanced Error Handling
```typescript
// Improved error handling in upload route
try {
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'adrs-employees',
    resource_type: 'auto',
    timeout: 60000, // 60 second timeout
  });
  
  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
} catch (error: any) {
  console.error('Cloudinary upload error:', {
    message: error.message,
    stack: error.stack,
    config: {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    }
  });
  
  return NextResponse.json(
    { 
      error: 'Image upload failed',
      details: error.message,
      code: error.code || 'UPLOAD_ERROR'
    },
    { status: 500 }
  );
}
```

### 2. Intern Dashboard Enhancements

#### Real-time Data Fetching
```typescript
// Add polling for real-time updates
const useRealTimeData = (internId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasks, evaluations, projects] = await Promise.all([
          fetch(`/api/tasks?assigneeId=${internId}&assigneeType=Intern`),
          fetch(`/api/interns/${internId}/evaluations`),
          fetch(`/api/projects?internId=${internId}`)
        ]);
        
        // Process and set data
        setData({
          tasks: await tasks.json(),
          evaluations: await evaluations.json(),
          projects: await projects.json()
        });
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [internId]);
  
  return { data, loading };
};
```

### 3. Attendance Page Improvements

#### Centralized Punch In/Out Component
```typescript
// Create reusable PunchInOut component
export const PunchInOutCard = ({ employeeId, onUpdate }: {
  employeeId: string;
  onUpdate?: () => void;
}) => {
  // Implementation for punch in/out functionality
  // Move logic from employee dashboard to this component
  // Make it reusable across different pages
};
```

#### Enhanced Error Handling
```typescript
// Add comprehensive error handling for attendance page
const AttendancePage = () => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchAttendanceData = useCallback(async () => {
    try {
      setError(null);
      // Fetch attendance data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/attendance', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Process data
      
    } catch (error: any) {
      console.error('Attendance fetch error:', error);
      setError(error.message);
      
      // Implement retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchAttendanceData();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    }
  }, [retryCount]);
  
  // Rest of component
};
```

### 4. Intern Management Improvements

#### Duration Calculation Utility
```typescript
// Create utility for accurate duration calculation
export const calculateInternshipDuration = (
  startDate: string | Date,
  endDate?: string | Date | null
): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  if (isNaN(start.getTime()) || (endDate && isNaN(end.getTime()))) {
    return 'Invalid dates';
  }
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Not started';
  }
  
  if (diffDays === 0) {
    return 'Started today';
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    let result = `${weeks} week${weeks > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    return result;
  }
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    let result = `${months} month${months > 1 ? 's' : ''}`;
    if (remainingDays >= 7) {
      const weeks = Math.floor(remainingDays / 7);
      result += `, ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    return result;
  }
  
  const years = Math.floor(diffDays / 365);
  const remainingMonths = Math.floor((diffDays % 365) / 30);
  let result = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  return result;
};
```

#### Enhanced Mentor Selection
```typescript
// Improve mentor selection with better filtering
const useMentorOptions = () => {
  const [mentors, setMentors] = useState<Employee[]>([]);
  
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Fetch only active employees with mentor-eligible roles
        const response = await fetch('/api/employees?active=true&roles=admin,teamlead,employee');
        const employees = await response.json();
        
        // Filter for mentor-eligible roles
        const eligibleMentors = employees.filter((emp: Employee) => 
          emp.isActive && 
          ['admin', 'teamlead', 'employee'].includes(emp.role.toLowerCase())
        );
        
        setMentors(eligibleMentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };
    
    fetchMentors();
  }, []);
  
  return mentors;
};
```

## API Enhancements

### 1. Enhanced Upload Endpoint
```typescript
// Add validation and better error handling
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing Cloudinary environment variables:', missingVars);
      return NextResponse.json(
        { error: 'Server configuration error', code: 'MISSING_CONFIG' },
        { status: 500 }
      );
    }
    
    // Configure Cloudinary with explicit values
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;
    
    // Upload to Cloudinary with timeout
    const result = await Promise.race([
      cloudinary.uploader.upload(dataURI, {
        folder: 'adrs-employees',
        resource_type: 'auto',
        transformation: [
          { width: 400, height: 400, crop: 'fill', quality: 'auto' }
        ]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      )
    ]) as any;
    
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
    
  } catch (error: any) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      http_code: error.http_code,
    });
    
    let errorMessage = 'Failed to upload image';
    let errorCode = 'UPLOAD_ERROR';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try again.';
      errorCode = 'TIMEOUT';
    } else if (error.message.includes('api_key')) {
      errorMessage = 'Server configuration error';
      errorCode = 'CONFIG_ERROR';
    } else if (error.http_code) {
      errorMessage = `Cloudinary error: ${error.message}`;
      errorCode = 'CLOUDINARY_ERROR';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
```

### 2. Enhanced Employees API for Mentor Selection
```typescript
// Add filtering for mentor selection
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';
    const roles = searchParams.get('roles')?.split(',');
    
    const where: any = {};
    
    if (activeOnly) {
      where.isActive = true;
    }
    
    if (roles && roles.length > 0) {
      where.role = {
        in: roles.map(role => role.trim())
      };
    }
    
    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatarUrl: true,
      }
    });
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
```

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)
1. **Fix Cloudinary Upload Error**
   - Enhance upload route with better error handling
   - Add environment variable validation
   - Implement timeout and retry logic
   - Test across all upload scenarios

2. **Fix Attendance Page Access**
   - Debug routing issues
   - Add comprehensive error handling
   - Implement loading states
   - Test page accessibility

### Phase 2: Dashboard Improvements (Week 2)
1. **Make Intern Dashboard Fully Dynamic**
   - Implement real-time data fetching
   - Add polling for live updates
   - Enhance error handling
   - Optimize performance

2. **Add Photo Upload to Edit Intern**
   - Copy photo upload component from add dialog
   - Ensure consistent behavior
   - Test image preview and upload

### Phase 3: Feature Enhancements (Week 3)
1. **Transfer Punch In/Out to Attendance Page**
   - Create reusable PunchInOut component
   - Move functionality from dashboard
   - Update navigation and UX
   - Test mobile responsiveness

2. **Fix Duration Display**
   - Implement accurate duration calculation
   - Add human-readable formatting
   - Handle edge cases (ongoing internships)
   - Update all duration displays

### Phase 4: Testing and Polish (Week 4)
1. **Comprehensive Testing**
   - Test all upload scenarios
   - Verify mentor selection filtering
   - Test attendance functionality
   - Mobile responsiveness testing

2. **Performance Optimization**
   - Optimize API calls
   - Implement caching where appropriate
   - Reduce bundle size
   - Monitor performance metrics

## Success Metrics

### Technical Metrics
- **Upload Success Rate**: >99% for valid image files
- **Page Load Time**: <2 seconds for attendance page
- **API Response Time**: <500ms for dashboard data
- **Error Rate**: <1% for critical user flows

### User Experience Metrics
- **Task Completion Rate**: >95% for intern profile creation
- **User Satisfaction**: >4.5/5 for dashboard usability
- **Support Tickets**: <5 per month for upload issues
- **Mobile Usage**: >80% success rate on mobile devices

## Risk Mitigation

### High-Risk Items
1. **Cloudinary Configuration**: Backup upload strategy using local storage
2. **Database Performance**: Implement query optimization and caching
3. **Real-time Updates**: Graceful degradation if WebSocket fails
4. **Mobile Compatibility**: Progressive enhancement approach

### Contingency Plans
1. **Upload Failures**: Implement retry mechanism with exponential backoff
2. **API Timeouts**: Client-side timeout handling with user feedback
3. **Data Inconsistency**: Implement data validation and reconciliation
4. **Performance Issues**: Implement lazy loading and pagination

This comprehensive specification addresses all the critical issues while providing a clear implementation roadmap and success metrics for tracking progress.