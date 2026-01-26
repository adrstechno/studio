import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// POST /api/interns/[id]/assign-mentor - Assign or change mentor
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { mentorId } = body;

        if (!mentorId) {
            return NextResponse.json(
                { error: 'Mentor ID is required' },
                { status: 400 }
            );
        }

        // Verify mentor exists
        const mentor = await prisma.employee.findUnique({
            where: { id: mentorId },
        });

        if (!mentor) {
            return NextResponse.json(
                { error: 'Mentor not found' },
                { status: 404 }
            );
        }

        // Update intern with new mentor
        const intern = await prisma.intern.update({
            where: { id: params.id },
            data: { mentorId },
        });

        return NextResponse.json({
            message: 'Mentor assigned successfully',
            intern,
            mentor: {
                id: mentor.id,
                name: mentor.name,
                email: mentor.email,
            },
        });
    } catch (error: any) {
        console.error('Error assigning mentor:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to assign mentor' },
            { status: 500 }
        );
    }
}
