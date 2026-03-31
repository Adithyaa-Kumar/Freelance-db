import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clean up existing data (optional - remove for production)
    // await prisma.activityLog.deleteMany();
    // await prisma.task.deleteMany();
    // await prisma.payment.deleteMany();
    // await prisma.project.deleteMany();
    // await prisma.client.deleteMany();
    // await prisma.user.deleteMany();

    // ========================================================================
    // 1. CREATE USERS
    // ========================================================================
    console.log('📝 Creating users...');

    const user1 = await prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@acmecorp.com',
        passwordHash: await bcrypt.hash('SecurePassword123!', 10),
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@techstartup.io',
        passwordHash: await bcrypt.hash('AnotherPassword456!', 10),
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@globalenterprises.com',
        passwordHash: await bcrypt.hash('ThirdPassword789!', 10),
      },
    });

    console.log(` ✓ Created 3 users`);

    // ========================================================================
    // 2. CREATE CLIENTS
    // ========================================================================
    console.log('🏢 Creating clients...');

    const client1 = await prisma.client.create({
      data: {
        userId: user1.id,
        name: 'Alice Johnson',
        email: 'alice@acmecorp.com',
        company: 'ACME Corporation',
      },
    });

    const client2 = await prisma.client.create({
      data: {
        userId: user2.id,
        name: 'Bob Smith',
        email: 'bob@techstartup.io',
        company: 'TechStartup Inc',
      },
    });

    const client3 = await prisma.client.create({
      data: {
        userId: user3.id,
        name: 'Carol Davis',
        email: 'carol@globalenterprises.com',
        company: 'Global Enterprises Ltd',
      },
    });

    console.log(` ✓ Created 3 clients`);

    // ========================================================================
    // 3. CREATE PROJECTS
    // ========================================================================
    console.log('📊 Creating projects...');

    const project1 = await prisma.project.create({
      data: {
        clientId: client1.id,
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX and mobile responsiveness',
        budget: 15000,
        status: 'COMPLETED',
        priority: 'HIGH',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2026-03-20'),
      },
    });

    const project2 = await prisma.project.create({
      data: {
        clientId: client2.id,
        name: 'Mobile App Development',
        description: 'Native iOS and Android app for real-time collaboration',
        budget: 45000,
        status: 'ONGOING',
        priority: 'HIGH',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-30'),
      },
    });

    const project3 = await prisma.project.create({
      data: {
        clientId: client1.id,
        name: 'Database Migration',
        description: 'Migrate legacy database to PostgreSQL with zero downtime',
        budget: 8500,
        status: 'ONGOING',
        priority: 'MEDIUM',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-05-15'),
      },
    });

    const project4 = await prisma.project.create({
      data: {
        clientId: client3.id,
        name: 'Enterprise Integration',
        description: 'Integrate multiple systems with enterprise message queue',
        budget: 65000,
        status: 'ONGOING',
        priority: 'MEDIUM',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-09-30'),
      },
    });

    console.log(` ✓ Created 4 projects`);

    // ========================================================================
    // 4. CREATE PAYMENTS
    // ========================================================================
    console.log('💰 Creating payments...');

    const payment1 = await prisma.payment.create({
      data: {
        projectId: project1.id,
        amount: 7500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-001',
        status: 'PAID',
        dueDate: new Date('2026-02-15'),
        paidDate: new Date('2026-02-14'),
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        projectId: project1.id,
        amount: 7500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-002',
        status: 'PAID',
        dueDate: new Date('2026-03-15'),
        paidDate: new Date('2026-03-15'),
      },
    });

    const payment3 = await prisma.payment.create({
      data: {
        projectId: project2.id,
        amount: 22500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-003',
        status: 'PAID',
        dueDate: new Date('2026-03-01'),
        paidDate: new Date('2026-02-28'),
      },
    });

    const payment4 = await prisma.payment.create({
      data: {
        projectId: project2.id,
        amount: 22500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-004',
        status: 'PENDING',
        dueDate: new Date('2026-04-15'),
        paidDate: null,
      },
    });

    const payment5 = await prisma.payment.create({
      data: {
        projectId: project3.id,
        amount: 8500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-005',
        status: 'PENDING',
        dueDate: new Date('2026-04-01'),
        paidDate: null,
      },
    });

    const payment6 = await prisma.payment.create({
      data: {
        projectId: project4.id,
        amount: 32500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-006',
        status: 'PENDING',
        dueDate: new Date('2026-03-30'),  // Overdue
        paidDate: null,
      },
    });

    const payment7 = await prisma.payment.create({
      data: {
        projectId: project4.id,
        amount: 32500,
        currency: 'USD',
        invoiceNumber: 'INV-2026-007',
        status: 'OVERDUE',
        dueDate: new Date('2026-02-28'),  // Past due
        paidDate: null,
      },
    });

    console.log(` ✓ Created 7 payments`);

    // ========================================================================
    // 5. CREATE TASKS
    // ========================================================================
    console.log('✅ Creating tasks...');

    const task1 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: 'Design mockups',
        status: 'COMPLETED',
        deadline: new Date('2026-02-01'),
      },
    });

    const task2 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: 'Frontend development',
        status: 'COMPLETED',
        deadline: new Date('2026-02-28'),
      },
    });

    const task3 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: 'Testing and QA',
        status: 'COMPLETED',
        deadline: new Date('2026-03-15'),
      },
    });

    const task4 = await prisma.task.create({
      data: {
        projectId: project2.id,
        title: 'API design',
        status: 'IN_PROGRESS',
        deadline: new Date('2026-03-31'),
      },
    });

    const task5 = await prisma.task.create({
      data: {
        projectId: project2.id,
        title: 'iOS development',
        status: 'PENDING',
        deadline: new Date('2026-05-30'),
      },
    });

    const task6 = await prisma.task.create({
      data: {
        projectId: project2.id,
        title: 'Android development',
        status: 'PENDING',
        deadline: new Date('2026-06-15'),
      },
    });

    const task7 = await prisma.task.create({
      data: {
        projectId: project3.id,
        title: 'Schema mapping',
        status: 'COMPLETED',
        deadline: new Date('2026-03-10'),
      },
    });

    const task8 = await prisma.task.create({
      data: {
        projectId: project3.id,
        title: 'Data migration',
        status: 'IN_PROGRESS',
        deadline: new Date('2026-04-15'),
      },
    });

    const task9 = await prisma.task.create({
      data: {
        projectId: project3.id,
        title: 'Testing and validation',
        status: 'PENDING',
        deadline: new Date('2026-05-15'),
      },
    });

    const task10 = await prisma.task.create({
      data: {
        projectId: project4.id,
        title: 'System architecture design',
        status: 'COMPLETED',
        deadline: new Date('2026-02-15'),
      },
    });

    const task11 = await prisma.task.create({
      data: {
        projectId: project4.id,
        title: 'Message queue setup',
        status: 'IN_PROGRESS',
        deadline: new Date('2026-04-30'),
      },
    });

    const task12 = await prisma.task.create({
      data: {
        projectId: project4.id,
        title: 'Integration testing',
        status: 'PENDING',
        deadline: new Date('2026-08-31'),
      },
    });

    console.log(` ✓ Created 12 tasks`);

    // ========================================================================
    // 6. CREATE ACTIVITY LOGS
    // ========================================================================
    console.log('📝 Creating activity logs...');

    const log1 = await prisma.activityLog.create({
      data: {
        userId: user1.id,
        action: 'PROJECT_CREATED',
        details: `Created project: ${project1.name}`,
      },
    });

    const log2 = await prisma.activityLog.create({
      data: {
        userId: user2.id,
        action: 'PROJECT_CREATED',
        details: `Created project: ${project2.name}`,
      },
    });

    const log3 = await prisma.activityLog.create({
      data: {
        userId: user1.id,
        action: 'PAYMENT_RECEIVED',
        details: `Payment received: INV-2026-001`,
      },
    });

    const log4 = await prisma.activityLog.create({
      data: {
        userId: user2.id,
        action: 'TASK_COMPLETED',
        details: `Task completed: ${task4.title}`,
      },
    });

    const log5 = await prisma.activityLog.create({
      data: {
        userId: user3.id,
        action: 'PROJECT_CREATED',
        details: `Created project: ${project4.name}`,
      },
    });

    console.log(` ✓ Created 5 activity logs`);

    // ========================================================================
    // 7. SUMMARY STATISTICS
    // ========================================================================
    console.log('\n📊 Seed Summary:');
    console.log(`   Users: 3 created`);
    console.log(`   Clients: 3 created`);
    console.log(`   Projects: 4 created`);
    console.log(`   Payments: 7 created (2 paid, 4 pending, 1 overdue)`);
    console.log(`   Tasks: 12 created`);
    console.log(`   Activity Logs: 5 created`);
    console.log('\n💡 Test Credentials:');
    console.log(`   Email: alice@acmecorp.com`);
    console.log(`   Password: SecurePassword123!`);
    console.log(`\n✅ Database seeding completed successfully!`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
