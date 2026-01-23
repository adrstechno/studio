import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';

// PUT - Update attendance record
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, checkIn, checkOut } = body;

        const attendance = await withRetry(async () => {
            return await db.attendance.update({
                where: { id },
                data: { status, checkIn, checkOut },
            });
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
    }
}

// DELETE - Remove attendance record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await withRetry(async () => {
            return await db.attendance.delete({ where: { id } });
        });
        return NextResponse.json({ message: 'Attendance record deleted' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 });
    }
}

// PATCH - Partial update attendance record (for punch out)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const attendance = await withRetry(async () => {
            return await db.attendance.update({
                where: { id },
                data: body,
            });
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
    }
}
