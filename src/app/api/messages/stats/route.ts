import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/stats - Get messaging statistics
export async function GET(request: NextRequest) {
    try {
        // Get bulk message statistics
        const bulkMessageStats = await db.bulkMessage.groupBy({
            by: ['status'],
            _count: true,
            _sum: {
                totalRecipients: true,
                deliveredCount: true,
                readCount: true
            }
        });

        // Get recent bulk messages
        const recentMessages = await db.bulkMessage.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                status: true,
                totalRecipients: true,
                deliveredCount: true,
                readCount: true,
                createdAt: true
            }
        });

        // Get notification statistics by type
        const notificationsByType = await db.notification.groupBy({
            by: ['type'],
            where: {
                batchId: { not: null } // Only bulk notifications
            },
            _count: true
        });

        // Calculate overall statistics
        const totalMessages = bulkMessageStats.reduce((sum, stat) => sum + stat._count, 0);
        const totalRecipients = bulkMessageStats.reduce((sum, stat) => sum + (stat._sum.totalRecipients || 0), 0);
        const totalDelivered = bulkMessageStats.reduce((sum, stat) => sum + (stat._sum.deliveredCount || 0), 0);
        const totalRead = bulkMessageStats.reduce((sum, stat) => sum + (stat._sum.readCount || 0), 0);

        const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;
        const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

        // Get status breakdown
        const statusBreakdown = {
            draft: 0,
            scheduled: 0,
            sending: 0,
            sent: 0,
            failed: 0
        };

        bulkMessageStats.forEach(stat => {
            statusBreakdown[stat.status as keyof typeof statusBreakdown] = stat._count;
        });

        return NextResponse.json({
            overview: {
                totalMessages,
                totalRecipients,
                totalDelivered,
                totalRead,
                deliveryRate,
                readRate
            },
            statusBreakdown,
            notificationsByType: notificationsByType.map(item => ({
                type: item.type,
                count: item._count
            })),
            recentMessages
        });

    } catch (error) {
        console.error('Error fetching message statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch message statistics' },
            { status: 500 }
        );
    }
}