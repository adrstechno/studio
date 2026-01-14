import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a daily log
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string; logId: string }> }
) {
    try {
        const { logId } = await params;

        await db.projectDailyLog.delete({
            where: { id: logId },
        });

        return NextResponse.json({ message: 'Daily log deleted successfully' });
    } catch (error) {
        console.error('Error deleting daily log:', error);
        return NextResponse.json({ error: 'Failed to delete daily log' }, { status: 500 });
    }
}

// PATCH - Update a daily log
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ name: string; logId: string }> }
) {
    try {
        const { logId } = await params;
        const body = await request.json();
        const { summary, hoursWorked, category } = body;

        const log = await db.projectDailyLog.update({
            where: { id: logId },
            data: {
                ...(summary && { summary }),
                ...(hoursWorked !== undefined && { hoursWorked: parseFloat(hoursWorked) }),
                ...(category && { category }),
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

        return NextResponse.json(log);
    } catch (error) {
        console.error('Error updating daily log:', error);
        return NextResponse.json({ error: 'Failed to update daily log' }, { status: 500 });
    }
}
