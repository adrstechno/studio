import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/interns/[id]/stipend - Get all stipend payments for an intern
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payments = await prisma.stipendPayment.findMany({
            where: { internId: params.id },
            orderBy: { paymentDate: 'desc' },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching stipend payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stipend payments' },
            { status: 500 }
        );
    }
}

// POST /api/interns/[id]/stipend - Record a new stipend payment
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { amount, paymentDate, paymentMethod, status, notes } = body;

        // Validate required fields
        if (!amount || !paymentDate) {
            return NextResponse.json(
                { error: 'Amount and payment date are required' },
                { status: 400 }
            );
        }

        // Verify intern exists
        const intern = await prisma.intern.findUnique({
            where: { id: params.id },
        });

        if (!intern) {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }

        // Create payment record
        const payment = await prisma.stipendPayment.create({
            data: {
                internId: params.id,
                amount: parseFloat(amount),
                paymentDate: new Date(paymentDate),
                paymentMethod,
                status: status || 'Paid',
                notes,
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        console.error('Error recording stipend payment:', error);
        return NextResponse.json(
            { error: 'Failed to record stipend payment' },
            { status: 500 }
        );
    }
}
