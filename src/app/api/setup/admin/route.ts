import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// POST /api/setup/admin - Create admin user (for setup purposes)
export async function POST(request: NextRequest) {
    try {
        const { email = 'admin@adrs.com', password = 'Admin@123', name = 'Admin User' } = await request.json();

        // Check if admin already exists
        const existingAdmin = await db.user.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            return NextResponse.json({
                message: 'Admin user already exists',
                email: existingAdmin.email,
                created: false
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create admin user
        const adminUser = await db.user.create({
            data: {
                email,
                name,
                passwordHash: hashedPassword,
                role: 'admin'
            }
        });

        return NextResponse.json({
            message: 'Admin user created successfully',
            email: adminUser.email,
            created: true,
            credentials: {
                email,
                password
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating admin user:', error);
        return NextResponse.json({
            error: 'Failed to create admin user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET /api/setup/admin - Check if admin exists
export async function GET() {
    try {
        const adminCount = await db.user.count({
            where: { role: 'admin' }
        });

        const hasAdmin = adminCount > 0;

        return NextResponse.json({
            hasAdmin,
            adminCount,
            message: hasAdmin ? 'Admin user exists' : 'No admin user found'
        });

    } catch (error) {
        console.error('Error checking admin user:', error);
        return NextResponse.json({
            error: 'Failed to check admin user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}