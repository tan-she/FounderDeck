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
    return (
      <div className="flex h-64 items-center justify-center bg-[#EAEAEA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      <div>
        <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">Admin Overview</h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">Platform health and moderation snapshot.</p>
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
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-[#FF5C00]/10 rounded-xl flex-shrink-0">
        <Icon className="h-6 w-6 text-[#FF5C00]" />
      </div>
      <div>
        <p className="text-3xl font-display font-black text-[#111111] leading-none">{value}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      </div>
    </div>
  );
}
