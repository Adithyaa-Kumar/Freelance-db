/**
 * Seed Script - Populate database with realistic sample data
 * Run: node scripts/seedData.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👤 Creating users...');
    const password = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john@example.com',
        passwordHash: password,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        passwordHash: password,
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Mike Davis',
        email: 'mike@example.com',
        passwordHash: password,
      },
    });

    // Create clients (1:1 with users)
    console.log('🏢 Creating clients...');
    const client1 = await prisma.client.create({
      data: {
        userId: user1.id,
        name: 'TechCorp Inc',
        email: 'contact@techcorp.com',
        company: 'Technology Solutions',
      },
    });

    const client2 = await prisma.client.create({
      data: {
        userId: user2.id,
        name: 'Digital Designs',
        email: 'hello@digitaldesigns.com',
        company: 'Design Agency',
      },
    });

    const client3 = await prisma.client.create({
      data: {
        userId: user3.id,
        name: 'Growth Marketing Co',
        email: 'info@growthmarketing.com',
        company: 'Marketing Services',
      },
    });

    // Create projects
    console.log('📁 Creating projects...');
    const projects = [
      // Client 1 projects
      {
        clientId: client1.id,
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI',
        budget: 45000,
        status: 'ONGOING',
        priority: 'HIGH',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
      },
      {
        clientId: client1.id,
        name: 'Mobile App Development',
        description: 'Cross-platform mobile app for iOS and Android',
        budget: 120000,
        status: 'ONGOING',
        priority: 'HIGH',
        startDate: new Date('2024-02-01'),
        endDate: null,
      },
      {
        clientId: client1.id,
        name: 'Database Migration',
        description: 'Migrate from legacy system to modern PostgreSQL',
        budget: 35000,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-01-30'),
      },

      // Client 2 projects
      {
        clientId: client2.id,
        name: 'Brand Identity Design',
        description: 'Complete brand identity including logo, colors, typography',
        budget: 15000,
        status: 'COMPLETED',
        priority: 'HIGH',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-28'),
      },
      {
        clientId: client2.id,
        name: 'Social Media Campaign',
        description: '3-month social media marketing campaign',
        budget: 22000,
        status: 'ONGOING',
        priority: 'MEDIUM',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-31'),
      },
      {
        clientId: client2.id,
        name: 'Print Materials',
        description: 'Business cards, brochures, and packaging design',
        budget: 8500,
        status: 'ONGOING',
        priority: 'LOW',
        startDate: new Date('2024-04-15'),
        endDate: null,
      },

      // Client 3 projects
      {
        clientId: client3.id,
        name: 'SEO Optimization',
        description: 'Complete SEO audit and optimization for 50+ pages',
        budget: 12000,
        status: 'COMPLETED',
        priority: 'HIGH',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-03-31'),
      },
      {
        clientId: client3.id,
        name: 'Email Marketing Platform',
        description: 'Setup and configuration of email marketing system',
        budget: 28000,
        status: 'ONGOING',
        priority: 'MEDIUM',
        startDate: new Date('2024-03-15'),
        endDate: null,
      },
      {
        clientId: client3.id,
        name: 'Analytics Dashboard',
        description: 'Custom analytics dashboard for KPI tracking',
        budget: 35000,
        status: 'ONGOING',
        priority: 'HIGH',
        startDate: new Date('2024-04-01'),
        endDate: null,
      },
    ];

    const createdProjects = await Promise.all(
      projects.map((proj) => prisma.project.create({ data: proj }))
    );

    console.log(`✅ Created ${createdProjects.length} projects`);

    // Create tasks
    console.log('✓ Creating tasks...');
    const tasks = [];

    for (let i = 0; i < createdProjects.length; i++) {
      const project = createdProjects[i];
      const taskCount = Math.floor(Math.random() * 10) + 5; // 5-15 tasks per project

      for (let j = 0; j < taskCount; j++) {
        const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        tasks.push({
          projectId: project.id,
          title: `Task ${j + 1} - ${['Design', 'Development', 'Testing', 'Deployment', 'Documentation'][j % 5]} work`,
          status: randomStatus,
          deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        });
      }
    }

    await Promise.all(tasks.map((task) => prisma.task.create({ data: task })));
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create payments
    console.log('💰 Creating payments...');
    const payments = [];
    let invoiceNum = 1000;

    for (const project of createdProjects) {
      const paymentCount = Math.floor(Math.random() * 4) + 1; // 1-4 payments per project
      const amountPerPayment = project.budget / paymentCount;

      for (let i = 0; i < paymentCount; i++) {
        const statuses = ['PAID', 'PENDING', 'OVERDUE'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        payments.push({
          projectId: project.id,
          amount: parseFloat((amountPerPayment * (0.8 + Math.random() * 0.4)).toFixed(2)),
          currency: 'USD',
          invoiceNumber: `INV-${invoiceNum++}`,
          status: randomStatus,
          dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
          paidDate: randomStatus === 'PAID' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        });
      }
    }

    await Promise.all(payments.map((payment) => prisma.payment.create({ data: payment })));
    console.log(`✅ Created ${payments.length} payments`);

    // Create activity logs
    console.log('📝 Creating activity logs...');
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'REVIEW', 'APPROVE'];
    const activityLogs = [];

    for (const user of [user1, user2, user3]) {
      for (let i = 0; i < 10; i++) {
        activityLogs.push({
          userId: user.id,
          action: actions[Math.floor(Math.random() * actions.length)],
          details: JSON.stringify({
            entity: ['project', 'task', 'payment'][Math.floor(Math.random() * 3)],
            timestamp: new Date(),
          }),
        });
      }
    }

    await Promise.all(activityLogs.map((log) => prisma.activityLog.create({ data: log })));
    console.log(`✅ Created ${activityLogs.length} activity logs`);

    console.log('\n✨ Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Users: 3`);
    console.log(`  - Clients: 3`);
    console.log(`  - Projects: ${createdProjects.length}`);
    console.log(`  - Tasks: ${tasks.length}`);
    console.log(`  - Payments: ${payments.length}`);
    console.log(`  - Activity Logs: ${activityLogs.length}`);
    console.log('\n💡 Test credentials:');
    console.log('   email: john@example.com');
    console.log('   password: password123');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
