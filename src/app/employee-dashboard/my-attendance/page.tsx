'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Clock, LogIn, LogOut, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/hooks/use-loading';
import { AttendanceCalendar } from '@/components/attendance-calendar';
import { ClientOnly } from '@/components/client-only';

type AttendanceRecord = {
    id: string;
    date: Date;
    status: 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'OnLeave';
    checkIn?: string;
    checkOut?: string;
};

const statusColors = {
    Present: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    Late: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    Absent: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    HalfDay: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    OnLeave: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
};

export default function MyAttendancePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
    const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord | null>(null);
    const [monthlyAttendance, setMonthlyAttendance] = React.useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [employeeId, setEmployeeId] = React.useState<string | null>(null);
    const [fetchingData, setFetchingData] = React.useState(true);
    const [isClient, setIsClient] = React.useState(false);

    // Prevent hydration mismatch by only showing time on client
    React.useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date());
        // Don't set date here to avoid hydration mismatch
    }, []);

    // Update current time every second (only on client)
    React.useEffect(() => {
        if (!isClient) return;

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [isClient]);

    // Fetch employee and attendance data
    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                // Get employee by email
                const empRes = await fetch('/api/employees');
                const employees = await empRes.json();
                const currentEmployee = employees.find((e: { email: string }) => e.email === user.email);

                if (currentEmployee) {
                    setEmployeeId(currentEmployee.id);

                    // Fetch today's attendance
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    const todayRes = await fetch(`/api/attendance?employeeId=${currentEmployee.id}&date=${todayStr}`);
                    const todayData = await todayRes.json();

                    if (todayData.length > 0) {
                        const record = todayData[0];
                        setTodayAttendance({
                            id: record.id,
                            date: new Date(record.date),
                            status: record.status,
                            checkIn: record.checkIn,
                            checkOut: record.checkOut,
                        });
                    }

                    // Fetch monthly attendance
                    const year = today.getFullYear();
                    const month = today.getMonth() + 1;
                    const monthlyRes = await fetch(`/api/attendance?employeeId=${currentEmployee.id}&year=${year}&month=${month}`);
                    const monthlyData = await monthlyRes.json();

                    const records = monthlyData.map((record: any) => ({
                        id: record.id,
                        date: new Date(record.date),
                        status: record.status,
                        checkIn: record.checkIn,
                        checkOut: record.checkOut,
                    }));
                    setMonthlyAttendance(records);
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load attendance data',
                    variant: 'destructive',
                });
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, [user?.email, toast]);

    const handlePunchIn = async () => {
        if (!employeeId) {
            toast({
                title: 'Error',
                description: 'Employee ID not found. Please refresh the page.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            const dateString = now.toISOString().split('T')[0];

            // Check if late (after 9:30 AM)
            const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId,
                    date: dateString,
                    status: isLate ? 'Late' : 'Present',
                    checkIn: timeString,
                }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(`Failed to punch in: ${errorData}`);
            }

            const record = await res.json();
            setTodayAttendance({
                id: record.id,
                date: new Date(record.date),
                status: record.status,
                checkIn: record.checkIn,
            });

            toast({
                title: 'Punched In Successfully',
                description: `Check-in time: ${timeString}${isLate ? ' (Late)' : ''}`,
            });
        } catch (error: any) {
            console.error('Punch in error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to punch in',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePunchOut = async () => {
        if (!employeeId || !todayAttendance) {
            toast({
                title: 'Error',
                description: 'Cannot punch out. Please ensure you have punched in first.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });

            const res = await fetch(`/api/attendance/${todayAttendance.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkOut: timeString,
                }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(`Failed to punch out: ${errorData}`);
            }

            const record = await res.json();
            setTodayAttendance({
                ...todayAttendance,
                checkOut: record.checkOut,
            });

            toast({
                title: 'Punched Out Successfully',
                description: `Check-out time: ${timeString}`,
            });
        } catch (error: any) {
            console.error('Punch out error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to punch out',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!isClient) return; // Prevent execution during SSR
        try {
            setDate(selectedDate);
        } catch (error) {
            console.error('Error selecting date:', error);
            toast({
                title: 'Error',
                description: 'Failed to select date',
                variant: 'destructive',
            });
        }
    };

    const calculateTotalHours = (checkIn?: string, checkOut?: string) => {
        if (!checkIn || !checkOut) return '0:00';

        try {
            const [inH, inM] = checkIn.split(':').map(Number);
            const [outH, outM] = checkOut.split(':').map(Number);

            // Validate the parsed numbers
            if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
                return '0:00';
            }

            const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);

            // Handle negative time (next day checkout)
            const adjustedMinutes = totalMinutes < 0 ? totalMinutes + (24 * 60) : totalMinutes;

            const hours = Math.floor(adjustedMinutes / 60);
            const minutes = adjustedMinutes % 60;

            return `${hours}:${String(minutes).padStart(2, '0')}`;
        } catch (error) {
            console.error('Error calculating total hours:', error);
            return '0:00';
        }
    };

    // Calculate monthly stats
    const thisMonthStats = React.useMemo(() => {
        if (!monthlyAttendance || monthlyAttendance.length === 0) {
            return { totalDays: 0, presentDays: 0, lateDays: 0, leaveDays: 0, totalHours: '0.0' };
        }

        const totalDays = monthlyAttendance.length;
        const presentDays = monthlyAttendance.filter((a: AttendanceRecord) => a?.status === 'Present' || a?.status === 'Late').length;
        const lateDays = monthlyAttendance.filter((a: AttendanceRecord) => a?.status === 'Late').length;
        const leaveDays = monthlyAttendance.filter((a: AttendanceRecord) => a?.status === 'OnLeave').length;

        const totalHours = monthlyAttendance.reduce((sum: number, record: AttendanceRecord) => {
            if (record?.checkIn && record?.checkOut) {
                try {
                    const timeStr = calculateTotalHours(record.checkIn, record.checkOut);
                    const hours = parseFloat(timeStr.replace(':', '.'));
                    return sum + (isNaN(hours) ? 0 : hours);
                } catch (error) {
                    console.error('Error calculating hours for record:', record, error);
                    return sum;
                }
            }
            return sum;
        }, 0);

        return { totalDays, presentDays, lateDays, leaveDays, totalHours: totalHours.toFixed(1) };
    }, [monthlyAttendance]);

    // Calendar modifiers
    const attendanceDays = React.useMemo(() => {
        if (!monthlyAttendance || monthlyAttendance.length === 0) {
            return {};
        }

        return monthlyAttendance.reduce((acc: Record<string, Date[]>, record: AttendanceRecord) => {
            if (!record?.status || !record?.date) return acc;

            try {
                const status = record.status.toLowerCase();
                if (!acc[status]) acc[status] = [];
                acc[status].push(record.date);
                return acc;
            } catch (error) {
                console.error('Error processing attendance record for calendar:', record, error);
                return acc;
            }
        }, {} as Record<string, Date[]>);
    }, [monthlyAttendance]);

    if (fetchingData) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Clock className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <LoadingOverlay loading={fetchingData} loadingText="Loading your attendance data...">
            <PageHeader
                title="My Attendance"
                description="Track your daily attendance and view your monthly records."
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{thisMonthStats.totalDays}</p>
                                <p className="text-sm text-muted-foreground">Total Days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{thisMonthStats.totalHours}</p>
                                <p className="text-sm text-muted-foreground">Total Hours</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{thisMonthStats.lateDays}</p>
                                <p className="text-sm text-muted-foreground">Late Days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <CalendarIcon className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{thisMonthStats.leaveDays}</p>
                                <p className="text-sm text-muted-foreground">Leaves Used</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Attendance */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Today's Attendance
                            </CardTitle>
                            <CardDescription className="break-words">
                                <ClientOnly fallback="Loading date...">
                                    {currentTime ? currentTime.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Loading...'}
                                </ClientOnly>
                            </CardDescription>
                        </div>
                        <div className="text-center md:text-right">
                            <div className="text-2xl font-bold">
                                <ClientOnly fallback="--:--:--">
                                    {currentTime ? currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    }) : '--:--:--'}
                                </ClientOnly>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Current Time
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-start">
                        {todayAttendance && (
                            <Badge variant="outline" className={cn('text-sm', statusColors[todayAttendance.status])}>
                                {todayAttendance.status}
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <LogIn className="h-4 w-4" />
                                Punch In
                            </div>
                            <div className="text-2xl font-semibold">
                                {todayAttendance?.checkIn || '--:--:--'}
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <LogOut className="h-4 w-4" />
                                Punch Out
                            </div>
                            <div className="text-2xl font-semibold">
                                {todayAttendance?.checkOut || '--:--:--'}
                            </div>
                        </div>
                    </div>

                    {todayAttendance?.checkIn && todayAttendance?.checkOut && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total Hours Today</div>
                            <div className="text-3xl font-bold">
                                {calculateTotalHours(todayAttendance.checkIn, todayAttendance.checkOut)} hrs
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-3">
                        <Button
                            onClick={handlePunchIn}
                            disabled={loading || !!todayAttendance?.checkIn}
                            className="flex-1"
                            size="lg"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Punch In
                        </Button>
                        <Button
                            onClick={handlePunchOut}
                            disabled={loading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                            variant="outline"
                            className="flex-1"
                            size="lg"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Punch Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Monthly Attendance Calendar
                    </CardTitle>
                    <CardDescription>
                        View your attendance history
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Calendar */}
                    <AttendanceCalendar
                        selected={date}
                        onSelect={handleDateSelect}
                        attendanceDays={attendanceDays}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold mb-3">Status Legend</h3>
                            <div className="space-y-2">
                                {Object.entries(statusColors).map(([status, color]) => (
                                    <div key={status} className="flex items-center gap-2">
                                        <div className={cn('w-4 h-4 rounded', color)} />
                                        <span className="text-sm">{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Selected Date Details */}
                        <ClientOnly fallback={
                            <div>
                                <h3 className="font-semibold mb-3">Select a date</h3>
                                <p className="text-sm text-muted-foreground">Loading date details...</p>
                            </div>
                        }>
                            {date && (
                                <div>
                                    <h3 className="font-semibold mb-3">
                                        {date.toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h3>
                                    {monthlyAttendance.find(a =>
                                        a.date.toDateString() === date.toDateString()
                                    ) ? (
                                        <div className="space-y-2 text-sm">
                                            {(() => {
                                                const record = monthlyAttendance.find(a =>
                                                    a.date.toDateString() === date.toDateString()
                                                );
                                                return record ? (
                                                    <>
                                                        <div className="flex justify-between items-center">
                                                            <span>Status:</span>
                                                            <Badge variant="outline" className={cn('text-xs', statusColors[record.status])}>
                                                                {record.status}
                                                            </Badge>
                                                        </div>
                                                        {record.checkIn && (
                                                            <div className="flex justify-between">
                                                                <span>Check In:</span>
                                                                <span className="font-medium">{record.checkIn}</span>
                                                            </div>
                                                        )}
                                                        {record.checkOut && (
                                                            <div className="flex justify-between">
                                                                <span>Check Out:</span>
                                                                <span className="font-medium">{record.checkOut}</span>
                                                            </div>
                                                        )}
                                                        {record.checkIn && record.checkOut && (
                                                            <div className="flex justify-between font-semibold">
                                                                <span>Total Hours:</span>
                                                                <span>{calculateTotalHours(record.checkIn, record.checkOut)} hrs</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : null;
                                            })()}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No attendance record</p>
                                    )}
                                </div>
                            )}
                        </ClientOnly>
                    </div>
                </CardContent>
            </Card>
        </LoadingOverlay>
    );
}