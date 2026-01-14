import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update leave request status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, adminComment } = body;

        if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const leaveRequest = await db.leaveRequest.update({
            where: { id },
            data: { 
                status,
                ...(adminComment && { adminComment }),
            },
            include: { employee: true },
        });

        return NextResponse.json(leaveRequest);
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
    }
}

// DELETE - Delete leave request (only if pending)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if leave request exists and is pending
        const leaveRequest = await db.leaveRequest.findUnique({
            where: { id },
        });

        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (leaveRequest.status !== 'Pending') {
            return NextResponse.json({ error: 'Can only delete pending leave requests' }, { status: 400 });
        }

        await db.leaveRequest.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
    }
}
