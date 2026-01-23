'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleCalendarProps {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    month?: Date;
    onMonthChange?: (date: Date) => void;
    modifiers?: Record<string, Date[]>;
    modifiersClassNames?: Record<string, string>;
    className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function SimpleCalendar({
    selected,
    onSelect,
    month: controlledMonth,
    onMonthChange,
    modifiers = {},
    modifiersClassNames = {},
    className
}: SimpleCalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(controlledMonth || new Date());

    React.useEffect(() => {
        if (controlledMonth) {
            setCurrentMonth(controlledMonth);
        }
    }, [controlledMonth]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const handlePrevMonth = () => {
        const newMonth = new Date(year, month - 1, 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(year, month + 1, 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth);
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        onSelect?.(date);
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const isToday = (day: number) => {
        const today = new Date();
        const date = new Date(year, month, day);
        return isSameDay(date, today);
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        const date = new Date(year, month, day);
        return isSameDay(date, selected);
    };

    const getModifierClasses = (day: number) => {
        const date = new Date(year, month, day);
        const classes: string[] = [];

        Object.entries(modifiers).forEach(([key, dates]) => {
            if (dates.some(d => isSameDay(d, date))) {
                classes.push(modifiersClassNames[key] || '');
            }
        });

        return classes.join(' ');
    };

    // Generate calendar grid
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <div className={cn("p-3", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handlePrevMonth}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="font-semibold text-sm">
                    {MONTHS[month]} {year}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleNextMonth}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground p-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="p-2" />;
                    }

                    const modifierClasses = getModifierClasses(day);
                    const todayClass = isToday(day);
                    const selectedClass = isSelected(day);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                todayClass && "bg-accent font-bold ring-2 ring-primary",
                                selectedClass && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                modifierClasses
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
