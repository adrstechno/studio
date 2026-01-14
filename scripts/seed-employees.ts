import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const employees = [
    {
        name: "Ishant Patel",
        email: "ishuustuf@gmail.com",
        phone: "8770725632",
        employeeId: "ADRS7464IT1010",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Sapeksh Vishwakarma",
        email: "sapekshvishwakarma@gmail.com",
        phone: "9285543488",
        employeeId: "ADRS7464IT1011",
        role: "QA",
        project: "Unassigned"
    },
    {
        name: "Sachin Sen",
        email: "sachinsen1920@gmail.com",
        phone: "7771899074",
        employeeId: "ADRS7464IT1014",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Srajal Vishwakarma",
        email: "srajalvishwakarma8@gmail.com",
        phone: "6264714201",
        employeeId: "ADRS7464IT1015",
        role: "Designer",
        project: "Unassigned"
    },
    {
        name: "Sparsh Sahu",
        email: "sparshsahu8435@gmail.com",
        phone: "7974772962",
        employeeId: "ADRS7464IT1016",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Sakshi Jain",
        email: "sakshi2408jain@gmail.com",
        phone: "7987435746",
        employeeId: "ADRS7464IT1022",
        role: "Manager",
        project: "Unassigned"
    },
    {
        name: "Sneha Koshta",
        email: "snehakoshta1@gmail.com",
        phone: "9340930825",
        employeeId: "ADRS7464IT1023",
        role: "Designer",
        project: "Unassigned"
    },
    {
        name: "Danish Khan",
        email: "danish.prof21@gmail.com",
        phone: "8103858929",
        employeeId: "ADRS7464IT1021",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Ayush Kachhi",
        email: "ayushkachhi52@gmail.com",
        phone: "9575079392",
        employeeId: "ADRS7464IT1024",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Annpurna Sharma",
        email: "annpurnasha474@gmail.com",
        phone: "8817156755",
        employeeId: "ADRS7464IT1017",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Roshan Sachdev",
        email: "manalks1805@gmail.com",
        phone: "8770886419",
        employeeId: "ADRS7464IT1018",
        role: "Developer",
        project: "Unassigned"
    },
    {
        name: "Pragati Mishra",
        email: "pragatimis2004@gmail.com",
        phone: "9179039641",
        employeeId: "ADRS7464IT1019",
        role: "QA",
        project: "Unassigned"
    },
    {
        name: "Aman Mansooree",
        email: "mansooreeaman@gmail.com",
        phone: "9302877751",
        employeeId: "ADRS7464IT1020",
        role: "Developer",
        project: "Unassigned"
    }
];

async function main() {
    console.log('🌱 Starting employee seeding...');

    for (const employee of employees) {
        try {
            // Check if employee already exists
            const existing = await prisma.employee.findUnique({
                where: { email: employee.email }
            });

            if (existing) {
                console.log(`✓ Employee ${employee.name} (${employee.email}) already exists, skipping...`);
                continue;
            }

            // Create employee
            const created = await prisma.employee.create({
                data: {
                    name: employee.name,
                    email: employee.email,
                    role: employee.role as any,
                    project: employee.project,
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name.replace(/\s+/g, '')}`,
                }
            });

            console.log(`✓ Created employee: ${created.name} (${created.email})`);
        } catch (error) {
            console.error(`✗ Error creating employee ${employee.name}:`, error);
        }
    }

    console.log('✅ Employee seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
