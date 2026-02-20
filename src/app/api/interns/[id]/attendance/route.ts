import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';

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

        const intern = await withRetry(async () => {
            return await db.intern.findUnique({ where: { id } });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        let employee = await withRetry(async () => {
            return await db.employee.findFirst({ where: { email: intern.email } });
        });

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

        let whereClause: any = { employeeId: employee.id };

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            whereClause.date = { gte: startOfDay, lte: endOfDay };
        } else if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            whereClause.date = { gte: startOfMonth, lte: endOfMonth };
        }

        const attendance = await withRetry(async () => {
            return await db.attendance.findMany({
                where: whereClause,
                orderBy: { date: 'desc' },
            });
        });

        return NextResponse.json({ attendance, employeeId: employee.id });
    } catch (error) {
        console.error('Error fetching intern attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let body = {};
        try {
            const text = await request.text();
            if (text) body = JSON.parse(text);
        } catch (e) {
            console.log('No body provided for punch in');
        }

        // Get checkIn time from client or use server time as fallback
        let checkInTime = (body as any).checkIn;
        if (!checkInTime) {
            const now = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            checkInTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }

        const intern = await withRetry(async () => {
            return await db.intern.findUnique({ where: { id } });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        let employee = await withRetry(async () => {
            return await db.employee.findFirst({ where: { email: intern.email } });
        });

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
                where: {
                    employeeId: employee.id,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
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
        return NextResponse.json({ error: 'Failed to punch in' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get checkOut time from client or use server time as fallback
        let body = {};
        try {
            const text = await request.text();
            if (text) body = JSON.parse(text);
        } catch (e) {
            console.log('No body provided for punch out');
        }

        let checkOutTime = (body as any).checkOut;
        if (!checkOutTime) {
            const now = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            checkOutTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }

        const intern = await withRetry(async () => {
            return await db.intern.findUnique({ where: { id } });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        const employee = await withRetry(async () => {
            return await db.employee.findFirst({ where: { email: intern.email } });
        });

        if (!employee) {
            return NextResponse.json({ 
                error: 'No employee record found for this intern' 
            }, { status: 404 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
                where: {
                    employeeId: employee.id,
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

        const attendance = await withRetry(async () => {
            return await db.attendance.update({
                where: { id: existingAttendance.id },
                data: { checkOut: checkOutTime },
            });
        });

        return NextResponse.json({
            message: 'Punched out successfully',
            attendance,
        });
    } catch (error) {
        console.error('Error punching out:', error);
        return NextResponse.json({ error: 'Failed to punch out' }, { status: 500 });
    }
}
