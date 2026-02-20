'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Calendar, Clock, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeForDisplay } from '@/lib/attendance-time-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
};

export default function TelecallerMyAttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState(format(new Date(), 'yyyy-MM'));
  const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord | null>(null);
  const [punchingIn, setPunchingIn] = React.useState(false);
  const [punchingOut, setPunchingOut] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [user?.email, selectedMonth]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      const employeeRes = await fetch(`/api/employees?email=${encodeURIComponent(user.email)}`);
      if (!employeeRes.ok) {
        setLoading(false);
        return;
      }

      const employees = await employeeRes.json();
      const employee = Array.isArray(employees) 
        ? employees.find((e: any) => e.email === user.email) 
        : null;

      if (!employee) {
        setLoading(false);
        return;
      }

      setEmployeeId(employee.id);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRes = await fetch(`/api/attendance?employeeId=${employee.id}&date=${today}`);
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        if (todayData && todayData.length > 0) {
          setTodayAttendance(todayData[0]);
        } else {
          setTodayAttendance(null);
        }
      }

      const [year, month] = selectedMonth.split('-');
      const attendanceRes = await fetch(
        `/api/attendance?employeeId=${employee.id}&month=${month}&year=${year}`
      );

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    if (!employeeId) return;
    
    setPunchingIn(true);
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const checkIn = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          date: today.toISOString(),
          status: 'Present',
          checkIn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to punch in');
      }

      setTodayAttendance(data);
      toast({
        title: 'Success',
        description: 'Punched in successfully!',
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to punch in',
        variant: 'destructive',
      });
    } finally {
      setPunchingIn(false);
    }
  };

  const handlePunchOut = async () => {
    if (!employeeId || !todayAttendance) return;
    
    setPunchingOut(true);
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const checkOut = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todayAttendance.id,
          checkOut,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to punch out');
      }

      setTodayAttendance(data);
      toast({
        title: 'Success',
        description: 'Punched out successfully!',
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to punch out',
        variant: 'destructive',
      });
    } finally {
      setPunchingOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Absent':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Late':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'HalfDay':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'OnLeave':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Absent':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const lateDays = attendance.filter(a => a.status === 'Late').length;
  const absentDays = attendance.filter(a => a.status === 'Absent').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(1) : '0';

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My Attendance"
        description="Track your attendance and view history"
      >
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <Card className="mb-6 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Attendance
              </CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!todayAttendance ? (
                <Button 
                  onClick={handlePunchIn} 
                  disabled={punchingIn}
                  size="lg"
                  className="gap-2"
                >
                  {punchingIn ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  Punch In
                </Button>
              ) : !todayAttendance.checkOut ? (
                <Button 
                  onClick={handlePunchOut} 
                  disabled={punchingOut}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  {punchingOut ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Punch Out
                </Button>
              ) : (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed for today
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {todayAttendance && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <LogIn className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Punch In</p>
                  <p className="text-xl font-bold">{todayAttendance.checkIn ? formatTimeForDisplay(todayAttendance.checkIn) : '--:--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Punch Out</p>
                  <p className="text-xl font-bold">{todayAttendance.checkOut ? formatTimeForDisplay(todayAttendance.checkOut) : '--:--'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{presentDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{absentDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Your attendance for {format(new Date(selectedMonth), 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Attendance Records</h3>
              <p className="text-muted-foreground">
                No attendance records found for this month.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(record.date), 'EEEE')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {record.checkIn && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Check In</p>
                        <p className="font-medium">{formatTimeForDisplay(record.checkIn)}</p>
                      </div>
                    )}
                    {record.checkOut && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Check Out</p>
                        <p className="font-medium">{formatTimeForDisplay(record.checkOut)}</p>
                      </div>
                    )}
                    <Badge variant="outline" className={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{record.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
