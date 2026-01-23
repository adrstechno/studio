'use client';

import * as React from 'react';
import { SimpleCalendar } from '@/components/simple-calendar';
import { ClientOnly } from '@/components/client-only';
import { cn } from '@/lib/utils';

type AttendanceCalendarProps = {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    attendanceDays: Record<string, Date[]>;
    className?: string;
};

export function AttendanceCalendar({
    selected,
    onSelect,
    attendanceDays,
    className
}: AttendanceCalendarProps) {
    return (
        <ClientOnly fallback={
            <div className="flex items-center justify-center h-64 border rounded-md">
                <div className="text-sm text-muted-foreground">Loading calendar...</div>
            </div>
        }>
            <SimpleCalendar
                selected={selected}
                onSelect={onSelect}
                className={cn("rounded-md border", className)}
                modifiers={{
                    present: attendanceDays.present || [],
                    late: attendanceDays.late || [],
                    absent: attendanceDays.absent || [],
                    halfday: attendanceDays.halfday || [],
                    onleave: attendanceDays.onleave || [],
                }}
                modifiersClassNames={{
                    present: 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 font-medium',
                    late: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 font-medium',
                    absent: 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 font-medium',
                    halfday: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 font-medium',
                    onleave: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 font-medium',
                }}
            />
        </ClientOnly>
    );
}