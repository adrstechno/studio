import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET current employee data based on Firebase email
export async function GET(request: NextRequest) {
    try {
        // Get email from query params (passed from client)
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find employee by loginEmail (Firebase email) or fallback to personal email
        // Also try partial matching for cases where Firebase email might be shortened
        let employee = await db.employee.findFirst({
            where: {
                OR: [
                    { loginEmail: email },
                    { email: email },
                    // Try partial matching - if email is like "sapeksh@adrs.com", 
                    // find "sapekshvishwakarma@adrs.com"
                    { loginEmail: { startsWith: email.split('@')[0] } },
                ]
            }
        });

        // If still not found, try more flexible matching
        if (!employee && email.includes('@adrs.com')) {
            const emailPrefix = email.split('@')[0];
            employee = await db.employee.findFirst({
                where: {
                    loginEmail: {
                        contains: emailPrefix
                    }
                }
            });
        }

        if (!employee) {
            return NextResponse.json({ 
                error: 'Employee not found',
                message: `No employee profile found for ${email}. Please contact your administrator to verify your email address.`
            }, { status: 404 });
        }

        // Parse projects from JSON string
        let allProjects: string[] = [];
        if (employee.projects) {
            try {
                allProjects = JSON.parse(employee.projects);
            } catch {
                // Fallback to primary project if JSON parsing fails
                if (employee.project && employee.project !== 'Unassigned') {
                    allProjects = [employee.project];
                }
            }
        } else if (employee.project && employee.project !== 'Unassigned') {
            allProjects = [employee.project];
        }

        // Get project details for all assigned projects
        const projectDetails = await db.project.findMany({
            where: {
                name: {
                    in: allProjects
                }
            },
            include: {
                tasks: {
                    where: {
                        assigneeId: employee.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // For each project, get team members if user is TeamLead
        const projectsWithTeams = await Promise.all(
            projectDetails.map(async (project) => {
                let teamMembers: {
                    // Show actual role only if this is their primary project
                    // Otherwise show as "Member" for secondary projects
                    role: string; name: string; id: string; email: string; avatarUrl: string | null; project: string;
                }[] = [];
                
                // If employee is TeamLead and this is their primary project, get team
                if (employee.role === 'TeamLead' && employee.project === project.name) {
                    teamMembers = await db.employee.findMany({
                        where: {
                            OR: [
                                { project: project.name },
                                { projects: { contains: `"${project.name}"` } }
                            ]
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true,
                            role: true,
                            project: true // Include primary project to determine actual role in this project
                        }
                    });

                    // Adjust roles based on whether this project is their primary project
                    teamMembers = teamMembers.map(member => ({
                        ...member,
                        // Show actual role only if this is their primary project
                        // Otherwise show as "Member" for secondary projects
                        role: member.project === project.name ? member.role : 'Member'
                    }));
                }

                return {
                    ...project,
                    team: teamMembers,
                    isPrimary: employee.project === project.name
                };
            })
        );

        return NextResponse.json({
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                project: employee.project,
                projects: allProjects,
                avatarUrl: employee.avatarUrl
            },
            projects: projectsWithTeams
        });

    } catch (error) {
        console.error('Error fetching employee data:', error);
        return NextResponse.json({ error: 'Failed to fetch employee data' }, { status: 500 });
    }
}