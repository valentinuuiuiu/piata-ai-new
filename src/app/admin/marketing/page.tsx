'use client';

import { useEffect, useState } from 'react';

// Define a simple StatCard component for display
const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
    <p className="text-3xl font-bold text-black">{value}</p>
  </div>
);

export default function MarketingDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/automation-stats')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Marketing Automation Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Emails Sent (24h)" value={stats?.emailsSent || 0} />
        <StatCard title="Matches Found (24h)" value={stats?.matchesFound || 0} />
        <StatCard title="Social Posts Generated (24h)" value={stats?.socialPosts || 0} />
        <StatCard title="Automation Success Rate (24h)" value={`${stats?.successRate || 0}%`} />
      </div>

      {/* Here you could add more detailed components, like charts or logs */}
      {/* For example:
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {/* Render a list of recent automation logs here */}
      </div>
      */}
    </div>
  );
}
