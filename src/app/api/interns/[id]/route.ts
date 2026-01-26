import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/interns/[id] - Get a specific intern
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const intern = await prisma.intern.findUnique({
            where: { id: params.id },
            include: {
                evaluations: {
                    orderBy: { createdAt: 'desc' },
                },
                stipendPayments: {
                    orderBy: { paymentDate: 'desc' },
                },
            },
        });

        if (!intern) {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }

        // Get mentor details if assigned
        let mentor = null;
        if (intern.mentorId) {
            mentor = await prisma.employee.findUnique({
                where: { id: intern.mentorId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatarUrl: true,
                },
            });
        }

        return NextResponse.json({ ...intern, mentor });
    } catch (error) {
        console.error('Error fetching intern:', error);
        return NextResponse.json(
            { error: 'Failed to fetch intern' },
            { status: 500 }
        );
    }
}

// PUT /api/interns/[id] - Update an intern
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const {
            name,
            email,
            phone,
            avatarUrl,
            university,
            degree,
            startDate,
            endDate,
            stipendAmount,
            mentorId,
            project,
            status,
        } = body;

        // Validate date range if both dates are provided
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (university !== undefined) updateData.university = university;
        if (degree !== undefined) updateData.degree = degree;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (stipendAmount !== undefined) updateData.stipendAmount = parseFloat(stipendAmount);
        if (mentorId !== undefined) updateData.mentorId = mentorId;
        if (project !== undefined) updateData.project = project;
        if (status !== undefined) updateData.status = status;

        const intern = await prisma.intern.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(intern);
    } catch (error: any) {
        console.error('Error updating intern:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update intern' },
            { status: 500 }
        );
    }
}

// DELETE /api/interns/[id] - Delete an intern
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.intern.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Intern deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting intern:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to delete intern' },
            { status: 500 }
        );
    }
}
