import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/interns/stats - Get intern statistics
export async function GET(request: NextRequest) {
    try {
        const [
            totalInterns,
            activeInterns,
            completedInterns,
            upcomingInterns,
            terminatedInterns,
            allInterns,
        ] = await Promise.all([
            prisma.intern.count(),
            prisma.intern.count({ where: { status: 'Active' } }),
            prisma.intern.count({ where: { status: 'Completed' } }),
            prisma.intern.count({ where: { status: 'Upcoming' } }),
            prisma.intern.count({ where: { status: 'Terminated' } }),
            prisma.intern.findMany({
                include: {
                    evaluations: true,
                    stipendPayments: true,
                },
            }),
        ]);

        // Calculate average duration
        const completedInternsData = allInterns.filter(
            (i) => i.status === 'Completed' || i.status === 'Terminated'
        );
        const avgDuration =
            completedInternsData.length > 0
                ? completedInternsData.reduce((sum, intern) => {
                    const duration =
                        (new Date(intern.terminationDate || intern.endDate).getTime() -
                            new Date(intern.startDate).getTime()) /
                        (1000 * 60 * 60 * 24);
                    return sum + duration;
                }, 0) / completedInternsData.length
                : 0;

        // Calculate average rating
        const allEvaluations = allInterns.flatMap((i) => i.evaluations);
        const avgRating =
            allEvaluations.length > 0
                ? allEvaluations.reduce((sum, e) => sum + e.rating, 0) /
                allEvaluations.length
                : 0;

        // Calculate total stipend paid
        const totalStipendPaid = allInterns.reduce((sum, intern) => {
            const paidPayments = intern.stipendPayments.filter(
                (p) => p.status === 'Paid'
            );
            return (
                sum + paidPayments.reduce((pSum, p) => pSum + p.amount, 0)
            );
        }, 0);

        // Group by university
        const byUniversity: Record<string, number> = {};
        allInterns.forEach((intern) => {
            const uni = intern.university || 'Unknown';
            byUniversity[uni] = (byUniversity[uni] || 0) + 1;
        });

        // Mentor workload
        const mentorWorkload: Record<string, number> = {};
        allInterns
            .filter((i) => i.mentorId && i.status === 'Active')
            .forEach((intern) => {
                const mentorId = intern.mentorId!;
                mentorWorkload[mentorId] = (mentorWorkload[mentorId] || 0) + 1;
            });

        return NextResponse.json({
            total: totalInterns,
            active: activeInterns,
            completed: completedInterns,
            upcoming: upcomingInterns,
            terminated: terminatedInterns,
            avgDuration: Math.round(avgDuration),
            avgRating: Math.round(avgRating * 10) / 10,
            totalStipendPaid: Math.round(totalStipendPaid * 100) / 100,
            byUniversity,
            mentorWorkload,
        });
    } catch (error) {
        console.error('Error fetching intern stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch intern statistics' },
            { status: 500 }
        );
    }
}
