import { NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';

export async function GET() {
    try {
        // Simple database health check with retry logic
        await withRetry(async () => {
            return await db.$queryRaw`SELECT 1`;
        });

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 503 });
    }
}