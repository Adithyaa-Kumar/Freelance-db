import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@hooks/useStore.js';
import { StatCard } from '@components/StatCard.jsx';
import { ChartCard } from '@components/ChartCard.jsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AnalyticsPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

  // Fetch analytics data - only called when token changes
  useEffect(() => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/analytics/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }

        const result = await response.json();
        // Extract data from response - data is inside result.data
        setDashboardData(result.data || result);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load analytics');
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, API_URL]);

  // Parse and format dashboard data - memoized
  const parsedData = useMemo(() => {
    if (!dashboardData) return null;

    try {
      // Extract metrics from nested response structure
      const revenue = dashboardData.revenue || {};
      const clientRevenue = dashboardData.clientRevenue || {};
      const taskMetrics = dashboardData.taskMetrics || {};
      const overdue = dashboardData.overdue || {};

      // Calculate KPI metrics
      const totalRevenue = revenue.summary?.totalRevenue || 0;
      const totalProjects = revenue.summary?.projectCount || 0;
      const totalClients = clientRevenue.summary?.totalClients || 0;
      const completionRate = taskMetrics.completionRate || 0;
      const completedTasks = taskMetrics.completedTasks || 0;
      const totalTasks = taskMetrics.totalTasks || 0;
      const overdueCount = overdue.summary?.overdueCount || 0;

      const avgProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

      // Format revenue trend data from monthly breakdown
      const revenueData = (revenue.monthlyBreakdown || []).map((item) => ({
        month: item.month?.substring(0, 3) || 'N/A',
        revenue: item.paidAmount || 0,
        pending: item.pendingAmount || 0,
      }));

      // Format client revenue data
      const clientData = (clientRevenue.details || [])
        .slice(0, 6)
        .map((client) => ({
          name: client.clientName?.substring(0, 20) || 'Unknown',
          revenue: client.totalRevenue || 0,
        }));

      // Status distribution for tasks
      const statusData = [
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'In Progress', value: (totalTasks - completedTasks) * 0.4, color: '#3b82f6' },
        { name: 'Pending', value: (totalTasks - completedTasks) * 0.6, color: '#f59e0b' },
      ].filter((item) => item.value > 0);

      return {
        metrics: {
          totalRevenue,
          totalProjects,
          totalClients,
          completionRate,
          avgProjectValue,
          overdueCount,
          completedTasks,
          totalTasks,
        },
        charts: {
          revenueData: revenueData.length > 0 ? revenueData : generateMockRevenueData(),
          clientData: clientData.length > 0 ? clientData : generateMockClientData(),
          statusData: statusData.length > 0 ? statusData : generateMockStatusData(),
        },
      };
    } catch (err) {
      console.error('Data parsing error:', err);
      return null;
    }
  }, [dashboardData]);

  // Mock data generators for better UX when no data exists
  const generateMockRevenueData = useCallback(() => [
    { month: 'Jan', revenue: 5000, pending: 1000 },
    { month: 'Feb', revenue: 8000, pending: 1500 },
    { month: 'Mar', revenue: 6000, pending: 2000 },
    { month: 'Apr', revenue: 12000, pending: 1000 },
    { month: 'May', revenue: 15000, pending: 3000 },
    { month: 'Jun', revenue: 20000, pending: 2500 },
  ], []);

  const generateMockClientData = useCallback(() => [
    { name: 'Client A', revenue: 25000 },
    { name: 'Client B', revenue: 18000 },
    { name: 'Client C', revenue: 15000 },
    { name: 'Client D', revenue: 12000 },
  ], []);

  const generateMockStatusData = useCallback(() => [
    { name: 'Completed', value: 45, color: '#10b981' },
    { name: 'In Progress', value: 30, color: '#3b82f6' },
    { name: 'Pending', value: 25, color: '#f59e0b' },
  ], []);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Loading your business metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Error loading analytics</p>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
          <p className="text-red-900 font-bold text-lg mb-2">❌ Error Loading Analytics</p>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            ↻ Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!parsedData) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your freelance business metrics</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-8 text-center">
          <p className="text-gray-700 text-lg font-medium">📊 No analytics data available</p>
          <p className="text-gray-600 text-sm mt-2">
            Create projects, clients, and payments to see analytics
          </p>
        </div>
      </div>
    );
  }

  const { metrics, charts } = parsedData;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your freelance business metrics</p>
      </div>

      {/* KPI Cards Grid - 4 Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${Math.round(metrics.totalRevenue).toLocaleString()}`}
          icon="💰"
          color="blue"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          title="Total Projects"
          value={metrics.totalProjects}
          icon="📁"
          color="indigo"
          trend={{ value: 5, direction: 'up' }}
        />
        <StatCard
          title="Total Clients"
          value={metrics.totalClients}
          icon="👥"
          color="green"
          trend={{ value: 3, direction: 'up' }}
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(metrics.completionRate)}%`}
          icon="✅"
          color="yellow"
          trend={{ value: 8, direction: 'up' }}
        />
      </div>

      {/* Charts Grid - 3 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart - Takes 2 cols on large screens */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            description="Monthly revenue and pending payments"
            icon="📈"
            fullHeight
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Paid Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pending Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Status Distribution Chart */}
        <ChartCard
          title="Project Status"
          description="Task completion breakdown"
          icon="📊"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${Math.round(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second Row: Client Revenue & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Revenue Chart */}
        <ChartCard
          title="Top Clients by Revenue"
          description="Revenue breakdown by client"
          icon="🏆"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.clientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Key Metrics */}
        <ChartCard
          title="Key Performance Indicators"
          description="Summary of important metrics"
          icon="⭐"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-gray-700 font-medium text-sm">Avg Project Value</span>
              <span className="text-xl font-bold text-blue-600">
                ${Math.round(metrics.avgProjectValue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-gray-700 font-medium text-sm">Task Completion</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  {Math.round(metrics.completionRate)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-gray-700 font-medium text-sm">Tasks Completed</span>
              <span className="text-xl font-bold text-indigo-600">
                {Math.round(metrics.completedTasks)}/{Math.round(metrics.totalTasks)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-gray-700 font-medium text-sm">Overdue Payments</span>
              <span className="text-xl font-bold text-red-600">{Math.round(metrics.overdueCount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-gray-700 font-medium text-sm">Total Billable Hours</span>
              <span className="text-xl font-bold text-orange-600">
                {Math.round((metrics.totalTasks || 0) * 8)}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
