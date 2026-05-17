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
    <div className="space-y-6 text-[#111111]">
      <div>
        <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">Users</h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">Review founders, investors, and account status.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
          </div>
        ) : users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 border-b border-black/5 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF5C00]/10 font-bold text-[#FF5C00]">
                {initials(user.name)}
              </div>
              <div>
                <p className="font-bold text-[#111111]">{user.name}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">{user.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleBan(user)}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all ${user.is_banned ? 'bg-[#FF5C00] hover:bg-[#E65300] text-white shadow-md shadow-[#FF5C00]/15' : 'bg-red-500/10 hover:bg-red-500/20 text-red-600'}`}
            >
              {user.is_banned ? 'Unban' : 'Ban'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
