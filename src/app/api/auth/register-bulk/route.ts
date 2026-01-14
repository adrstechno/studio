import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Bulk register employees in Firebase
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employees, defaultPassword = 'password' } = body;

        if (!employees || !Array.isArray(employees)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const results = {
            success: [] as any[],
            failed: [] as any[],
            alreadyExists: [] as any[],
        };

        // Note: This endpoint creates a registration link for each employee
        // In a real implementation, you would use Firebase Admin SDK
        // For now, we'll return the list of employees that need to be registered

        for (const emp of employees) {
            try {
                // Check if employee exists in database
                const dbEmployee = await db.employee.findUnique({
                    where: { email: emp.email }
                });

                if (!dbEmployee) {
                    results.failed.push({
                        email: emp.email,
                        reason: 'Employee not found in database'
                    });
                    continue;
                }

                // In production, you would use Firebase Admin SDK here:
                // const userRecord = await admin.auth().createUser({
                //     email: emp.email,
                //     password: defaultPassword,
                //     displayName: emp.name,
                // });

                results.success.push({
                    email: emp.email,
                    name: emp.name,
                    registrationLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/register?email=${encodeURIComponent(emp.email)}`
                });
            } catch (error: any) {
                results.failed.push({
                    email: emp.email,
                    reason: error.message
                });
            }
        }

        return NextResponse.json({
            message: 'Registration process completed',
            results,
            instructions: 'Send registration links to employees or use Firebase Admin SDK for automatic creation'
        }, { status: 200 });
    } catch (error) {
        console.error('Error in bulk registration:', error);
        return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
    }
}
