import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { initials } from '../../lib/format';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data ?? []);
    } catch {
      toast.error('Could not load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBan = async (user) => {
    try {
      if (user.is_banned) {
        await api.patch(`/admin/users/${user.id}/unban`);
      } else {
        const reason = prompt('Ban reason');
        if (!reason) return;
        await api.patch(`/admin/users/${user.id}/ban`, { reason });
      }
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update user.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-gray-400">Review founders, investors, and account status.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 border-b border-white/10 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-200">{initials(user.name)}</div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>
            <button type="button" onClick={() => toggleBan(user)} className={`rounded-md px-3 py-2 text-sm font-semibold ${user.is_banned ? 'bg-cyan-500 text-gray-950' : 'bg-red-500/10 text-red-300'}`}>
              {user.is_banned ? 'Unban' : 'Ban'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
