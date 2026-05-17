import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart3, Handshake, Loader2, ThumbsUp, Users } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-1 text-gray-400">Platform health and moderation snapshot.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Users} label="Users" value={stats?.total_users ?? 0} />
        <Stat icon={BarChart3} label="Posts" value={stats?.total_posts ?? 0} />
        <Stat icon={ThumbsUp} label="Votes" value={stats?.total_votes ?? 0} />
        <Stat icon={Handshake} label="Collabs" value={Object.values(stats?.collab_requests_by_status ?? {}).reduce((sum, count) => sum + count, 0)} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900 p-5">
      <Icon className="mb-4 h-5 w-5 text-cyan-300" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}
