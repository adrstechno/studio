import { db } from '@/lib/db';
import { NotificationType, NotificationPriority } from '@/contexts/notification-context';

export interface BulkMessageParams {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  recipientType: 'all' | 'employees' | 'interns' | 'role' | 'project' | 'custom';
  recipientFilter?: {
    role?: string;
    project?: string;
    userIds?: string[];
  };
  sentBy: string;
  actionUrl?: string;
  actionLabel?: string;
  scheduledAt?: Date;
}

export async function sendBulkMessage(params: BulkMessageParams) {
  try {
    // Get recipients based on type
    const recipients = await getRecipients(params.recipientType, params.recipientFilter);
    
    if (recipients.length === 0) {
      throw new Error('No recipients found for the specified criteria');
    }

    // Create bulk message record
    const bulkMessage = await db.bulkMessage.create({
      data: {
        title: params.title,
        message: params.message,
        type: params.type || 'general',
        priority: params.priority || 'medium',
        recipientType: params.recipientType,
        recipientFilter: params.recipientFilter ? JSON.stringify(params.recipientFilter) : null,
        scheduledAt: params.scheduledAt,
        sentBy: params.sentBy,
        totalRecipients: recipients.length,
        actionUrl: params.actionUrl,
        actionLabel: params.actionLabel,
        status: params.scheduledAt ? 'scheduled' : 'sending'
      }
    });

    // If not scheduled, send immediately
    if (!params.scheduledAt) {
      await processBulkMessage(bulkMessage.id, recipients);
    }

    return {
      id: bulkMessage.id,
      totalRecipients: recipients.length,
      status: bulkMessage.status,
      scheduledAt: bulkMessage.scheduledAt
    };

  } catch (error) {
    console.error('Error sending bulk message:', error);
    throw error;
  }
}

async function getRecipients(recipientType: string, recipientFilter?: any): Promise<string[]> {
  let userIds: string[] = [];

  switch (recipientType) {
    case 'all':
      const allUsers = await db.user.findMany({
        where: {
          OR: [
            { employee: { isActive: true } },
            { intern: { status: { in: ['Active', 'Upcoming'] } } }
          ]
        },
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
      if (recipientFilter?.project) {
        const projectUsers = await db.user.findMany({
          where: {
            role: 'employee',
            employee: {
              OR: [
                { project: recipientFilter.project },
                { projects: { contains: recipientFilter.project } }
              ],
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

async function processBulkMessage(bulkMessageId: string, recipients: string[]) {
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
      deliveryStatus: 'sent' as const,
      read: false
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
    console.error('Error processing bulk message:', error);
    
    // Update status to failed
    await db.bulkMessage.update({
      where: { id: bulkMessageId },
      data: { status: 'failed' }
    });
    
    throw error;
  }
}

// Helper function to send quick announcements
export async function sendQuickAnnouncement(
  title: string,
  message: string,
  sentBy: string,
  recipientType: 'all' | 'employees' | 'interns' = 'all',
  priority: NotificationPriority = 'medium'
) {
  return sendBulkMessage({
    title,
    message,
    type: 'announcement',
    priority,
    recipientType,
    sentBy
  });
}

// Helper function to send daily updates
export async function sendDailyUpdate(
  updateContent: string,
  sentBy: string,
  recipientType: 'all' | 'employees' | 'interns' = 'all'
) {
  return sendBulkMessage({
    title: 'Daily Update',
    message: updateContent,
    type: 'update',
    priority: 'medium',
    recipientType,
    sentBy
  });
}