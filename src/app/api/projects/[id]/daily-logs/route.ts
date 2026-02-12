import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all daily logs for a project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Try to find project by ID first, then by name
        let project = await db.project.findUnique({
            where: { id },
            include: {
                dailyLogs: {
                    include: {
                        employee: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        // If not found by ID, try by name
        if (!project) {
            project = await db.project.findUnique({
                where: { name: decodeURIComponent(id) },
                include: {
                    dailyLogs: {
                        include: {
                            employee: true,
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project.dailyLogs);
    } catch (error) {
        console.error('Error fetching daily logs:', error);
        return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 });
    }
}

// POST - Add a new daily log to a project by ID
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { summary, hoursWorked, category, employeeId } = body;

        // Validate category against LogCategory enum
        const validCategories = ['General', 'Environment', 'Deployment', 'BugFix', 'Feature', 'Documentation', 'Meeting', 'Review'];
        const validCategory = validCategories.includes(category) ? category : 'General';

        // Try to find project by ID first, then by name
        let project = await db.project.findUnique({
            where: { id },
        });

        // If not found by ID, try by name
        if (!project) {
            project = await db.project.findUnique({
                where: { name: decodeURIComponent(id) },
            });
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if the employeeId is actually an intern ID
        let actualEmployeeId = employeeId;
        
        // First check if it's a valid employee
        const employee = await db.employee.findUnique({
            where: { id: employeeId },
        });

        // If not found as employee, check if it's an intern
        if (!employee) {
            const intern = await db.intern.findUnique({
                where: { id: employeeId },
            });

            if (intern) {
                // Find or create employee record for this intern
                let internEmployee = await db.employee.findFirst({
                    where: { email: intern.email },
                });

                if (!internEmployee) {
                    internEmployee = await db.employee.create({
                        data: {
                            name: intern.name,
                            email: intern.email,
                            phone: intern.phone,
                            avatarUrl: intern.avatarUrl,
                            role: 'Developer',
                            project: intern.project || 'Unassigned',
                            projects: intern.projects,
                            isActive: intern.status === 'Active',
                            enrollmentDate: intern.startDate,
                            casualLeaveQuota: 0,
                            sickLeaveQuota: 0,
                            earnedLeaveQuota: 0,
                            maternityLeaveQuota: 0,
                            paternityLeaveQuota: 0,
                            workFromHomeQuota: 0,
                        },
                    });
                }

                actualEmployeeId = internEmployee.id;
            } else {
                return NextResponse.json({ error: 'Employee or Intern not found' }, { status: 404 });
            }
        }

        const dailyLog = await db.projectDailyLog.create({
            data: {
                projectId: project.id,
                employeeId: actualEmployeeId,
                summary,
                hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
                category: validCategory,
            },
            include: {
                employee: true,
            },
        });

        return NextResponse.json(dailyLog, { status: 201 });
    } catch (error) {
        console.error('Error creating daily log:', error);
        return NextResponse.json({ error: 'Failed to create daily log' }, { status: 500 });
    }
}