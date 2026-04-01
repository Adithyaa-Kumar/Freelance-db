import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@hooks/useStore.js';
import { StatCard } from '@components/StatCard.jsx';
import { ChartCard } from '@components/ChartCard.jsx';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/data/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entity: 'analytics',
            filters: {},
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch analytics');
        }

        const result = await response.json();
        setAnalytics(result.data?.metrics || result.data);
      } catch (err) {
        setError(err.message);
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]); // Only depend on token, not on every render

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">❌ Error Loading Analytics</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        <div className="text-center text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your freelance business metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={analytics.totalProjects || 0}
          icon="📁"
          trend={`${analytics.activeProjects || 0} active`}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(analytics.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          trend={`$${(analytics.pendingRevenue || 0).toLocaleString()} pending`}
          color="green"
        />
        <StatCard
          title="Active Tasks"
          value={analytics.activeTasks || 0}
          icon="✓"
          trend={`${analytics.completedTasks || 0} completed`}
          color="purple"
        />
        <StatCard
          title="Completed Projects"
          value={analytics.completedProjects || 0}
          icon="🏆"
          trend={`Success rate: ${((analytics.completedProjects / (analytics.totalProjects || 1)) * 100).toFixed(1)}%`}
          color="yellow"
        />
        <StatCard
          title="Active Clients"
          value={analytics.topClients?.length || 0}
          icon="👥"
          trend="Top performing clients"
          color="indigo"
        />
        <StatCard
          title="Pending Revenue"
          value={`$${(analytics.pendingRevenue || 0).toLocaleString()}`}
          icon="⏳"
          trend={`Due for collection`}
          color="orange"
        />
      </div>

      {/* Top Clients Section */}
      {analytics.topClients && analytics.topClients.length > 0 && (
        <ChartCard title="Top Clients by Revenue">
          <div className="space-y-4">
            {analytics.topClients.map((client, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.projectCount} projects</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${client.totalRevenue.toLocaleString()}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (client.totalRevenue / (analytics.topClients[0]?.totalRevenue || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* High Value Projects Section */}
      {analytics.highValueProjects && analytics.highValueProjects.length > 0 && (
        <ChartCard title="High-Value Projects">
          <div className="space-y-4">
            {analytics.highValueProjects.slice(0, 5).map((project, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{project.status}</p>
                </div>
                <p className="font-bold text-gray-900">${project.budget.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};
