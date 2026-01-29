import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/test - Test bulk messaging functionality
export async function GET(request: NextRequest) {
    try {
        // Test 1: Check if we can create a bulk message
        const testBulkMessage = await db.bulkMessage.create({
            data: {
                title: 'Test Message',
                message: 'This is a test bulk message to verify the system works.',
                type: 'general',
                priority: 'medium',
                recipientType: 'all',
                sentBy: 'test-admin-id',
                totalRecipients: 0,
                status: 'draft'
            }
        });

        // Test 2: Check if we can create a notification with batchId
        const testNotification = await db.notification.create({
            data: {
                userId: 'test-user-id',
                type: 'general',
                priority: 'medium',
                title: 'Test Notification',
                message: 'This is a test notification.',
                batchId: testBulkMessage.id,
                deliveryStatus: 'sent',
                read: false
            }
        });

        // Test 3: Check if we can query the relationship
        const bulkMessageWithNotifications = await db.bulkMessage.findUnique({
            where: { id: testBulkMessage.id },
            include: {
                notifications: true,
                _count: {
                    select: { notifications: true }
                }
            }
        });

        // Clean up test data
        await db.notification.delete({ where: { id: testNotification.id } });
        await db.bulkMessage.delete({ where: { id: testBulkMessage.id } });

        return NextResponse.json({
            success: true,
            message: 'Bulk messaging system is working correctly!',
            tests: {
                bulkMessageCreation: !!testBulkMessage,
                notificationCreation: !!testNotification,
                relationshipQuery: !!bulkMessageWithNotifications,
                notificationCount: bulkMessageWithNotifications?._count.notifications || 0
            }
        });

    } catch (error) {
        console.error('Error testing bulk messaging:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Bulk messaging system test failed'
        }, { status: 500 });
    }
}