import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// POST /api/setup/test-users - Create test employees and interns
export async function POST(request: NextRequest) {
    try {
        const testUsers = [];

        // Create test employees
        const employees = [
            { name: 'John Developer', email: 'john@adrs.com', role: 'Developer' },
            { name: 'Sarah Designer', email: 'sarah@adrs.com', role: 'Designer' },
            { name: 'Mike Manager', email: 'mike@adrs.com', role: 'Manager' },
        ];

        for (const emp of employees) {
            // Create employee record
            const employee = await db.employee.upsert({
                where: { email: emp.email },
                update: { isActive: true },
                create: {
                    name: emp.name,
                    email: emp.email,
                    role: emp.role as any,
                    project: 'Sample Project',
                    isActive: true,
                },
            });

            // Create user account
            const hashedPassword = await hashPassword('Employee@123');
            const user = await db.user.upsert({
                where: { email: emp.email },
                update: {
                    passwordHash: hashedPassword,
                    role: 'employee',
                    employeeId: employee.id,
                },
                create: {
                    email: emp.email,
                    name: emp.name,
                    passwordHash: hashedPassword,
                    role: 'employee',
                    employeeId: employee.id,
                },
            });

            testUsers.push({ type: 'employee', ...emp, userId: user.id });
        }

        // Create test interns
        const interns = [
            { name: 'Alex Intern', email: 'alex@adrs.com', university: 'Tech University' },
            { name: 'Emma Student', email: 'emma@adrs.com', university: 'Design College' },
        ];

        for (const int of interns) {
            // Create intern record
            const intern = await db.intern.upsert({
                where: { email: int.email },
                update: { status: 'Active' },
                create: {
                    name: int.name,
                    email: int.email,
                    university: int.university,
                    degree: 'Computer Science',
                    startDate: new Date(),
                    status: 'Active',
                    project: 'Learning Project',
                },
            });

            // Create user account
            const hashedPassword = await hashPassword('Intern@123');
            const user = await db.user.upsert({
                where: { email: int.email },
                update: {
                    passwordHash: hashedPassword,
                    role: 'intern',
                    internId: intern.id,
                },
                create: {
                    email: int.email,
                    name: int.name,
                    passwordHash: hashedPassword,
                    role: 'intern',
                    internId: intern.id,
                },
            });

            testUsers.push({ type: 'intern', ...int, userId: user.id });
        }

        return NextResponse.json({
            message: 'Test users created successfully',
            users: testUsers,
            credentials: {
                employees: 'Password: Employee@123',
                interns: 'Password: Intern@123'
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating test users:', error);
        return NextResponse.json({
            error: 'Failed to create test users',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET /api/setup/test-users - List test users
export async function GET() {
    try {
        const employees = await db.user.findMany({
            where: { role: 'employee' },
            include: { employee: true }
        });

        const interns = await db.user.findMany({
            where: { role: 'intern' },
            include: { intern: true }
        });

        return NextResponse.json({
            employees: employees.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.employee?.role,
                project: u.employee?.project
            })),
            interns: interns.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                university: u.intern?.university,
                project: u.intern?.project
            }))
        });

    } catch (error) {
        console.error('Error fetching test users:', error);
        return NextResponse.json({
            error: 'Failed to fetch test users'
        }, { status: 500 });
    }
}