'use client'
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees, leaveRequests, attendance } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';
import type { DayPicker } from 'react-day-picker';

const statusColors: Record<string, string> = {
  Approved: 'text-green-700 bg-green-50 border-green-200',
  Pending: 'text-amber-700 bg-amber-50 border-amber-200',
  Rejected: 'text-red-700 bg-red-50 border-red-200',
};

export default function AttendancePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const onLeaveDays = attendance
    .filter(a => a.status === 'On Leave')
    .map(a => a.date);

  const modifiers: DayPicker['modifiers'] = {
    onLeave: onLeaveDays,
  };
  
  const modifiersClassNames: DayPicker['modifiersClassNames'] = {
    onLeave: 'bg-amber-100 text-amber-800 rounded-full',
  };

  return (
    <>
      <PageHeader
        title="Attendance & Leave"
        description="Track attendance and manage leave requests."
      >
        <Button>
          <PlusCircle />
          New Leave Request
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-full"
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => {
                    const employee = employees.find(
                      (e) => e.id === request.employeeId
                    );
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={employee?.avatarUrl}
                                alt={employee?.name}
                              />
                              <AvatarFallback>
                                {employee?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid text-sm">
                                <span className="font-medium">{employee?.name}</span>
                                <span className="text-muted-foreground">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(statusColors[request.status])}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
