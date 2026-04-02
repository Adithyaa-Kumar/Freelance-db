// Seed Controller - Handle data seeding and import operations

import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

/**
 * POST /api/seed/import
 * Populate database with realistic sample data
 * Idempotent operation - can be run multiple times safely
 */
export const seedDatabase = async (req, res) => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Get current user from auth middleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Delete existing data for this user (preserve other users' data)
    console.log('🗑️  Clearing existing data for user...');
    await prisma.activityLog.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({
      where: {
        project: { userId },
      },
    });
    await prisma.task.deleteMany({
      where: {
        project: { userId },
      },
    });
    await prisma.project.deleteMany({ where: { userId } });
    await prisma.client.deleteMany({ where: { userId } });

    // Create clients (1:1 with users, multiple per user for demo)
    console.log('🏢 Creating clients...');
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          userId,
          name: 'TechCorp Inc',
          email: 'contact@techcorp.com',
          company: 'Technology Solutions',
        },
      }),
      prisma.client.create({
        data: {
          userId,
          name: 'Digital Designs',
          email: 'hello@digitaldesigns.com',
          company: 'Design Agency',
        },
      }),
      prisma.client.create({
        data: {
          userId,
          name: 'Growth Marketing Co',
          email: 'info@growthmarketing.com',
          company: 'Marketing Services',
        },
      }),
      prisma.client.create({
        data: {
          userId,
          name: 'Cloud Innovations',
          email: 'team@cloudinnovations.io',
          company: 'Software Development',
        },
      }),
    ]);

    // Create projects
    console.log('📁 Creating projects...');
    const projects = await Promise.all([
      // Client 1 projects
      prisma.project.create({
        data: {
          userId,
          clientId: clients[0].id,
          name: 'Website Redesign',
          description: 'Complete redesign of company website with modern UI',
          budget: 45000,
          status: 'ONGOING',
          priority: 'HIGH',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30'),
        },
      }),
      prisma.project.create({
        data: {
          userId,
          clientId: clients[0].id,
          name: 'Mobile App Development',
          description: 'Cross-platform mobile app for iOS and Android',
          budget: 120000,
          status: 'ONGOING',
          priority: 'HIGH',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-31'),
        },
      }),
      // Client 2 projects
      prisma.project.create({
        data: {
          userId,
          clientId: clients[1].id,
          name: 'Branding Package',
          description: 'Logo design, brand guidelines, and marketing materials',
          budget: 25000,
          status: 'COMPLETED',
          priority: 'MEDIUM',
          startDate: new Date('2023-11-01'),
          endDate: new Date('2024-01-15'),
        },
      }),
      prisma.project.create({
        data: {
          userId,
          clientId: clients[1].id,
          name: 'Social Media Campaign',
          description: 'Design and implementation of social media strategy',
          budget: 18000,
          status: 'ONGOING',
          priority: 'MEDIUM',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-31'),
        },
      }),
      // Client 3 projects
      prisma.project.create({
        data: {
          userId,
          clientId: clients[2].id,
          name: 'SEO Optimization',
          description: 'Website SEO audit and optimization services',
          budget: 15000,
          status: 'COMPLETED',
          priority: 'MEDIUM',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-28'),
        },
      }),
      prisma.project.create({
        data: {
          userId,
          clientId: clients[2].id,
          name: 'Content Marketing Strategy',
          description: 'Develop and execute content marketing plan',
          budget: 22000,
          status: 'ONGOING',
          priority: 'HIGH',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-31'),
        },
      }),
      // Client 4 projects
      prisma.project.create({
        data: {
          userId,
          clientId: clients[3].id,
          name: 'Cloud Infrastructure Setup',
          description: 'AWS and Azure infrastructure setup and optimization',
          budget: 65000,
          status: 'ONGOING',
          priority: 'HIGH',
          startDate: new Date('2024-02-15'),
          endDate: new Date('2024-07-15'),
        },
      }),
      prisma.project.create({
        data: {
          userId,
          clientId: clients[3].id,
          name: 'API Development',
          description: 'RESTful API development for mobile and web applications',
          budget: 85000,
          status: 'ONGOING',
          priority: 'HIGH',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-09-30'),
        },
      }),
    ]);

    // Create tasks
    console.log('📋 Creating tasks...');
    await Promise.all([
      // Tasks for Website Redesign
      prisma.task.create({
        data: {
          userId,
          projectId: projects[0].id,
          title: 'Wireframe design',
          status: 'COMPLETED',
          deadline: new Date('2024-02-15'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[0].id,
          title: 'UI mockups',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-03-15'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[0].id,
          title: 'Frontend development',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-04-30'),
        },
      }),
      // Tasks for Mobile App
      prisma.task.create({
        data: {
          userId,
          projectId: projects[1].id,
          title: 'Requirements analysis',
          status: 'COMPLETED',
          deadline: new Date('2024-02-28'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[1].id,
          title: 'Architecture design',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-03-31'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[1].id,
          title: 'Backend API development',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-05-31'),
        },
      }),
      // Tasks for Branding Package (completed)
      prisma.task.create({
        data: {
          userId,
          projectId: projects[2].id,
          title: 'Logo concepts',
          status: 'COMPLETED',
          deadline: new Date('2023-11-15'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[2].id,
          title: 'Brand guidelines',
          status: 'COMPLETED',
          deadline: new Date('2023-12-15'),
        },
      }),
      // Tasks for Social Media
      prisma.task.create({
        data: {
          userId,
          projectId: projects[3].id,
          title: 'Strategy planning',
          status: 'COMPLETED',
          deadline: new Date('2024-03-15'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[3].id,
          title: 'Content creation',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-04-30'),
        },
      }),
      // Additional tasks
      prisma.task.create({
        data: {
          userId,
          projectId: projects[4].id,
          title: 'SEO audit',
          status: 'COMPLETED',
          deadline: new Date('2024-01-31'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[5].id,
          title: 'Content calendar planning',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-04-30'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[6].id,
          title: 'Infrastructure assessment',
          status: 'COMPLETED',
          deadline: new Date('2024-03-15'),
        },
      }),
      prisma.task.create({
        data: {
          userId,
          projectId: projects[7].id,
          title: 'Database design',
          status: 'IN_PROGRESS',
          deadline: new Date('2024-05-15'),
        },
      }),
    ]);

    // Create payments
    console.log('💳 Creating payments...');
    await Promise.all([
      // Payments for Project 1
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[0].id,
          amount: 22500,
          status: 'PAID',
          invoiceNumber: 'INV-001',
          dueDate: new Date('2024-02-15'),
          paidDate: new Date('2024-02-10'),
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[0].id,
          amount: 22500,
          status: 'PENDING',
          invoiceNumber: 'INV-002',
          dueDate: new Date('2024-05-15'),
        },
      }),
      // Payments for Project 2
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[1].id,
          amount: 40000,
          status: 'PAID',
          invoiceNumber: 'INV-003',
          dueDate: new Date('2024-02-01'),
          paidDate: new Date('2024-02-05'),
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[1].id,
          amount: 40000,
          status: 'PAID',
          invoiceNumber: 'INV-004',
          dueDate: new Date('2024-04-01'),
          paidDate: new Date('2024-04-03'),
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[1].id,
          amount: 40000,
          status: 'PENDING',
          invoiceNumber: 'INV-005',
          dueDate: new Date('2024-07-01'),
        },
      }),
      // Payments for Project 3 (completed)
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[2].id,
          amount: 25000,
          status: 'PAID',
          invoiceNumber: 'INV-006',
          dueDate: new Date('2024-01-15'),
          paidDate: new Date('2024-01-13'),
        },
      }),
      // Payments for Project 4
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[3].id,
          amount: 18000,
          status: 'PENDING',
          invoiceNumber: 'INV-007',
          dueDate: new Date('2024-05-15'),
        },
      }),
      // Payments for Project 5 (completed)
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[4].id,
          amount: 15000,
          status: 'PAID',
          invoiceNumber: 'INV-008',
          dueDate: new Date('2024-02-28'),
          paidDate: new Date('2024-02-27'),
        },
      }),
      // Payments for Project 6
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[5].id,
          amount: 22000,
          status: 'PENDING',
          invoiceNumber: 'INV-009',
          dueDate: new Date('2024-06-01'),
        },
      }),
      // Payments for Project 7
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[6].id,
          amount: 32500,
          status: 'PAID',
          invoiceNumber: 'INV-010',
          dueDate: new Date('2024-03-15'),
          paidDate: new Date('2024-03-14'),
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[6].id,
          amount: 32500,
          status: 'PENDING',
          invoiceNumber: 'INV-011',
          dueDate: new Date('2024-06-15'),
        },
      }),
      // Payments for Project 8
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[7].id,
          amount: 42500,
          status: 'PENDING',
          invoiceNumber: 'INV-012',
          dueDate: new Date('2024-06-01'),
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          projectId: projects[7].id,
          amount: 42500,
          status: 'PENDING',
          invoiceNumber: 'INV-013',
          dueDate: new Date('2024-08-01'),
        },
      }),
    ]);

    console.log('✓ Database seed completed successfully!\n');

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        clientsCreated: clients.length,
        projectsCreated: projects.length,
        totalSampleData: `${clients.length} clients, ${projects.length} projects, and associated tasks & payments`,
      },
    });
  } catch (error) {
    console.error('Seed operation failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed database',
    });
  }
};
