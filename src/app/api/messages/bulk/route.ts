import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification-utils';

// POST /api/messages/bulk - Create and send bulk message
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Bulk message request body:', body); // Debug log
        
        const {
            title,
            message,
            type = 'general',
            priority = 'medium',
            recipientType,
            recipientFilter,
            scheduledAt,
            sentBy,
            actionUrl,
            actionLabel,
            metadata
        } = body;

        console.log('Extracted values:', { title, message, recipientType, sentBy }); // Debug log

        if (!title || !message || !recipientType || !sentBy) {
            console.log('Missing required fields:', { 
                title: !!title, 
                message: !!message, 
                recipientType: !!recipientType, 
                sentBy: !!sentBy 
            }); // Debug log
            
            return NextResponse.json(
                { error: 'Title, message, recipientType, and sentBy are required' },
                { status: 400 }
            );
        }

        // Get recipients based on type
        const recipients = await getRecipients(recipientType, recipientFilter);
        
        if (recipients.length === 0) {
            return NextResponse.json(
                { error: 'No recipients found for the specified criteria' },
                { status: 400 }
            );
        }

        // Create bulk message record
        const bulkMessage = await db.bulkMessage.create({
            data: {
                title,
                message,
                type,
                priority,
                recipientType,
                recipientFilter: recipientFilter ? JSON.stringify(recipientFilter) : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                sentBy,
                totalRecipients: recipients.length,
                actionUrl,
                actionLabel,
                metadata: metadata ? JSON.stringify(metadata) : null,
                status: scheduledAt ? 'scheduled' : 'sending'
            }
        });

        // If not scheduled, send immediately
        if (!scheduledAt) {
            await sendBulkMessage(bulkMessage.id, recipients);
        }

        return NextResponse.json({
            id: bulkMessage.id,
            totalRecipients: recipients.length,
            status: bulkMessage.status,
            scheduledAt: bulkMessage.scheduledAt
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating bulk message:', error);
        return NextResponse.json(
            { error: 'Failed to create bulk message' },
            { status: 500 }
        );
    }
}

// GET /api/messages/bulk - Get bulk messages history
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const bulkMessages = await db.bulkMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                _count: {
                    select: { notifications: true }
                }
            }
        });

        const total = await db.bulkMessage.count();

        return NextResponse.json({
            messages: bulkMessages,
            total,
            hasMore: offset + limit < total
        });

    } catch (error) {
        console.error('Error fetching bulk messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bulk messages' },
            { status: 500 }
        );
    }
}

// Helper function to get recipients based on type
async function getRecipients(recipientType: string, recipientFilter?: any): Promise<string[]> {
    let userIds: string[] = [];

    switch (recipientType) {
        case 'all':
            const allUsers = await db.user.findMany({
                select: { id: true }
            });
            userIds = allUsers.map(u => u.id);
            break;

        case 'employees':
            const employees = await db.user.findMany({
                where: { 
                    role: 'employee',
                    employee: { isActive: true }
                },
                select: { id: true }
            });
            userIds = employees.map(u => u.id);
            break;

        case 'interns':
            const interns = await db.user.findMany({
                where: { 
                    role: 'intern',
                    intern: { status: { in: ['Active', 'Upcoming'] } }
                },
                select: { id: true }
            });
            userIds = interns.map(u => u.id);
            break;

        case 'role':
            if (recipientFilter?.role) {
                const roleUsers = await db.user.findMany({
                    where: {
                        role: 'employee',
                        employee: { 
                            role: recipientFilter.role,
                            isActive: true
                        }
                    },
                    select: { id: true }
                });
                userIds = roleUsers.map(u => u.id);
            }
            break;

        case 'project':
            if (recipientFilter?.projectName) {
                const projectUsers = await db.user.findMany({
                    where: {
                        role: 'employee',
                        employee: {
                            projects: { contains: recipientFilter.projectName },
                            isActive: true
                        }
                    },
                    select: { id: true }
                });
                userIds = projectUsers.map(u => u.id);
            }
            break;

        case 'custom':
            if (recipientFilter?.userIds) {
                userIds = recipientFilter.userIds;
            }
            break;
    }

    return userIds;
}

// Helper function to send bulk message
async function sendBulkMessage(bulkMessageId: string, recipients: string[]) {
    try {
        // Update status to sending
        await db.bulkMessage.update({
            where: { id: bulkMessageId },
            data: { status: 'sending' }
        });

        const bulkMessage = await db.bulkMessage.findUnique({
            where: { id: bulkMessageId }
        });

        if (!bulkMessage) return;

        // Create notifications for all recipients
        const notifications = recipients.map(userId => ({
            userId,
            type: bulkMessage.type,
            priority: bulkMessage.priority,
            title: bulkMessage.title,
            message: bulkMessage.message,
            actionUrl: bulkMessage.actionUrl,
            actionLabel: bulkMessage.actionLabel,
            metadata: bulkMessage.metadata,
            batchId: bulkMessageId,
            deliveryStatus: 'sent' as const
        }));

        // Batch create notifications
        await db.notification.createMany({
            data: notifications
        });

        // Update bulk message status
        await db.bulkMessage.update({
            where: { id: bulkMessageId },
            data: {
                status: 'sent',
                sentAt: new Date(),
                deliveredCount: recipients.length
            }
        });

    } catch (error) {
        console.error('Error sending bulk message:', error);
        
        // Update status to failed
        await db.bulkMessage.update({
            where: { id: bulkMessageId },
            data: { status: 'failed' }
        });
    }
}