import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/recipients - Get available recipients for bulk messaging
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'all';
        const filter = searchParams.get('filter');

        let recipients: any[] = [];
        let count = 0;

        switch (type) {
            case 'all':
                const allUsers = await db.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        employee: {
                            select: {
                                name: true,
                                role: true,
                                isActive: true
                            }
                        },
                        intern: {
                            select: {
                                name: true,
                                status: true
                            }
                        }
                    },
                    where: {
                        OR: [
                            { employee: { isActive: true } },
                            { intern: { status: { in: ['Active', 'Upcoming'] } } }
                        ]
                    }
                });
                recipients = allUsers.map(formatRecipient);
                count = allUsers.length;
                break;

            case 'employees':
                const employees = await db.user.findMany({
                    where: { 
                        role: 'employee',
                        employee: { isActive: true }
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        employee: {
                            select: {
                                name: true,
                                role: true,
                                project: true,
                                projects: true
                            }
                        }
                    }
                });
                recipients = employees.map(formatRecipient);
                count = employees.length;
                break;

            case 'interns':
                const interns = await db.user.findMany({
                    where: { 
                        role: 'intern',
                        intern: { status: { in: ['Active', 'Upcoming'] } }
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        intern: {
                            select: {
                                name: true,
                                status: true,
                                project: true,
                                university: true
                            }
                        }
                    }
                });
                recipients = interns.map(formatRecipient);
                count = interns.length;
                break;

            case 'roles':
                // Return available roles for filtering
                const roles = await db.employee.groupBy({
                    by: ['role'],
                    where: { isActive: true },
                    _count: true
                });
                return NextResponse.json({
                    roles: roles.map(r => ({
                        role: r.role,
                        count: r._count
                    }))
                });

            case 'projects':
                // Return available projects for filtering
                const projects = await db.project.findMany({
                    select: {
                        id: true,
                        name: true,
                        assignedTo: true
                    }
                });
                
                // Also get projects from employee.projects field
                const employeeProjects = await db.employee.findMany({
                    where: { 
                        isActive: true,
                        projects: { not: null }
                    },
                    select: { projects: true }
                });

                const projectSet = new Set();
                projects.forEach(p => projectSet.add(p.name));
                employeeProjects.forEach(emp => {
                    if (emp.projects) {
                        emp.projects.split(',').forEach(p => projectSet.add(p.trim()));
                    }
                });

                return NextResponse.json({
                    projects: Array.from(projectSet).map(name => ({ name }))
                });

            case 'role':
                if (filter) {
                    const roleUsers = await db.user.findMany({
                        where: {
                            role: 'employee',
                            employee: { 
                                role: filter as any,
                                isActive: true
                            }
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            employee: {
                                select: {
                                    name: true,
                                    role: true,
                                    project: true
                                }
                            }
                        }
                    });
                    recipients = roleUsers.map(formatRecipient);
                    count = roleUsers.length;
                }
                break;

            case 'project':
                if (filter) {
                    const projectUsers = await db.user.findMany({
                        where: {
                            role: 'employee',
                            employee: {
                                OR: [
                                    { project: filter },
                                    { projects: { contains: filter } }
                                ],
                                isActive: true
                            }
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            employee: {
                                select: {
                                    name: true,
                                    role: true,
                                    project: true
                                }
                            }
                        }
                    });
                    recipients = projectUsers.map(formatRecipient);
                    count = projectUsers.length;
                }
                break;
        }

        return NextResponse.json({
            recipients,
            count,
            type
        });

    } catch (error) {
        console.error('Error fetching recipients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recipients' },
            { status: 500 }
        );
    }
}

function formatRecipient(user: any) {
    const profile = user.employee || user.intern;
    return {
        id: user.id,
        name: profile?.name || user.name,
        email: user.email,
        role: user.role,
        employeeRole: user.employee?.role,
        project: profile?.project,
        status: user.intern?.status,
        university: user.intern?.university
    };
}