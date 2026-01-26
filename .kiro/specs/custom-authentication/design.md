# Design Document: Custom Authentication System

## Overview

This design document outlines the technical architecture for replacing Firebase authentication with a custom authentication system using Prisma, PostgreSQL, JWT tokens, and bcrypt password hashing. The system will support role-based access control with admin and employee roles, where admins create employee accounts with passwords.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│                 │
│  - Login Page   │
│  - useAuth Hook │
│  - Protected    │
│    Routes       │
└────────┬────────┘
         │
         │ HTTP/JWT
         │
┌────────▼────────┐
│   API Routes    │
│  (Next.js API)  │
│                 │
│  - /api/auth/*  │
│  - Middleware   │
└────────┬────────┘
         │
         │ Prisma ORM
         │
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
│                 │
│  - User Table   │
│  - Employee     │
└─────────────────┘
```

### Authentication Flow

```
Login Flow:
1. User submits email + password
2. API validates credentials
3. API generates JWT token
4. Frontend stores token
5. Frontend redirects to dashboard

Protected Request Flow:
1. Frontend sends request with JWT
2. Middleware verifies JWT
3. Middleware extracts user info
4. API processes request
5. API returns response
```

## Components and Interfaces

### 1. Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  role          Role     @default(EMPLOYEE)
  isActive      Boolean  @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  // Relation to Employee table
  employee      Employee? @relation(fields: [email], references: [email])
  
  @@map("users")
}

enum Role {
  ADMIN
  EMPLOYEE
}
```

### 2. API Routes

#### POST /api/auth/login
```typescript
Request:
{
  email: string;
  password: string;
}

Response (Success):
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee';
  };
  token: string;
}

Response (Error):
{
  success: false;
  error: string;
}
```

#### POST /api/auth/logout
```typescript
Request:
{
  // Token in Authorization header
}

Response:
{
  success: true;
  message: string;
}
```

#### GET /api/auth/me
```typescript
Request:
{
  // Token in Authorization header
}

Response:
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee';
  };
}
```

#### POST /api/auth/change-password
```typescript
Request:
{
  currentPassword: string;
  newPassword: string;
}

Response:
{
  success: true;
  message: string;
}
```

#### POST /api/admin/create-employee (Admin only)
```typescript
Request:
{
  email: string;
  name: string;
  // Other employee fields
}

Response:
{
  success: true;
  employee: {
    id: string;
    email: string;
    name: string;
  };
  credentials: {
    email: string;
    password: string; // Generated password
  };
}
```

#### POST /api/admin/reset-password (Admin only)
```typescript
Request:
{
  employeeId: string;
}

Response:
{
  success: true;
  credentials: {
    email: string;
    password: string; // New generated password
  };
}
```

### 3. Authentication Utilities

#### lib/auth/password.ts
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string>;
export async function verifyPassword(password: string, hash: string): Promise<boolean>;
export function generateSecurePassword(length: number = 12): string;
```

#### lib/auth/jwt.ts
```typescript
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'employee';
}

export function generateToken(payload: JWTPayload): string;
export function verifyToken(token: string): JWTPayload | null;
```

#### lib/auth/middleware.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null>;
export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload } | Response>;
export async function requireAdmin(request: NextRequest): Promise<{ user: JWTPayload } | Response>;
```

### 4. Frontend Authentication Hook

#### hooks/use-auth.ts
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions;
```

### 5. Auth Context Provider

#### contexts/auth-context.tsx
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string; // Never exposed in API responses
  name: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Token Payload
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'employee';
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### Login Credentials
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password Hashing Consistency
*For any* password string, hashing it and then verifying it against the hash should always return true.
**Validates: Requirements 2.3, 7.1, 7.4**

### Property 2: JWT Token Round-Trip
*For any* valid user payload, generating a JWT token and then verifying it should return the same payload data.
**Validates: Requirements 6.1, 6.3**

### Property 3: Authentication State Consistency
*For any* authenticated user, making a request with their valid token should always return their correct user information.
**Validates: Requirements 4.4, 5.3, 11.3**

### Property 4: Role-Based Access Control
*For any* employee user attempting to access admin routes, the system should always return 403 Forbidden.
**Validates: Requirements 9.1, 9.3**

### Property 5: Password Never Exposed
*For any* API response containing user data, the password hash field should never be included.
**Validates: Requirements 7.3**

### Property 6: Token Expiration Enforcement
*For any* JWT token that has expired, verification should always fail and return null.
**Validates: Requirements 6.4, 8.3**

### Property 7: Unique Email Constraint
*For any* two user creation attempts with the same email, the second attempt should always fail.
**Validates: Requirements 2.2, 3.5**

### Property 8: Admin Creation Generates Credentials
*For any* employee created by an admin, the system should always return both the employee record and generated credentials.
**Validates: Requirements 3.1, 3.4**

### Property 9: Logout Clears Authentication
*For any* user who logs out, subsequent requests with their old token should always fail authentication.
**Validates: Requirements 10.2, 10.3**

### Property 10: Password Minimum Length
*For any* password shorter than 6 characters, the system should always reject it during creation or change.
**Validates: Requirements 7.5, 12.3**

## Error Handling

### Authentication Errors
- **Invalid Credentials**: Return generic "Invalid email or password" message
- **Expired Token**: Return 401 with "Token expired" message
- **Invalid Token**: Return 401 with "Invalid token" message
- **Missing Token**: Return 401 with "Authentication required" message

### Authorization Errors
- **Insufficient Permissions**: Return 403 with "Access denied" message
- **Invalid Role**: Return 403 with "Insufficient permissions" message

### Validation Errors
- **Weak Password**: Return 400 with "Password must be at least 6 characters" message
- **Invalid Email**: Return 400 with "Invalid email format" message
- **Duplicate Email**: Return 409 with "Email already exists" message

### Rate Limiting
- **Too Many Requests**: Return 429 with "Too many login attempts, please try again later" message
- Implement exponential backoff for repeated failures

## Testing Strategy

### Unit Tests
- Password hashing and verification functions
- JWT token generation and verification
- Password generation utility
- Input validation functions
- Middleware authentication logic

### Integration Tests
- Login flow with valid credentials
- Login flow with invalid credentials
- Protected route access with valid token
- Protected route access with invalid token
- Admin-only route access by employee (should fail)
- Employee creation by admin
- Password reset by admin
- Password change by user

### Property-Based Tests
- Password hashing round-trip (Property 1)
- JWT token round-trip (Property 2)
- Role-based access control (Property 4)
- Token expiration (Property 6)
- Email uniqueness (Property 7)

### Security Tests
- SQL injection attempts
- XSS attempts in login form
- Brute force login attempts (rate limiting)
- Token tampering attempts
- Expired token usage attempts

### Migration Tests
- Firebase user data export
- User record creation from Firebase data
- Role preservation during migration
- Credential generation for migrated users

## Security Considerations

### Password Security
- Use bcrypt with minimum 10 salt rounds
- Never log passwords
- Never return password hashes in responses
- Enforce minimum password length
- Generate secure random passwords for admin-created accounts

### Token Security
- Store JWT secret in environment variables
- Use httpOnly cookies for token storage (preferred) or localStorage
- Set appropriate token expiration (8 hours)
- Implement token refresh mechanism if needed
- Validate token signature on every request

### API Security
- Implement rate limiting on authentication endpoints
- Use HTTPS for all requests
- Sanitize all user inputs
- Implement CORS properly
- Log all authentication attempts

### Database Security
- Use parameterized queries (Prisma handles this)
- Never expose database errors to clients
- Implement proper indexing for performance
- Regular security audits

## Migration Strategy

### Phase 1: Preparation
1. Create User table in database
2. Implement authentication utilities
3. Create API routes
4. Test authentication flow in isolation

### Phase 2: Parallel Running
1. Keep Firebase authentication active
2. Implement custom authentication alongside
3. Create migration script
4. Test both systems in parallel

### Phase 3: Migration
1. Export Firebase user data
2. Create User records for all users
3. Generate initial passwords
4. Provide credentials to admin
5. Notify users of system change

### Phase 4: Cutover
1. Switch frontend to use custom authentication
2. Remove Firebase dependencies
3. Update all authentication flows
4. Monitor for issues

### Phase 5: Cleanup
1. Remove Firebase code
2. Remove Firebase packages
3. Update documentation
4. Archive Firebase configuration

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=<random-secure-string>
JWT_EXPIRATION=8h

# Database (already configured)
DATABASE_URL=<postgresql-connection-string>

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=60000

# Admin Seed
ADMIN_EMAIL=admin@adrs.com
ADMIN_PASSWORD=<secure-initial-password>
```

## Implementation Notes

### Password Generation
- Use crypto.randomBytes for secure password generation
- Include uppercase, lowercase, numbers, and special characters
- Default length: 12 characters
- Avoid ambiguous characters (0, O, l, 1)

### Session Management
- Store token in localStorage or httpOnly cookie
- Clear token on logout
- Verify token on app load
- Redirect to login if token invalid

### Protected Routes
- Use middleware to check authentication
- Extract user from token
- Pass user to API route handlers
- Implement role checking for admin routes

### Error Messages
- Use generic messages for security
- Log detailed errors server-side
- Never expose stack traces to clients
- Implement proper error boundaries

