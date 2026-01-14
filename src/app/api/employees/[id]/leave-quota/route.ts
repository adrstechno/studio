import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update employee leave quotas (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            casualLeaveQuota,
            sickLeaveQuota,
            earnedLeaveQuota,
            maternityLeaveQuota,
            paternityLeaveQuota,
            workFromHomeQuota,
        } = body;

        const employee = await db.employee.update({
            where: { id },
            data: {
                ...(casualLeaveQuota !== undefined && { casualLeaveQuota }),
                ...(sickLeaveQuota !== undefined && { sickLeaveQuota }),
                ...(earnedLeaveQuota !== undefined && { earnedLeaveQuota }),
                ...(maternityLeaveQuota !== undefined && { maternityLeaveQuota }),
                ...(paternityLeaveQuota !== undefined && { paternityLeaveQuota }),
                ...(workFromHomeQuota !== undefined && { workFromHomeQuota }),
            },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error updating leave quotas:', error);
        return NextResponse.json({ error: 'Failed to update leave quotas' }, { status: 500 });
    }
}

// GET - Get employee leave quotas
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const employee = await db.employee.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                casualLeaveQuota: true,
                sickLeaveQuota: true,
                earnedLeaveQuota: true,
                maternityLeaveQuota: true,
                paternityLeaveQuota: true,
                workFromHomeQuota: true,
            },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Calculate used leaves
        const leaveRequests = await db.leaveRequest.findMany({
            where: {
                employeeId: id,
                status: 'Approved',
            },
        });

        const usedLeaves = {
            casual: 0,
            sick: 0,
            earned: 0,
            maternity: 0,
            paternity: 0,
            workFromHome: 0,
        };

        leaveRequests.forEach((leave) => {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            let days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Adjust for half days
            if (leave.leaveDuration === 'HalfDay' || leave.leaveDuration === 'FirstHalf' || leave.leaveDuration === 'SecondHalf') {
                days = days * 0.5;
            }

            switch (leave.leaveType) {
                case 'Casual':
                    usedLeaves.casual += days;
                    break;
                case 'Sick':
                    usedLeaves.sick += days;
                    break;
                case 'Earned':
                    usedLeaves.earned += days;
                    break;
                case 'Maternity':
                    usedLeaves.maternity += days;
                    break;
                case 'Paternity':
                    usedLeaves.paternity += days;
                    break;
                case 'WorkFromHome':
                    usedLeaves.workFromHome += days;
                    break;
            }
        });

        return NextResponse.json({
            employee,
            quotas: {
                casual: {
                    total: employee.casualLeaveQuota,
                    used: usedLeaves.casual,
                    remaining: employee.casualLeaveQuota - usedLeaves.casual,
                },
                sick: {
                    total: employee.sickLeaveQuota,
                    used: usedLeaves.sick,
                    remaining: employee.sickLeaveQuota - usedLeaves.sick,
                },
                earned: {
                    total: employee.earnedLeaveQuota,
                    used: usedLeaves.earned,
                    remaining: employee.earnedLeaveQuota - usedLeaves.earned,
                },
                maternity: {
                    total: employee.maternityLeaveQuota,
                    used: usedLeaves.maternity,
                    remaining: employee.maternityLeaveQuota - usedLeaves.maternity,
                },
                paternity: {
                    total: employee.paternityLeaveQuota,
                    used: usedLeaves.paternity,
                    remaining: employee.paternityLeaveQuota - usedLeaves.paternity,
                },
                workFromHome: {
                    total: employee.workFromHomeQuota,
                    used: usedLeaves.workFromHome,
                    remaining: employee.workFromHomeQuota - usedLeaves.workFromHome,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching leave quotas:', error);
        return NextResponse.json({ error: 'Failed to fetch leave quotas' }, { status: 500 });
    }
}
