import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Bulk create employees
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employees } = body;

        if (!employees || !Array.isArray(employees)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Create employees in bulk
        const createdEmployees = await Promise.all(
            employees.map(async (emp: any) => {
                // Check if employee already exists
                const existing = await db.employee.findUnique({
                    where: { email: emp.email }
                });

                if (existing) {
                    console.log(`Employee ${emp.email} already exists, skipping...`);
                    return existing;
                }

                // Create new employee
                return await db.employee.create({
                    data: {
                        name: emp.name,
                        email: emp.email,
                        role: emp.role || 'Developer',
                        project: emp.project || 'Unassigned',
                        avatarUrl: emp.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`,
                    }
                });
            })
        );

        return NextResponse.json({
            message: 'Employees created successfully',
            count: createdEmployees.length,
            employees: createdEmployees
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating employees:', error);
        return NextResponse.json({ error: 'Failed to create employees' }, { status: 500 });
    }
}
