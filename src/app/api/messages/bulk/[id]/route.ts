import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/bulk/[id] - Get bulk message details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bulkMessage = await db.bulkMessage.findUnique({
            where: { id: params.id },
            include: {
                notifications: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        // Get user details for the notification
                        // Note: We'll need to join with User table
                    }
                },
                _count: {
                    select: {
                        notifications: true
                    }
                }
            }
        });

        if (!bulkMessage) {
            return NextResponse.json(
                { error: 'Bulk message not found' },
                { status: 404 }
            );
        }

        // Get delivery statistics
        const stats = await db.notification.groupBy({
            by: ['deliveryStatus', 'read'],
            where: { batchId: params.id },
            _count: true
        });

        const deliveryStats = {
            total: bulkMessage.totalRecipients,
            delivered: stats.find(s => s.deliveryStatus === 'sent')?._count || 0,
            read: stats.filter(s => s.read).reduce((sum, s) => sum + s._count, 0),
            failed: stats.find(s => s.deliveryStatus === 'failed')?._count || 0
        };

        return NextResponse.json({
            ...bulkMessage,
            deliveryStats
        });

    } catch (error) {
        console.error('Error fetching bulk message:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bulk message' },
            { status: 500 }
        );
    }
}

// DELETE /api/messages/bulk/[id] - Delete bulk message (and associated notifications)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Delete associated notifications first
        await db.notification.deleteMany({
            where: { batchId: params.id }
        });

        // Delete bulk message
        await db.bulkMessage.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting bulk message:', error);
        return NextResponse.json(
            { error: 'Failed to delete bulk message' },
            { status: 500 }
        );
    }
}