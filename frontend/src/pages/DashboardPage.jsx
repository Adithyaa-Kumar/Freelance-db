import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { projectsApi } from '@services/api.js';
import { useProjectStore, useAuthStore } from '@hooks/useStore.js';
import { LoadingSpinner, ErrorAlert } from '@components/Common.jsx';
import { StatCard } from '@components/StatCard.jsx';
import { ChartCard } from '@components/ChartCard.jsx';
import { DataTable } from '@components/DataTable.jsx';
import { SQLViewer } from '@components/SQLViewer.jsx';
import ImportDataButton from '@components/ImportDataButton.jsx';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { projects, isLoading, setProjects, setIsLoading } = useProjectStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await projectsApi.getAllProjects();
        setProjects(response.data || []);
      } catch (err) {
        const errorMessage = err?.message || 'Failed to fetch projects';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [setProjects, setIsLoading]);

  const revenueData = [
    { month: 'Jan', revenue: 12000, pending: 3000 },
    { month: 'Feb', revenue: 19000, pending: 2000 },
    { month: 'Mar', revenue: 15000, pending: 8000 },
    { month: 'Apr', revenue: 25000, pending: 5000 },
    { month: 'May', revenue: 22000, pending: 6000 },
    { month: 'Jun', revenue: 28000, pending: 4000 },
  ];

  const clientRevenueData = [
    { client: 'ACME Corp', revenue: 45000 },
    { client: 'Tech Inc', revenue: 38000 },
    { client: 'Design Co', revenue: 32000 },
    { client: 'Media LLC', revenue: 28000 },
    { client: 'Web Studio', revenue: 22000 },
  ];

  const overdueData = [
    { week: 'Week 1', overdue: 2 },
    { week: 'Week 2', overdue: 1 },
    { week: 'Week 3', overdue: 4 },
    { week: 'Week 4', overdue: 2 },
    { week: 'Week 5', overdue: 5 },
  ];

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const pendingPayments = revenueData.reduce((sum, d) => sum + d.pending, 0);
  const activeProjects = projects.filter((p) => p.status === 'ONGOING').length;
  const overdueCount = overdueData.reduce((sum, d) => sum + d.overdue, 0);

  const sqlQueries = {
    revenue: `SELECT 
  DATE_TRUNC('month', p."createdAt") as month,
  SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END) as revenue,
  SUM(CASE WHEN p.status = 'PENDING' THEN p.amount ELSE 0 END) as pending
FROM "Payment" p
INNER JOIN "Project" proj ON p."projectId" = proj.id
GROUP BY DATE_TRUNC('month', p."createdAt")
ORDER BY month DESC;`,

    clientRevenue: `SELECT 
  c.id,
  c.name as client,
  SUM(pay.amount) as revenue
FROM "Client" c
LEFT JOIN "Project" p ON c.id = p."clientId"
LEFT JOIN "Payment" pay ON p.id = pay."projectId"
GROUP BY c.id, c.name
ORDER BY revenue DESC
LIMIT 5;`,

    totalStats: `SELECT 
  COUNT(*) as total_projects,
  COALESCE(SUM(amount), 0) as total_revenue
FROM "Project" p
LEFT JOIN "Payment" pay ON p.id = pay."projectId"
WHERE pay.status = 'PAID';`,
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: '💰',
      trend: { value: 12, direction: 'up' },
      color: 'cyan',
    },
    {
      title: 'Pending Payments',
      value: `$${(pendingPayments / 1000).toFixed(1)}k`,
      icon: '⏳',
      trend: { value: 5, direction: 'down' },
      color: 'purple',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: '📋',
      trend: { value: 3, direction: 'up' },
      color: 'green',
    },
    {
      title: 'Overdue Alerts',
      value: overdueCount,
      icon: '🚨',
      trend: { value: 8, direction: 'up' },
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span>📊</span> Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, <span className="text-cyan-400 font-semibold">{user?.email?.split('@')[0]}</span>! 👋
          </p>
        </div>
        <ImportDataButton className="ml-4" />
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError('')} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            description="Monthly revenue and pending payments"
            icon="📈"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                <XAxis stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorPending)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Overdue Alerts" description="Spike detection" icon="🚨">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overdueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
              <XAxis stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Line
                type="monotone"
                dataKey="overdue"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorOverdue)"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Client Revenue" description="Top performing clients" icon="👥">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clientRevenueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Recent Projects" description="Your active and completed projects" icon="📋">
        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Project Name' },
              {
                key: 'status',
                label: 'Status',
                render: (status) => (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      status === 'in-progress'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {status?.toUpperCase() || 'N/A'}
                  </span>
                ),
              },
              {
                key: 'budget',
                label: 'Budget',
                align: 'right',
                render: (budget) => <span className="text-cyan-400 font-semibold">${budget?.toLocaleString() || 0}</span>,
              },
              {
                key: 'deadline',
                label: 'Deadline',
                render: (deadline) =>
                  new Date(deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }),
              },
            ]}
            data={projects.slice(0, 5)}
            emptyMessage="No projects yet"
            rowAction={(row) => console.log('Project selected:', row)}
          />
        )}
      </ChartCard>

      <ChartCard
        title="📚 Database Queries Reference"
        description="Educational SQL queries powering this dashboard"
        icon="🔍"
      >
        <SQLViewer queries={sqlQueries} />
      </ChartCard>
    </div>
  );
};
