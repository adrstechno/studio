import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This endpoint creates Firebase users from database employees
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { useAdrsEmail = false, defaultPassword = 'password' } = body;

        // Get all employees from database
        const employees = await db.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        if (employees.length === 0) {
            return NextResponse.json({ error: 'No employees found in database' }, { status: 404 });
        }

        const results = {
            success: [] as any[],
            failed: [] as any[],
            total: employees.length,
        };

        // For each employee, create Firebase user
        for (const employee of employees) {
            try {
                // Determine email to use
                let authEmail = employee.email;
                
                if (useAdrsEmail) {
                    // Convert name to email format: "Ishant Patel" -> "ishant@adrs.com"
                    const firstName = employee.name.split(' ')[0].toLowerCase();
                    authEmail = `${firstName}@adrs.com`;
                }

                // Call Firebase Auth API to create user
                const firebaseResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/auth/firebase-create-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: authEmail,
                        password: defaultPassword,
                        displayName: employee.name,
                    })
                });

                if (firebaseResponse.ok) {
                    results.success.push({
                        name: employee.name,
                        email: authEmail,
                        originalEmail: employee.email,
                        role: employee.role,
                    });
                } else {
                    const error = await firebaseResponse.json();
                    results.failed.push({
                        name: employee.name,
                        email: authEmail,
                        reason: error.message || 'Failed to create Firebase user',
                    });
                }
            } catch (error: any) {
                results.failed.push({
                    name: employee.name,
                    email: employee.email,
                    reason: error.message,
                });
            }
        }

        return NextResponse.json({
            message: 'Firebase user creation completed',
            results,
            defaultPassword,
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating Firebase users:', error);
        return NextResponse.json({ error: 'Failed to create Firebase users' }, { status: 500 });
    }
}
