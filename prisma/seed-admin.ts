import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function main() {
    const adminPassword = 'Admin@123'; // Change this in production!
    const hashedPassword = await hashPassword(adminPassword);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@adrs.com' },
        update: {},
        create: {
            email: 'admin@adrs.com',
            name: 'Admin User',
            passwordHash: hashedPassword,
            role: 'admin'
        }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('\n⚠️  Please change this password after first login!');
}

main()
    .catch((error) => {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
