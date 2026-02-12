import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';

// GET intern attendance records
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // First verify the intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        // Get the employee record linked to this intern (for attendance tracking)
        let employee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        // If no employee record exists, create one for the intern
        if (!employee) {
            employee = await withRetry(async () => {
                return await db.employee.create({
                    data: {
                        name: intern.name,
                        email: intern.email,
                        phone: intern.phone,
                        avatarUrl: intern.avatarUrl,
                        role: 'Developer',
                        project: intern.project || 'Unassigned',
                        projects: intern.projects,
                        isActive: intern.status === 'Active',
                        enrollmentDate: intern.startDate,
                        casualLeaveQuota: 0,
                        sickLeaveQuota: 0,
                        earnedLeaveQuota: 0,
                        maternityLeaveQuota: 0,
                        paternityLeaveQuota: 0,
                        workFromHomeQuota: 0,
                    },
                });
            });
        }

        let whereClause: any = {
            employeeId: employee.id,
        };

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        } else if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

            whereClause.date = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
        }

        const attendance = await withRetry(async () => {
            return await dbdMany({
                where: whereClause,
                orderBy: { date: 'desc' },
            });
        });

        return NextResponse.json({
            attendance,
            employeeId: employee.id,
        });
    } catch (error) {
        console.error('Error fetching intern attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

// POST - Punch In (create attendance record)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // on't fail if it's empty
        let body = {};
        try {
            const text = await request.text();
            if (text) {
                body = JSON.parse(text);
            }
        } catch (e) {
            // Body is optional for punch in
            console.log('No body provided for punch in, using defaults');
        }

        // Verify intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ errornd' }, { status: 404 });
        }

        // Get employee record or create one if it doesn't exist
        let employee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        // If no employee record exists, create one for the intern
        if (!employee) {
            employee = await withRetry(async () => {
                return await db.employee.create({
                    data: {
                        name: intern.name,
                        email: intern.email,
         : intern.phone,
                        avatarUrl: intern.avatarUrl,
                        role: 'Developer',
                        project: intern.project || 'Unassigned',
                        projects: intern.projects,
                        isActive: intern.status === 'Active',
                        enrollmentDate: intern.startDate,
                        casualLeaveQuota: 0,
                        sickLeaveQuota: 0,
                        earnedLeaveQuota: 0,
                        maternityLeaveQuota: 0,
                        paternityLeaveQuota: 0,
                        workFromHomeQuota: 0,
                    },
                });
            });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already punched in today
        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
                where: {
                    employeeId: employee.id,
                    date: {
                        gte: today,
                        lt: 000),
                    },
                },
            });
        });

        if (existingAttendance) {
            return NextResponse.json({
                error: 'Already punched in today',
                attendance: existingAttendance
            }, { status: 400 });
        }

        // Create attendance record with punch in time
        const now = new Date();
        const checkInTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const attendance = await withRetry(async () => {
            return await db.attendance.create({
     data: {
                    employeeId: employee.id,
                    date: today,
                    status: AttendanceStatus.Present,
                    checkIn: checkInTime,
                },
            });
        });

        return NextResponse.json({
            message: 'Punched in successfully',
            attendance,
        }, { status: 201 });
    } catch (error) {
        console.error('Error punching in:', error);
        return NextResponse.js0 });
    }
}

// PATCH - Punch Out (update attendance record)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        // Get employee record
yee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        if (!employee) {
            return NextResponse.json({ 
                error: 'No employee record found for this intern' 
            }, { status: 404 });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's attendance record
        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
      where: {
                    employeeId: employee.i
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            });
        });

        if (!existingAttendance) {
            return NextResponse.json({ 
                error: 'No punch in record found for today' 
            }, { status: 400 });
        }

        if (existingAttendance.checkOut) {
            return NextResponse.json({ 
                error: 'Already punched out today',
                attendance: existingAttendance
            }, { status: 400 });
        }

        // ith punch out time
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const attendance = await withRetry(async () => {
            return await db.attendance.update({
                where: { id: existingAttendance.id },
n({
            message: 'Punched out successfully',
            attendance,
        });
    } catch (error) {
        console.error('Error punching out:', error);
        return NextResponse.json({ error: 'Failed to punch out' }, { status: 500 });
    }
}
                data: {
                    checkOut: checkOutTime,
                },
            });
        });

        return NextResponse.jso