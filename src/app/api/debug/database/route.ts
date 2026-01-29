import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/debug/database - Check database connection and tables
export async function GET(request: NextRequest) {
    try {
        // Test database connection
        const userCount = await db.user.count();
        const employeeCount = await db.employee.count();
        const internCount = await db.intern.count();
        const projectCount = await db.project.count();
        const notificationCount = await db.notification.count();
        const bulkMessageCount = await db.bulkMessage.count();

        // Get sample users
        const users = await db.user.findMany({
            take: 5,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            status: 'connected',
            message: 'Database connection successful',
            counts: {
                users: userCount,
                employees: employeeCount,
                interns: internCount,
                projects: projectCount,
                notifications: notificationCount,
                bulkMessages: bulkMessageCount
            },
            sampleUsers: users,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Database debug error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}