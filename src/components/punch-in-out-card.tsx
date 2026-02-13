'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/client-only';
import { formatTimeForDisplay, calculateTotalHours as calcTotalHours } from '@/lib/attendance-time-utils';

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

interface PunchInOutCardProps {
    employeeId: string;
    onUpdate?: () => void;
    className?: string;
}

export function PunchInOutCard({ employeeId, onUpdate, className }: PunchInOutCardProps) {
    const { toast } = useToast();
    const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
    const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [fetchingData, setFetchingData] = React.useState(true);
    const [isClient, setIsClient] = React.useState(false);

    // Prevent hydration mismatch by only showing time on client
    React.useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date());
    }, []);

    // Update current time every second (only on client)
    React.useEffect(() => {
        if (!isClient) return;

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [isClient]);

    // Fetch today's attendance
    React.useEffect(() => {
        const fetchTodayAttendance = async () => {
            if (!employeeId) return;
            
            try {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todayRes = await fetch(`/api/attendance?employeeId=${employeeId}&date=${todayStr}`);
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

        fetchTodayAttendance();
    }, [employeeId, toast]);

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

            onUpdate?.();
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

            onUpdate?.();
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


    if (fetchingData) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Clock className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
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
                            {todayAttendance?.checkIn ? formatTimeForDisplay(todayAttendance.checkIn) : '--:--'}
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <LogOut className="h-4 w-4" />
                            Punch Out
                        </div>
                        <div className="text-2xl font-semibold">
                            {todayAttendance?.checkOut ? formatTimeForDisplay(todayAttendance.checkOut) : '--:--'}
                        </div>
                    </div>
                </div>

                {todayAttendance?.checkIn && todayAttendance?.checkOut && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Hours Today</div>
                        <div className="text-3xl font-bold">
                            {calcTotalHours(todayAttendance.checkIn, todayAttendance.checkOut)} hrs
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
    );
}