'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Phone } from 'lucide-react';

export default function TelecallerCallLogsPage() {
  return (
    <>
      <PageHeader
        title="Call Logs"
        description="View and manage your call history"
      />

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Call Logs Coming Soon</h3>
            <p>Call logging and management features will be available here</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
