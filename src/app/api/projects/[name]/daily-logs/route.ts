import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all daily logs for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const decodedName = decodeURIComponent(name);
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const date = searchParams.get('date');

        const project = await db.project.findUnique({
            where: { name: decodedName },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const whereClause: any = { projectId: project.id };

        if (employeeId) {
            whereClause.employeeId = employeeId;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const logs = await db.projectDailyLog.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching daily logs:', error);
        return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 });
    }
}

// POST - Add a new daily log
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const decodedName = decodeURIComponent(name);
        const body = await request.json();
        const { employeeId, summary, hoursWorked, category, date } = body;

        const project = await db.project.findUnique({
            where: { name: decodedName },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const log = await db.projectDailyLog.create({
            data: {
                projectId: project.id,
                employeeId,
                summary,
                hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
                category: category || 'General',
                date: date ? new Date(date) : new Date(),
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        console.error('Error creating daily log:', error);
        return NextResponse.json({ error: 'Failed to create daily log' }, { status: 500 });
    }
}
