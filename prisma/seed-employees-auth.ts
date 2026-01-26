import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Creating User accounts for existing employees...\n');

    // Get all employees without User accounts
    const employees = await prisma.employee.findMany({
        where: {
            user: null, // Only employees without User accounts
        },
    });

    if (employees.length === 0) {
        console.log('✅ All employees already have User accounts!');
        return;
    }

    console.log(`Found ${employees.length} employees without User accounts\n`);

    const results = [];

    for (const employee of employees) {
        try {
            // Generate a default password: FirstName@123
            const firstName = employee.name.split(' ')[0];
            const defaultPassword = `${firstName}@123`;
            const hashedPassword = await hashPassword(defaultPassword);

            // Create User account for employee
            const user = await prisma.user.create({
                data: {
                    email: employee.email,
                    name: employee.name,
                    passwordHash: hashedPassword,
                    role: 'employee',
                    employeeId: employee.id,
                },
            });

            results.push({
                name: employee.name,
                email: employee.email,
                password: defaultPassword,
                success: true,
            });

            console.log(`✅ Created User for: ${employee.name}`);
            console.log(`   Email: ${employee.email}`);
            console.log(`   Password: ${defaultPassword}\n`);
        } catch (error: any) {
            console.error(`❌ Failed to create User for ${employee.name}:`, error.message);
            results.push({
                name: employee.name,
                email: employee.email,
                password: null,
                success: false,
                error: error.message,
            });
        }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Success: ${results.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);

    console.log('\n📋 Employee Credentials:');
    console.log('========================');
    results
        .filter(r => r.success)
        .forEach(r => {
            console.log(`${r.name}`);
            console.log(`  Email: ${r.email}`);
            console.log(`  Password: ${r.password}`);
            console.log('');
        });

    console.log('\n⚠️  IMPORTANT: Ask employees to change their passwords after first login!');
}

main()
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
