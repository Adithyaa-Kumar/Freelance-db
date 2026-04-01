// Smart Query Builder - Dynamically constructs optimized SQL queries
// Hides JOIN, GROUP BY, SUBQUERY complexity behind a clean parameter interface

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Query parameters structure:
 * {
 *   entity: "projects" | "tasks" | "payments" | "clients" | "activities",
 *   filters: { field: value, ... },
 *   include: ["client", "tasks", "payments"], // Dynamic relations
 *   sort: { field: "name", order: "asc" | "desc" },
 *   aggregations: { type: "count|sum|avg", field: "id|amount|budget" }, 
 *   groupBy: "projectId" | "status", // Enables GROUP BY internally
 *   search: "text search string",
 *   pagination: { page: 1, limit: 10 },
 *   viewMode: "summary" | "detailed" | "analytics"
 * }
 */

export class QueryBuilder {
  /**
   * Main entry point - processes user request and constructs query
   */
  static async execute(params) {
    try {
      const { entity, filters, include, sort, aggregations, groupBy, search, pagination, viewMode } = params;

      if (!entity) throw new Error('Entity is required');

      // Route to appropriate query builder
      switch (entity) {
        case 'projects':
          return await this.buildProjectsQuery({ filters, include, sort, aggregations, search, pagination, viewMode });
        case 'tasks':
          return await this.buildTasksQuery({ filters, include, sort, aggregations, groupBy, search, pagination, viewMode });
        case 'payments':
          return await this.buildPaymentsQuery({ filters, include, sort, aggregations, groupBy, search, pagination, viewMode });
        case 'clients':
          return await this.buildClientsQuery({ filters, include, sort, aggregations, search, pagination, viewMode });
        case 'analytics':
          return await this.buildAnalyticsQuery({ filters });
        default:
          throw new Error(`Unknown entity: ${entity}`);
      }
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * PROJECTS QUERY BUILDER
   * Constructs JOINs, GROUP BY, and aggregations based on UI selections
   */
  static async buildProjectsQuery({ filters, include, sort, aggregations, search, pagination, viewMode }) {
    let query = {
      where: {},
      include: {},
      orderBy: {},
    };

    // Apply filters (WHERE clause equivalent)
    if (filters) {
      if (filters.status) query.where.status = filters.status;
      if (filters.priority) query.where.priority = filters.priority;
      if (filters.clientId) query.where.clientId = filters.clientId;
      if (filters.budgetMin) query.where.budget = { gte: parseFloat(filters.budgetMin) };
      if (filters.budgetMax) {
        query.where.budget = { ...query.where.budget, lte: parseFloat(filters.budgetMax) };
      }
    }

    // Apply search (LIKE equivalent)
    if (search) {
      query.where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Dynamic JOINs based on includes
    if (include?.includes('client')) {
      query.include.client = { select: { id: true, name: true, email: true, company: true } };
    }
    if (include?.includes('tasks')) {
      query.include.tasks = {
        select: { id: true, title: true, status: true, deadline: true },
        take: 5,
      };
    }
    if (include?.includes('payments')) {
      query.include.payments = {
        select: { id: true, amount: true, status: true, invoiceNumber: true },
        take: 5,
      };
    }

    // Apply sorting
    if (sort?.field) {
      query.orderBy[sort.field] = sort.order || 'asc';
    } else {
      query.orderBy.createdAt = 'desc';
    }

    // Pagination
    if (pagination) {
      query.skip = (pagination.page - 1) * pagination.limit;
      query.take = pagination.limit;
    }

    // Execute query
    const data = await prisma.project.findMany(query);

    // Post-processing aggregations (if needed)
    let enrichedData = data;
    if (aggregations || viewMode === 'summary') {
      enrichedData = await this.enrichProjectData(data, { aggregations, viewMode });
    }

    // Get total count for pagination
    const total = await prisma.project.count({ where: query.where });

    return {
      columns: this.getProjectColumns(include),
      rows: enrichedData,
      total,
      pagination: { page: pagination?.page || 1, limit: pagination?.limit || 10 },
      metadata: { entity: 'projects', viewMode },
    };
  }

  /**
   * TASKS QUERY BUILDER
   * Includes GROUP BY logic internally when grouping is enabled
   */
  static async buildTasksQuery({ filters, include, sort, aggregations, groupBy, search, pagination, viewMode }) {
    let query = {
      where: {},
      include: {},
      orderBy: {},
    };

    // Apply filters
    if (filters) {
      if (filters.status) query.where.status = filters.status;
      if (filters.projectId) query.where.projectId = filters.projectId;
    }

    // Apply search
    if (search) {
      query.where.title = { contains: search, mode: 'insensitive' };
    }

    // Dynamic JOINs
    if (include?.includes('project')) {
      query.include.project = { select: { id: true, name: true, clientId: true } };
    }

    // Apply sorting
    if (sort?.field) {
      query.orderBy[sort.field] = sort.order || 'asc';
    } else {
      query.orderBy.createdAt = 'desc';
    }

    // Pagination
    if (pagination) {
      query.skip = (pagination.page - 1) * pagination.limit;
      query.take = pagination.limit;
    }

    const data = await prisma.task.findMany(query);

    // GROUP BY logic (implemented in post-processing)
    let processedData = data;
    if (groupBy || viewMode === 'summary') {
      processedData = await this.groupAndAggregateTaskData(data, { groupBy, viewMode });
    }

    const total = await prisma.task.count({ where: query.where });

    return {
      columns: this.getTaskColumns(include, viewMode),
      rows: processedData,
      total,
      pagination: { page: pagination?.page || 1, limit: pagination?.limit || 10 },
      metadata: { entity: 'tasks', viewMode, groupBy },
    };
  }

  /**
   * PAYMENTS QUERY BUILDER
   * Uses SUM aggregation and GROUP BY for summary views
   */
  static async buildPaymentsQuery({ filters, include, sort, aggregations, groupBy, search, pagination, viewMode }) {
    let query = {
      where: {},
      include: {},
      orderBy: {},
    };

    // Apply filters
    if (filters) {
      if (filters.status) query.where.status = filters.status;
      if (filters.projectId) query.where.projectId = filters.projectId;
    }

    // Apply search
    if (search) {
      query.where.invoiceNumber = { contains: search, mode: 'insensitive' };
    }

    // Dynamic JOINs
    if (include?.includes('project')) {
      query.include.project = { select: { id: true, name: true, clientId: true } };
    }

    // Sorting
    if (sort?.field) {
      query.orderBy[sort.field] = sort.order || 'asc';
    } else {
      query.orderBy.createdAt = 'desc';
    }

    // Pagination
    if (pagination) {
      query.skip = (pagination.page - 1) * pagination.limit;
      query.take = pagination.limit;
    }

    const data = await prisma.payment.findMany(query);

    // GROUP BY + SUM aggregation (in post-processing)
    let processedData = data;
    if (viewMode === 'summary' || groupBy) {
      processedData = await this.summarizePaymentData(data, { groupBy, viewMode });
    }

    const total = await prisma.payment.count({ where: query.where });

    return {
      columns: this.getPaymentColumns(viewMode),
      rows: processedData,
      total,
      pagination: { page: pagination?.page || 1, limit: pagination?.limit || 10 },
      metadata: { entity: 'payments', viewMode, groupBy },
    };
  }

  /**
   * CLIENTS QUERY BUILDER
   * Uses JOIN + GROUP BY to compute project counts and revenue
   */
  static async buildClientsQuery({ filters, include, sort, aggregations, search, pagination, viewMode }) {
    let query = {
      where: {},
      include: {},
      orderBy: {},
    };

    // Apply search
    if (search) {
      query.where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Dynamic JOINs
    if (include?.includes('projects') || viewMode === 'summary') {
      query.include.projects = { select: { id: true, name: true, budget: true, status: true } };
    }

    // Sorting
    if (sort?.field) {
      query.orderBy[sort.field] = sort.order || 'asc';
    } else {
      query.orderBy.name = 'asc';
    }

    // Pagination
    if (pagination) {
      query.skip = (pagination.page - 1) * pagination.limit;
      query.take = pagination.limit;
    }

    const data = await prisma.client.findMany(query);

    // Enrich with aggregations (GROUP BY equivalent)
    let enrichedData = data;
    if (include?.includes('projects') || viewMode === 'summary') {
      enrichedData = this.enrichClientData(data, { include, viewMode });
    }

    const total = await prisma.client.count({ where: query.where });

    return {
      columns: this.getClientColumns(include, viewMode),
      rows: enrichedData,
      total,
      pagination: { page: pagination?.page || 1, limit: pagination?.limit || 10 },
      metadata: { entity: 'clients', viewMode },
    };
  }

  /**
   * ANALYTICS QUERY BUILDER
   * Uses subqueries and complex aggregations internally
   */
  static async buildAnalyticsQuery({ filters }) {
    const insights = {};

    // Metric 1: Total Projects Count
    insights.totalProjects = await prisma.project.count();

    // Metric 2: Active Projects (CASE logic equivalent)
    insights.activeProjects = await prisma.project.count({
      where: { status: 'ONGOING' },
    });

    // Metric 3: Completed Projects
    insights.completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });

    // Metric 4: Total Revenue (SUM aggregation)
    const paymentSummary = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });
    insights.totalRevenue = paymentSummary._sum.amount || 0;

    // Metric 5: Pending Revenue
    const pendingSummary = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING' },
    });
    insights.pendingRevenue = pendingSummary._sum.amount || 0;

    // Metric 6: Active Tasks
    insights.activeTasks = await prisma.task.count({
      where: { status: 'IN_PROGRESS' },
    });

    // Metric 7: Completed Tasks
    insights.completedTasks = await prisma.task.count({
      where: { status: 'COMPLETED' },
    });

    // Metric 8: Top Clients by Revenue (SUBQUERY equivalent)
    const topClients = await prisma.client.findMany({
      include: {
        projects: {
          include: {
            payments: { where: { status: 'PAID' } },
          },
        },
      },
      take: 5,
    });

    insights.topClients = topClients.map((client) => {
      const totalClientRevenue = client.projects.reduce((sum, proj) => {
        const projRevenue = proj.payments.reduce((s, pay) => s + pay.amount, 0);
        return sum + projRevenue;
      }, 0);

      return {
        name: client.name,
        projectCount: client.projects.length,
        totalRevenue: totalClientRevenue,
      };
    });

    // Metric 9: High-Value Projects (SUBQUERY - projects above average)
    const avgBudget = await prisma.project.aggregate({
      _avg: { budget: true },
    });

    insights.highValueProjects = await prisma.project.findMany({
      where: { budget: { gt: avgBudget._avg.budget } },
      include: { client: { select: { name: true } } },
      orderBy: { budget: 'desc' },
      take: 5,
    });

    // Metric 10: Projects by Status (GROUP BY equivalent)
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: true,
    });

    insights.projectsByStatus = projectsByStatus;

    return {
      type: 'analytics',
      metrics: insights,
      timestamp: new Date(),
    };
  }

  // ============================================================================
  // HELPER METHODS - Data Enrichment & Aggregation
  // ============================================================================

  /**
   * Enrich project data with computed fields (GROUP BY + aggregations)
   */
  static async enrichProjectData(projects, { aggregations, viewMode }) {
    return projects.map((proj) => {
      const enriched = { ...proj };

      // Add computed task count
      if (viewMode === 'summary' && proj.tasks) {
        enriched.taskCount = proj.tasks.length;
        enriched.completedTasks = proj.tasks.filter((t) => t.status === 'COMPLETED').length;
        enriched.completionPercentage = proj.tasks.length > 0 
          ? Math.round((enriched.completedTasks / proj.tasks.length) * 100)
          : 0;
      }

      // Add computed payment summary
      if (viewMode === 'summary' && proj.payments) {
        enriched.totalPayments = proj.payments.length;
        enriched.totalAmount = proj.payments.reduce((sum, p) => sum + p.amount, 0);
        enriched.paidAmount = proj.payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
      }

      return enriched;
    });
  }

  /**
   * Group and aggregate task data (GROUP BY projectId equivalent)
   */
  static async groupAndAggregateTaskData(tasks, { groupBy, viewMode }) {
    if (groupBy === 'projectId' && viewMode === 'summary') {
      const grouped = {};
      tasks.forEach((task) => {
        const key = task.projectId;
        if (!grouped[key]) {
          grouped[key] = {
            projectId: key,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            pendingTasks: 0,
            tasks: [],
          };
        }
        grouped[key].totalTasks += 1;
        grouped[key].tasks.push(task);

        if (task.status === 'COMPLETED') grouped[key].completedTasks += 1;
        if (task.status === 'IN_PROGRESS') grouped[key].inProgressTasks += 1;
        if (task.status === 'PENDING') grouped[key].pendingTasks += 1;
      });

      return Object.values(grouped);
    }

    return tasks;
  }

  /**
   * Summarize payment data (GROUP BY + SUM aggregation)
   */
  static async summarizePaymentData(payments, { groupBy, viewMode }) {
    if (groupBy === 'projectId' || viewMode === 'summary') {
      const grouped = {};
      payments.forEach((payment) => {
        const key = groupBy === 'projectId' ? payment.projectId : payment.status;
        if (!grouped[key]) {
          grouped[key] = {
            key,
            totalPayments: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            overdueAmount: 0,
          };
        }
        grouped[key].totalPayments += 1;
        grouped[key].totalAmount += payment.amount;

        if (payment.status === 'PAID') grouped[key].paidAmount += payment.amount;
        if (payment.status === 'PENDING') grouped[key].pendingAmount += payment.amount;
        if (payment.status === 'OVERDUE') grouped[key].overdueAmount += payment.amount;
      });

      return Object.values(grouped);
    }

    return payments;
  }

  /**
   * Enrich client data with project aggregations (GROUP BY + COUNT)
   */
  static enrichClientData(clients, { include, viewMode }) {
    return clients.map((client) => {
      const enriched = { ...client };

      if (include?.includes('projects') && client.projects) {
        enriched.projectCount = client.projects.length;
        enriched.totalBudget = client.projects.reduce((sum, p) => sum + p.budget, 0);
        enriched.activeProjects = client.projects.filter((p) => p.status === 'ONGOING').length;
        enriched.completedProjects = client.projects.filter((p) => p.status === 'COMPLETED').length;
      }

      return enriched;
    });
  }

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  static getProjectColumns(include) {
    const cols = ['name', 'status', 'priority', 'budget', 'startDate'];

    if (include?.includes('client')) cols.push('clientName');
    if (include?.includes('tasks')) cols.push('taskCount');
    if (include?.includes('payments')) cols.push('totalAmount');

    return cols;
  }

  static getTaskColumns(include, viewMode) {
    const cols = ['title', 'status', 'deadline'];

    if (include?.includes('project')) cols.push('projectName');
    if (viewMode === 'summary') cols.push('completionStatus');

    return cols;
  }

  static getPaymentColumns(viewMode) {
    const cols = ['invoiceNumber', 'amount', 'status', 'dueDate'];

    if (viewMode === 'summary') cols.push('totalAmount', 'projectId');

    return cols;
  }

  static getClientColumns(include, viewMode) {
    const cols = ['name', 'email', 'company'];

    if (include?.includes('projects') || viewMode === 'summary') {
      cols.push('projectCount', 'totalBudget');
    }

    return cols;
  }
}

export default QueryBuilder;
