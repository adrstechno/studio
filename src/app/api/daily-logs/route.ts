import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const projectParam = searchParams.get('project');
    const type = searchParams.get('type'); // 'employee' | 'intern' | 'all'

    const where: any = {};

    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        const startOfDay = new Date(parsed);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsed);
        endOfDay.setHours(23, 59, 59, 999);
        where.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    } else if (from || to) {
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (fromDate || toDate) {
        const range: { gte?: Date; lte?: Date } = {};

        if (fromDate && !isNaN(fromDate.getTime())) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          range.gte = start;
        }

        if (toDate && !isNaN(toDate.getTime())) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          range.lte = end;
        }

        if (range.gte || range.lte) {
          where.date = range;
        }
      }
    }

    if (projectParam && projectParam !== 'all') {
      const decoded = decodeURIComponent(projectParam);
      where.project = {
        OR: [
          { id: decoded },
          { name: decoded },
        ],
      };
    }

    const logs = await db.projectDailyLog.findMany({
      where,
      include: {
        employee: true,
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 500,
    });

    // Optional filter by person type (employee vs intern) based on matching intern emails
    if (type === 'intern' || type === 'employee') {
      const interns = await db.intern.findMany({
        select: { email: true },
      });
      const internEmails = new Set(
        interns
          .map((i) => i.email?.toLowerCase())
          .filter((email): email is string => !!email),
      );

      const filteredLogs = logs.filter((log) => {
        const email = log.employee?.email?.toLowerCase();
        if (!email) return false;
        const isIntern = internEmails.has(email);
        return type === 'intern' ? isIntern : !isIntern;
      });

      return NextResponse.json(filteredLogs);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching admin daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 },
    );
  }
}

