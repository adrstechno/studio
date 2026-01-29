const bcrypt = require('bcryptjs');

// Simple script to create admin user using direct database connection
async function createAdminUser() {
    try {
        // Import the database connection from the lib
        const { db } = require('./src/lib/db.ts');
        
        console.log('🌱 Creating admin user...');

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Create admin user
        const adminUser = await db.user.upsert({
            where: { email: 'admin@adrs.com' },
            update: {
                passwordHash: hashedPassword,
                role: 'admin',
            },
            create: {
                email: 'admin@adrs.com',
                name: 'Admin User',
                passwordHash: hashedPassword,
                role: 'admin',
            },
        });

        console.log('✅ Admin user created/updated:', adminUser.email);

        console.log('\n🎉 Admin user creation completed!');
        console.log('\n📋 Login Credentials:');
        console.log('Email: admin@adrs.com');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        
        // If the error is about missing tables, let's try to create them
        if (error.message.includes('does not exist')) {
            console.log('\n💡 It looks like the database tables might not exist.');
            console.log('Please run: npx prisma db push');
            console.log('Then try this script again.');
        }
    }
}

createAdminUser();