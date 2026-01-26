# Requirements Document

## Introduction

This document specifies the requirements for an Interns Management System that enables administrators to manage interns separately from full-time employees. The system will track intern-specific information including internship duration, mentor assignments, stipend details, and performance evaluations while integrating with the existing project and task management infrastructure.

## Glossary

- **Intern**: A temporary team member enrolled in an internship program with a defined start and end date
- **Mentor**: A full-time employee assigned to guide and supervise an intern
- **Stipend**: Monthly payment provided to interns during their internship period
- **Internship_Period**: The duration from start date to end date of an internship
- **Performance_Evaluation**: Periodic assessment of an intern's work and progress
- **System**: The Interns Management System
- **Admin**: User with administrative privileges to manage interns
- **Database**: PostgreSQL database storing intern records

## Requirements

### Requirement 1: Intern Profile Management

**User Story:** As an admin, I want to create and manage intern profiles, so that I can track all intern information in one place.

#### Acceptance Criteria

1. WHEN an admin creates a new intern profile, THE System SHALL store name, email, phone, university, degree, start date, end date, stipend amount, and mentor assignment
2. WHEN an admin creates an intern with an email that already exists, THE System SHALL reject the creation and return an error message
3. WHEN an admin updates an intern profile, THE System SHALL validate all required fields and save the changes
4. WHEN an admin views an intern profile, THE System SHALL display all intern information including current status
5. THE System SHALL automatically calculate internship duration based on start and end dates

### Requirement 2: Intern Status Tracking

**User Story:** As an admin, I want to track intern status, so that I can see which interns are active, completed, or terminated.

#### Acceptance Criteria

1. WHEN an intern's start date arrives, THE System SHALL automatically set status to Active
2. WHEN an intern's end date passes, THE System SHALL automatically set status to Completed
3. WHEN an admin terminates an internship early, THE System SHALL set status to Terminated and record termination date
4. WHEN displaying intern lists, THE System SHALL filter by status (Active, Completed, Terminated, Upcoming)
5. THE System SHALL display status badges with appropriate colors for each status type

### Requirement 3: Mentor Assignment

**User Story:** As an admin, I want to assign mentors to interns, so that each intern has proper guidance.

#### Acceptance Criteria

1. WHEN an admin assigns a mentor to an intern, THE System SHALL link the intern to an existing employee record
2. WHEN displaying an intern's profile, THE System SHALL show the assigned mentor's name and contact information
3. WHEN an admin views a mentor's profile, THE System SHALL list all interns currently assigned to that mentor
4. WHEN a mentor is deactivated, THE System SHALL flag all their assigned interns for mentor reassignment
5. THE System SHALL allow changing an intern's mentor at any time

### Requirement 4: Intern API Endpoints

**User Story:** As a developer, I want RESTful API endpoints for intern operations, so that the frontend can interact with intern data.

#### Acceptance Criteria

1. THE System SHALL provide a POST endpoint at /api/interns to create new intern records
2. THE System SHALL provide a GET endpoint at /api/interns to retrieve all interns with optional filtering
3. THE System SHALL provide a GET endpoint at /api/interns/[id] to retrieve a specific intern
4. THE System SHALL provide a PUT endpoint at /api/interns/[id] to update intern information
5. THE System SHALL provide a DELETE endpoint at /api/interns/[id] to remove intern records
6. THE System SHALL provide a POST endpoint at /api/interns/[id]/assign-mentor to assign or change mentors
7. THE System SHALL provide a GET endpoint at /api/interns/[id]/evaluations to retrieve performance evaluations
8. WHEN any API endpoint receives invalid data, THE System SHALL return appropriate HTTP status codes and error messages

### Requirement 5: Project and Task Assignment

**User Story:** As an admin, I want to assign interns to projects and tasks, so that they can contribute to team work.

#### Acceptance Criteria

1. WHEN an admin assigns an intern to a project, THE System SHALL add the intern to the project team
2. WHEN an admin creates a task for an intern, THE System SHALL link the task to the intern's record
3. WHEN displaying project teams, THE System SHALL distinguish interns from full-time employees
4. WHEN an intern's internship ends, THE System SHALL automatically unassign them from active projects
5. THE System SHALL allow interns to be assigned to multiple projects simultaneously

### Requirement 6: Attendance and Leave Management

**User Story:** As an admin, I want to track intern attendance and leave, so that I can monitor their participation.

#### Acceptance Criteria

1. WHEN an intern marks attendance, THE System SHALL record check-in and check-out times
2. WHEN an intern requests leave, THE System SHALL create a leave request with Pending status
3. WHEN an admin approves or rejects leave, THE System SHALL update the leave request status
4. THE System SHALL calculate total working days for each intern based on attendance records
5. THE System SHALL provide leave quotas specific to interns (different from employee quotas)

### Requirement 7: Performance Evaluations

**User Story:** As a mentor, I want to submit performance evaluations for my interns, so that their progress is documented.

#### Acceptance Criteria

1. WHEN a mentor submits an evaluation, THE System SHALL store the evaluation date, rating, feedback, and skills assessment
2. WHEN displaying an intern's profile, THE System SHALL show all historical evaluations
3. THE System SHALL allow evaluations to be submitted at any time during the internship
4. THE System SHALL calculate an average rating across all evaluations for each intern
5. WHEN an evaluation is submitted, THE System SHALL notify the intern via email

### Requirement 8: Stipend Tracking

**User Story:** As an admin, I want to track stipend payments, so that I can manage intern compensation.

#### Acceptance Criteria

1. WHEN an intern profile is created, THE System SHALL store the monthly stipend amount
2. WHEN an admin records a stipend payment, THE System SHALL store payment date, amount, and payment method
3. WHEN displaying an intern's profile, THE System SHALL show payment history and pending payments
4. THE System SHALL calculate total stipend paid and remaining payments based on internship duration
5. WHEN an internship ends, THE System SHALL mark all stipend records as finalized

### Requirement 9: Search and Filtering

**User Story:** As an admin, I want to search and filter interns, so that I can quickly find specific records.

#### Acceptance Criteria

1. WHEN an admin enters a search query, THE System SHALL search by name, email, university, or mentor name
2. WHEN an admin applies filters, THE System SHALL filter by status, mentor, project, or date range
3. WHEN displaying search results, THE System SHALL highlight matching text
4. THE System SHALL support combining multiple filters simultaneously
5. THE System SHALL display result count and pagination for large result sets

### Requirement 10: Data Validation and Security

**User Story:** As a system administrator, I want proper data validation and security, so that intern data remains accurate and protected.

#### Acceptance Criteria

1. WHEN creating or updating intern records, THE System SHALL validate email format, date ranges, and required fields
2. WHEN an intern's end date is before start date, THE System SHALL reject the input
3. WHEN accessing intern APIs, THE System SHALL verify user authentication and authorization
4. THE System SHALL prevent unauthorized users from accessing intern data
5. WHEN storing sensitive information, THE System SHALL encrypt stipend amounts and contact details

### Requirement 11: Reporting and Analytics

**User Story:** As an admin, I want to view intern statistics and reports, so that I can analyze the internship program.

#### Acceptance Criteria

1. WHEN an admin views the dashboard, THE System SHALL display total active interns, completed internships, and average duration
2. THE System SHALL provide a report showing interns by university and degree program
3. THE System SHALL calculate average performance ratings across all interns
4. THE System SHALL show mentor workload (number of interns per mentor)
5. THE System SHALL generate monthly reports of stipend expenditure

### Requirement 12: Integration with Existing Systems

**User Story:** As a developer, I want the intern system to integrate with existing employee, project, and task systems, so that data remains consistent.

#### Acceptance Criteria

1. WHEN an intern is assigned to a project, THE System SHALL use the existing Project model and relationships
2. WHEN an intern is assigned a task, THE System SHALL use the existing Task model
3. WHEN an intern marks attendance, THE System SHALL use the existing Attendance model
4. THE System SHALL maintain referential integrity between Intern and related models
5. WHEN an intern transitions to full-time employee, THE System SHALL provide a conversion function that creates an Employee record
