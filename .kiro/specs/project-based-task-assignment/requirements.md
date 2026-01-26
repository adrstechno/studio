# Requirements Document

## Introduction

This feature enhances the task assignment system to support project-based filtering and intern assignment. Currently, tasks can only be assigned to employees, and the assignment interface shows all employees regardless of project membership. This enhancement will ensure tasks are assigned only to team members (employees or interns) who are already part of the selected project.

## Glossary

- **Task_Assignment_System**: The system component responsible for creating and assigning tasks to team members
- **Project**: A work initiative with assigned team members (employees and/or interns)
- **Employee**: A full-time team member who can be assigned to one or more projects
- **Intern**: A temporary team member who can be assigned to one or more projects
- **Team_Member**: Either an Employee or an Intern who is assigned to a project
- **Assignee**: The Team_Member to whom a task is assigned
- **Project_Membership**: The relationship indicating a Team_Member is part of a specific Project

## Requirements

### Requirement 1: Project-Based Team Member Filtering

**User Story:** As a task creator, I want to select a project first and then see only team members assigned to that project, so that I can assign tasks to the right people.

#### Acceptance Criteria

1. WHEN creating a task, THE Task_Assignment_System SHALL require project selection before showing assignee options
2. WHEN a project is selected, THE Task_Assignment_System SHALL display only Team_Members who are assigned to that project
3. WHEN no project is selected, THE Task_Assignment_System SHALL disable the assignee selection field
4. WHEN a project has no assigned Team_Members, THE Task_Assignment_System SHALL display a message indicating no team members are available
5. WHEN the selected project changes, THE Task_Assignment_System SHALL clear any previously selected assignee and update the available Team_Members list

### Requirement 2: Intern Task Assignment Support

**User Story:** As a task creator, I want to assign tasks to interns as well as employees, so that I can manage work for all team members.

#### Acceptance Criteria

1. WHEN displaying assignee options, THE Task_Assignment_System SHALL include both Employees and Interns assigned to the selected project
2. WHEN an Intern is selected as assignee, THE Task_Assignment_System SHALL create the task with the Intern as the assignee
3. WHEN displaying the assignee list, THE Task_Assignment_System SHALL clearly indicate whether each Team_Member is an Employee or Intern
4. THE Task_Assignment_System SHALL support storing task assignments to both Employee and Intern types in the database

### Requirement 3: Database Schema Enhancement

**User Story:** As a system architect, I want the database to support task assignments to both employees and interns, so that the system can handle diverse team compositions.

#### Acceptance Criteria

1. THE Database_Schema SHALL support storing either an Employee ID or an Intern ID as the task assignee
2. THE Database_Schema SHALL maintain referential integrity for task assignments to both Employees and Interns
3. WHEN a task is assigned to an Intern, THE Database_Schema SHALL store the Intern's ID in the appropriate field
4. WHEN a task is assigned to an Employee, THE Database_Schema SHALL store the Employee's ID in the appropriate field
5. THE Database_Schema SHALL allow querying tasks by either Employee or Intern assignee

### Requirement 4: Task Display and Filtering

**User Story:** As a user viewing tasks, I want to see tasks assigned to both employees and interns, so that I have a complete view of all work.

#### Acceptance Criteria

1. WHEN displaying tasks, THE Task_Assignment_System SHALL show tasks assigned to both Employees and Interns
2. WHEN displaying task details, THE Task_Assignment_System SHALL clearly indicate whether the assignee is an Employee or Intern
3. WHEN filtering tasks by assignee, THE Task_Assignment_System SHALL support filtering by both Employee and Intern assignees
4. WHEN an Intern's status changes to Completed or Terminated, THE Task_Assignment_System SHALL still display their historical task assignments

### Requirement 5: Project Membership Validation

**User Story:** As a system administrator, I want to ensure tasks are only assigned to team members who are part of the project, so that work assignments remain organized and valid.

#### Acceptance Criteria

1. WHEN creating a task, THE Task_Assignment_System SHALL validate that the selected assignee is assigned to the selected project
2. IF an assignee is not assigned to the selected project, THEN THE Task_Assignment_System SHALL prevent task creation and display an error message
3. WHEN a Team_Member is removed from a project, THE Task_Assignment_System SHALL allow viewing their existing tasks but prevent new task assignments to that project
4. THE Task_Assignment_System SHALL parse both single project strings and JSON arrays of projects for determining Project_Membership

### Requirement 6: User Interface Workflow

**User Story:** As a task creator, I want a clear step-by-step workflow for task assignment, so that I understand the process and make correct assignments.

#### Acceptance Criteria

1. THE Task_Assignment_System SHALL present project selection as the first step in task creation
2. THE Task_Assignment_System SHALL present assignee selection as the second step, enabled only after project selection
3. THE Task_Assignment_System SHALL present task details (title, description, priority, due date) as the final step
4. WHEN displaying the assignee dropdown, THE Task_Assignment_System SHALL group or label Employees and Interns separately
5. THE Task_Assignment_System SHALL display the count of available Team_Members for the selected project
