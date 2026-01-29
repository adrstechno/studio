'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Send, Eye, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

interface MessagingStats {
  overview: {
    totalMessages: number;
    totalRecipients: number;
    totalDelivered: number;
    totalRead: number;
    deliveryRate: number;
    readRate: number;
  };
  statusBreakdown: {
    draft: number;
    scheduled: number;
    sending: number;
    sent: number;
    failed: number;
  };
  recentMessages: Array<{
    id: string;
    title: string;
    status: string;
    totalRecipients: number;
    deliveredCount: number;
    readCount: number;
    createdAt: string;
  }>;
}

export function MessagingStatsCard() {
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/messages/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching messaging stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      scheduled: 'secondary',
      sending: 'default',
      sent: 'default',
      failed: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No messaging data available</p>
            <Button asChild>
              <Link href="/messages">
                <Plus className="h-4 w-4 mr-2" />
                Send First Message
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messaging Overview
            </CardTitle>
            <CardDescription>Bulk messaging statistics and recent activity</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/messages">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Send className="h-5 w-5" />
              {stats.overview.totalMessages}
            </div>
            <p className="text-sm text-gray-600">Messages Sent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <Users className="h-5 w-5" />
              {stats.overview.totalRecipients}
            </div>
            <p className="text-sm text-gray-600">Total Recipients</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
              <TrendingUp className="h-5 w-5" />
              {stats.overview.deliveryRate}%
            </div>
            <p className="text-sm text-gray-600">Delivery Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
              <Eye className="h-5 w-5" />
              {stats.overview.readRate}%
            </div>
            <p className="text-sm text-gray-600">Read Rate</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h4 className="font-semibold mb-3">Message Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              count > 0 && (
                <div key={status} className="flex items-center gap-2">
                  {getStatusBadge(status)}
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        {stats.recentMessages.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Recent Messages</h4>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/messages">View All</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {stats.recentMessages.slice(0, 3).map((message) => (
                <div key={message.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{message.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{message.totalRecipients} recipients</span>
                      <span>•</span>
                      <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(message.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/messages?tab=history">
                View History
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}