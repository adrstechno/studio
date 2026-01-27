import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all tasks
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');
        const projectId = searchParams.get('projectId');
        const assigneeType = searchParams.get('assigneeType');

        const where: Record<string, unknown> = {};
        if (assigneeId) {
            if (assigneeType === 'Intern') {
                where.internId = assigneeId;
            } else {
                where.assigneeId = assigneeId;
            }
        }
        if (projectId) where.projectId = projectId;

        const tasks = await db.task.findMany({
            where,
            include: {
                assignee: true,
                intern: true,
                project: true,
                submissions: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST - Create new task
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));

        const {
            title,
            description,
            assigneeId,
            assigneeType,
            projectId,
            status,
            priority,
            dueDate,
            attachments,
            approvalStatus,
            requestedBy
        } = body;

        if (!title) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        }

        if (!assigneeId || !assigneeType) {
            return NextResponse.json({ error: 'Assignee information is required' }, { status: 400 });
        }

        // If projectId is provided, validate it
        let project = null;
        if (projectId) {
            project = await db.project.findUnique({
                where: { id: projectId }
            });

            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }
        }

        // Validate assignee exists
        if (assigneeType === 'Intern') {
            const intern = await db.intern.findUnique({
                where: { id: assigneeId }
            });

            if (!intern) {
                return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
            }

            // Only check project assignment if a project is specified
            if (projectId && project) {
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

                if (!internProjects.includes(project.name)) {
                return NextResponse.json({
                    error: 'Intern is not assigned to this project'
                }, { status: 400 });
            }
            }
        } else {
            const employee = await db.employee.findUnique({
                where: { id: assigneeId }
            });

            if (!employee) {
                return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
            }

            // Only check project assignment if a project is specified
            if (projectId && project) {
                let employeeProjects: string[] = [];
                if (employee.projects) {
                    try {
                        employeeProjects = JSON.parse(employee.projects);
                    } catch {
                        employeeProjects = [employee.project];
                    }
                } else if (employee.project && employee.project !== 'Unassigned') {
                    employeeProjects = [employee.project];
                }

                if (!employeeProjects.includes(project.name)) {
                    return NextResponse.json({
                        error: 'Employee is not assigned to this project'
                    }, { status: 400 });
                }
            }
        }

        // Create task with appropriate assignee field
        const taskData: any = {
            title,
            description,
            assigneeType,
            projectId,
            status: status || 'ToDo',
            priority: priority || 'Medium',
            dueDate: dueDate ? new Date(dueDate) : null,
            attachments,
            approvalStatus: approvalStatus || 'Approved',
            requestedBy,
        };

        if (assigneeType === 'Intern') {
            taskData.internId = assigneeId;
        } else {
            taskData.assigneeId = assigneeId;
        }

        const task = await db.task.create({
            data: taskData,
            include: {
                assignee: true,
                intern: true,
                project: true,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
