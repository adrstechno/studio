import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Assign project(s) to employee
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { project, projects } = body;

        if (!project && (!projects || projects.length === 0)) {
            return NextResponse.json({ error: 'Project name or projects array is required' }, { status: 400 });
        }

        // Handle multiple projects
        let projectsToAssign: string[] = [];
        let primaryProject = '';

        if (projects && Array.isArray(projects) && projects.length > 0) {
            // Multiple projects provided
            projectsToAssign = projects;
            primaryProject = projects[0]; // First project is primary
        } else if (project) {
            // Single project provided (backward compatibility)
            projectsToAssign = [project];
            primaryProject = project;
        }

        // Verify all projects exist
        for (const projectName of projectsToAssign) {
            const projectExists = await db.project.findUnique({
                where: { name: projectName },
            });

            if (!projectExists) {
                return NextResponse.json({ error: `Project "${projectName}" not found` }, { status: 404 });
            }
        }

        // Check if there's an existing team lead for this primary project
        const existingTeamLead = await db.employee.findFirst({
            where: {
                project: primaryProject,
                role: 'TeamLead',
                id: { not: id }, // Exclude current employee
            },
        });

        // Get current employee to check their current state
        const currentEmployee = await db.employee.findUnique({
            where: { id },
        });

        if (!currentEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Determine the new role based on assignment
        let newRole = currentEmployee.role;
        
        // If assigning as primary project and they're not already a TeamLead of another project
        if (primaryProject && primaryProject !== 'Unassigned') {
            // If there's an existing TeamLead for this project, demote them
            if (existingTeamLead) {
                await db.employee.update({
                    where: { id: existingTeamLead.id },
                    data: { role: 'Developer' },
                });
            }
            
            // Make this employee the TeamLead of the primary project
            newRole = 'TeamLead';
        }

        // Update employee with projects and role
        const employee = await db.employee.update({
            where: { id },
            data: { 
                project: primaryProject, // Primary project for backward compatibility
                projects: JSON.stringify(projectsToAssign), // All projects as JSON array
                role: newRole, // Assign appropriate role
            },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error assigning project:', error);
        return NextResponse.json({ error: 'Failed to assign project' }, { status: 500 });
    }
}
