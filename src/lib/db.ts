import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: pg.Pool | undefined;
};

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL!;

    // Enhanced connection pool configuration
    const pool = new pg.Pool({
        connectionString,
        max: 10,                    // Reduced max connections
        min: 2,                     // Minimum connections
        idleTimeoutMillis: 20000,   // Reduced idle timeout
        connectionTimeoutMillis: 5000, // Increased connection timeout
        statement_timeout: 30000,      // SQL statement timeout
        query_timeout: 30000,          // Query timeout
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Database pool error:', err);
    });

    pool.on('connect', () => {
        console.log('Database pool connected');
    });

    globalForPrisma.pool = pool;
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'pretty',
    });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}

// Utility function for database operations with retry logic
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);

            // Don't retry on certain errors
            if (error.code === 'P2002' || error.code === 'P2025') {
                throw error;
            }

            if (attempt < maxRetries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    throw lastError!;
}
