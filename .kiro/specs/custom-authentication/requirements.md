# Requirements Document

## Introduction

This specification defines the requirements for removing Firebase authentication and implementing a custom authentication system for the ADRS (Attendance and Daily Report System). The system will use Prisma with PostgreSQL for data persistence and implement secure password-based authentication with role-based access control.

## Glossary

- **System**: The ADRS application backend and frontend
- **Admin**: A user with administrative privileges who can manage employees
- **Employee**: A regular user who can log in and access employee features
- **Auth_Token**: A JWT (JSON Web Token) used for session management
- **Password_Hash**: A bcrypt-hashed password stored in the database
- **Session**: An authenticated user's active connection to the system
- **Prisma**: The ORM (Object-Relational Mapping) tool used for database operations
- **Database**: PostgreSQL database storing user credentials and application data

## Requirements

### Requirement 1: Remove Firebase Dependencies

**User Story:** As a developer, I want to remove all Firebase dependencies from the project, so that the application uses a custom authentication system.

#### Acceptance Criteria

1. THE System SHALL remove all Firebase SDK imports and dependencies from the codebase
2. THE System SHALL remove Firebase configuration files and initialization code
3. THE System SHALL remove Firebase authentication hooks and providers
4. THE System SHALL remove Firebase Firestore operations and replace with Prisma
5. THE System SHALL update package.json to remove Firebase packages

### Requirement 2: Database Schema for Authentication

**User Story:** As a developer, I want a proper database schema for storing user credentials, so that authentication data is securely persisted.

#### Acceptance Criteria

1. THE System SHALL create a User table in the database with fields: id, email, password_hash, name, role, created_at, updated_at
2. THE System SHALL ensure email field is unique and indexed
3. THE System SHALL store passwords as bcrypt hashes with salt rounds of 10 or higher
4. THE System SHALL support two roles: 'admin' and 'employee'
5. THE System SHALL link User table to existing Employee table via email or user_id

### Requirement 3: Admin Creates Employee Accounts

**User Story:** As an admin, I want to create employee accounts with initial passwords, so that employees can log in to the system.

#### Acceptance Criteria

1. WHEN an admin creates an employee, THE System SHALL generate a secure initial password
2. WHEN an admin creates an employee, THE System SHALL hash the password before storing
3. WHEN an admin creates an employee, THE System SHALL create both User and Employee records
4. WHEN an admin creates an employee, THE System SHALL send the credentials to the admin (not auto-email)
5. THE System SHALL prevent duplicate email addresses across all users

### Requirement 4: Employee Login

**User Story:** As an employee, I want to log in with my email and password, so that I can access my dashboard.

#### Acceptance Criteria

1. WHEN an employee submits valid credentials, THE System SHALL authenticate the user
2. WHEN an employee submits valid credentials, THE System SHALL generate a JWT token
3. WHEN an employee submits invalid credentials, THE System SHALL return an error message
4. WHEN an employee logs in successfully, THE System SHALL return user data and auth token
5. THE System SHALL validate password against stored hash using bcrypt

### Requirement 5: Admin Login

**User Story:** As an admin, I want to log in with my email and password, so that I can access the admin dashboard.

#### Acceptance Criteria

1. WHEN an admin submits valid credentials, THE System SHALL authenticate the user
2. WHEN an admin submits valid credentials, THE System SHALL verify the user has admin role
3. WHEN an admin logs in successfully, THE System SHALL return admin-specific data and auth token
4. THE System SHALL have at least one pre-seeded admin account in the database
5. THE System SHALL prevent non-admin users from accessing admin routes

### Requirement 6: Session Management with JWT

**User Story:** As a user, I want my session to be managed securely, so that I remain authenticated across requests.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL generate a JWT token with user id, email, and role
2. THE System SHALL set JWT expiration to 8 hours
3. WHEN a user makes an authenticated request, THE System SHALL verify the JWT token
4. WHEN a JWT token expires, THE System SHALL require re-authentication
5. THE System SHALL store JWT secret in environment variables

### Requirement 7: Password Security

**User Story:** As a security-conscious developer, I want passwords to be stored securely, so that user credentials are protected.

#### Acceptance Criteria

1. THE System SHALL hash all passwords using bcrypt with minimum 10 salt rounds
2. THE System SHALL never store plain-text passwords in the database
3. THE System SHALL never return password hashes in API responses
4. WHEN comparing passwords, THE System SHALL use bcrypt.compare()
5. THE System SHALL enforce minimum password length of 6 characters

### Requirement 8: Protected API Routes

**User Story:** As a developer, I want API routes to be protected by authentication, so that only authorized users can access them.

#### Acceptance Criteria

1. WHEN an unauthenticated request is made to a protected route, THE System SHALL return 401 Unauthorized
2. WHEN a request with invalid token is made, THE System SHALL return 401 Unauthorized
3. WHEN a request with expired token is made, THE System SHALL return 401 Unauthorized
4. THE System SHALL provide middleware to verify JWT tokens on protected routes
5. THE System SHALL extract user information from valid JWT tokens

### Requirement 9: Role-Based Access Control

**User Story:** As a developer, I want role-based access control, so that admins and employees have appropriate permissions.

#### Acceptance Criteria

1. WHEN an employee attempts to access admin routes, THE System SHALL return 403 Forbidden
2. WHEN an admin accesses any route, THE System SHALL allow access
3. THE System SHALL verify user role from JWT token claims
4. THE System SHALL provide middleware to check user roles
5. THE System SHALL redirect users to appropriate dashboards based on role

### Requirement 10: Logout Functionality

**User Story:** As a user, I want to log out of the system, so that my session is terminated.

#### Acceptance Criteria

1. WHEN a user logs out, THE System SHALL clear the auth token from client storage
2. WHEN a user logs out, THE System SHALL invalidate the current session
3. WHEN a logged-out user attempts to access protected routes, THE System SHALL redirect to login
4. THE System SHALL provide a logout API endpoint
5. THE System SHALL clear all authentication state on logout

### Requirement 11: Frontend Authentication State

**User Story:** As a developer, I want a custom authentication hook, so that components can access user state.

#### Acceptance Criteria

1. THE System SHALL provide a useAuth hook for accessing authentication state
2. THE System SHALL store auth token in localStorage or httpOnly cookies
3. WHEN the app loads, THE System SHALL verify existing auth token
4. WHEN token is invalid, THE System SHALL clear authentication state
5. THE System SHALL provide loading states during authentication checks

### Requirement 12: Employee Password Management

**User Story:** As an employee, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN an employee requests password change, THE System SHALL verify current password
2. WHEN an employee provides new password, THE System SHALL hash and store it
3. THE System SHALL require minimum password length of 6 characters
4. THE System SHALL invalidate old sessions after password change
5. THE System SHALL provide a password change API endpoint

### Requirement 13: Admin Password Reset for Employees

**User Story:** As an admin, I want to reset employee passwords, so that I can help employees who forgot their credentials.

#### Acceptance Criteria

1. WHEN an admin resets an employee password, THE System SHALL generate a new secure password
2. WHEN an admin resets an employee password, THE System SHALL hash and store the new password
3. THE System SHALL return the new password to the admin (not auto-email)
4. THE System SHALL invalidate all existing sessions for that employee
5. THE System SHALL log password reset actions for audit purposes

### Requirement 14: Migration from Firebase to Custom Auth

**User Story:** As a developer, I want to migrate existing Firebase users to the custom system, so that current users can continue using the application.

#### Acceptance Criteria

1. THE System SHALL provide a migration script to export Firebase user data
2. THE System SHALL create User records for all existing Firebase users
3. WHEN migrating users, THE System SHALL generate initial passwords for all users
4. THE System SHALL preserve user roles (admin/employee) during migration
5. THE System SHALL provide a report of migrated users with their new credentials

### Requirement 15: Error Handling and Security

**User Story:** As a developer, I want proper error handling for authentication, so that security is maintained.

#### Acceptance Criteria

1. WHEN authentication fails, THE System SHALL return generic error messages (not specific reasons)
2. THE System SHALL implement rate limiting on login attempts (max 5 per minute per IP)
3. THE System SHALL log all authentication attempts for security monitoring
4. WHEN multiple failed login attempts occur, THE System SHALL temporarily lock the account
5. THE System SHALL sanitize all user inputs to prevent SQL injection

