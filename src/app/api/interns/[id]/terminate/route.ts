import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// POST /api/interns/[id]/terminate - Terminate an internship early
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { reason } = body;

        // Update intern status to Terminated
        const intern = await prisma.intern.update({
            where: { id },
            data: {
                status: 'Terminated',
                terminationDate: new Date(),
                terminationReason: reason || null,
            },
        });

        return NextResponse.json({
            message: 'Internship terminated successfully',
            intern,
        });
    } catch (error: any) {
        console.error('Error terminating internship:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to terminate internship' },
            { status: 500 }
        );
    }
}
