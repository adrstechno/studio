import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET team members (employees + interns) for a specific project
export async function GET(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        const projectName = decodeURIComponent(params.name);

        // Get all active employees
        const employees = await db.employee.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                project: true,
                projects: true,
            },
        });

        // Filter employees assigned to this project
        const projectEmployees = employees.filter((emp) => {
            let empProjects: string[] = [];
            if (emp.projects) {
                try {
                    empProjects = JSON.parse(emp.projects);
                } catch {
                    empProjects = [emp.project];
                }
            } else if (emp.project && emp.project !== 'Unassigned') {
                empProjects = [emp.project];
            }
            return empProjects.includes(projectName);
        });

        // Get all active interns
        const interns = await db.intern.findMany({
            where: {
                status: {
                    in: ['Upcoming', 'Active'],
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                university: true,
                project: true,
                projects: true,
                status: true,
            },
        });

        // Filter interns assigned to this project
        const projectInterns = interns.filter((intern) => {
            let internProjects: string[] = [];
            if (intern.projects) {
                try {
                    internProjects = JSON.parse(intern.projects);
                } catch {
                    internProjects = [intern.project];
                }
            } else if (intern.project && intern.project !== 'Unassigned') {
                internProjects = [intern.project];
            }
            return internProjects.includes(projectName);
        });

        // Format response with type indicator
        const teamMembers = [
            ...projectEmployees.map((emp) => ({
                id: emp.id,
                name: emp.name,
                email: emp.email,
                avatarUrl: emp.avatarUrl,
                type: 'Employee' as const,
                role: emp.role,
            })),
            ...projectInterns.map((intern) => ({
                id: intern.id,
                name: intern.name,
                email: intern.email,
                avatarUrl: intern.avatarUrl,
                type: 'Intern' as const,
                university: intern.university,
                status: intern.status,
            })),
        ];

        return NextResponse.json(teamMembers);
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team members' },
            { status: 500 }
        );
    }
}
