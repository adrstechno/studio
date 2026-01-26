# Requirements Document: Password Management System

## Introduction

This feature implements automatic password generation when admins create employees or interns, and provides a password change functionality for employees and interns in their respective dashboards.

## Glossary

- **System**: The ADRS employee management application
- **Admin**: User with admin role who can create employees and interns
- **Employee**: User with employee role
- **Intern**: User with intern role
- **Default_Password**: Auto-generated password following pattern `FirstName@123`
- **User_Account**: Authentication account in the User table linked to Employee or Intern

## Requirements

### Requirement 1: Automatic Password Generation for Employees

**User Story:** As an admin, I want the system to automatically create user accounts with default passwords when I create employees, so that employees can login immediately.

#### Acceptance Criteria

1. WHEN an admin creates a new employee, THE System SHALL automatically create a User account with role 'employee'
2. WHEN creating the User account, THE System SHALL generate a default password using pattern `FirstName@123` where FirstName is extracted from the employee name
3. WHEN the employee name contains spaces, THE System SHALL use only the first word as FirstName
4. WHEN the User account is created, THE System SHALL hash the password before storing
5. WHEN the employee creation is successful, THE System SHALL link the User account to the Employee record via employeeId
6. IF the User account creation fails, THEN THE System SHALL rollback the employee creation and return an error

### Requirement 2: Automatic Password Generation for Interns

**User Story:** As an admin, I want the system to automatically create user accounts with default passwords when I create interns, so that interns can login immediately.

#### Acceptance Criteria

1. WHEN an admin creates a new intern, THE System SHALL automatically create a User account with role 'intern'
2. WHEN creating the User account, THE System SHALL generate a default password using pattern `FirstName@123` where FirstName is extracted from the intern name
3. WHEN the intern name contains spaces, THE System SHALL use only the first word as FirstName
4. WHEN the User account is created, THE System SHALL hash the password before storing
5. WHEN the intern creation is successful, THE System SHALL link the User account to the Intern record via internId
6. IF the User account creation fails, THEN THE System SHALL rollback the intern creation and return an error

### Requirement 3: Password Change API

**User Story:** As a developer, I want a secure API endpoint for changing passwords, so that employees and interns can update their passwords.

#### Acceptance Criteria

1. WHEN a password change request is received, THE System SHALL verify the user is authenticated via JWT token
2. WHEN validating the request, THE System SHALL require both current password and new password
3. WHEN the current password is provided, THE System SHALL verify it matches the stored password hash
4. IF the current password is incorrect, THEN THE System SHALL return an error and reject the change
5. WHEN the new password is provided, THE System SHALL validate it meets minimum requirements (at least 6 characters)
6. WHEN the new password is valid, THE System SHALL hash it before storing
7. WHEN the password is successfully changed, THE System SHALL return a success response
8. WHEN the password change fails, THE System SHALL return an appropriate error message

### Requirement 4: Employee Password Change UI

**User Story:** As an employee, I want to change my password from my dashboard, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN an employee accesses their dashboard, THE System SHALL provide a "Change Password" option in the settings menu
2. WHEN the employee clicks "Change Password", THE System SHALL display a password change dialog
3. WHEN the dialog is displayed, THE System SHALL show fields for current password, new password, and confirm new password
4. WHEN the employee enters passwords, THE System SHALL validate that new password and confirm password match
5. WHEN the employee submits the form, THE System SHALL call the password change API
6. IF the password change succeeds, THEN THE System SHALL display a success message and close the dialog
7. IF the password change fails, THEN THE System SHALL display the error message
8. WHEN the form has validation errors, THE System SHALL display inline error messages

### Requirement 5: Intern Password Change UI

**User Story:** As an intern, I want to change my password from my dashboard, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN an intern accesses their dashboard, THE System SHALL provide a "Change Password" option in the settings menu
2. WHEN the intern clicks "Change Password", THE System SHALL display a password change dialog
3. WHEN the dialog is displayed, THE System SHALL show fields for current password, new password, and confirm new password
4. WHEN the intern enters passwords, THE System SHALL validate that new password and confirm password match
5. WHEN the intern submits the form, THE System SHALL call the password change API
6. IF the password change succeeds, THEN THE System SHALL display a success message and close the dialog
7. IF the password change fails, THEN THE System SHALL display the error message
8. WHEN the form has validation errors, THE System SHALL display inline error messages

### Requirement 6: Password Generation Utility

**User Story:** As a developer, I want a utility function to generate default passwords, so that password generation is consistent across the system.

#### Acceptance Criteria

1. THE System SHALL provide a function `generateDefaultPassword(fullName: string): string`
2. WHEN the function receives a full name, THE System SHALL extract the first word
3. WHEN extracting the first word, THE System SHALL capitalize the first letter
4. WHEN generating the password, THE System SHALL append "@123" to the first name
5. WHEN the name is empty or invalid, THE System SHALL return a fallback password "User@123"

### Requirement 7: Employee Creation Update

**User Story:** As an admin, I want employee creation to automatically create login credentials, so that I don't have to manually set up accounts.

#### Acceptance Criteria

1. WHEN the employee creation API is called, THE System SHALL create both Employee and User records in a transaction
2. WHEN creating the User record, THE System SHALL use the employee's email as the login email
3. WHEN the transaction succeeds, THE System SHALL return both employee and user data
4. IF either creation fails, THEN THE System SHALL rollback all changes
5. WHEN the employee already has a User account, THE System SHALL not create a duplicate

### Requirement 8: Intern Creation Update

**User Story:** As an admin, I want intern creation to automatically create login credentials, so that I don't have to manually set up accounts.

#### Acceptance Criteria

1. WHEN the intern creation API is called, THE System SHALL create both Intern and User records in a transaction
2. WHEN creating the User record, THE System SHALL use the intern's email as the login email
3. WHEN the transaction succeeds, THE System SHALL return both intern and user data
4. IF either creation fails, THEN THE System SHALL rollback all changes
5. WHEN the intern already has a User account, THE System SHALL not create a duplicate
