import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { initials } from '../../lib/format';
import { Check, Loader2, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CollabInbox() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/collab/received');
      setRequests(data.data ?? []);
    } catch {
      toast.error('Could not load collaboration requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      const { data } = await api.patch(`/collab/${id}/${action}`);
      setRequests((current) => current.map((item) => (item.id === id ? data.data : item)));
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update request.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-600';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'rejected':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-black/5 text-gray-500';
    }
  };

  return (
    <div className="space-y-6 text-[#111111]">
      <div>
        <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">Collab Inbox</h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">Review investor interest and decide who should get closer access.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center font-semibold text-gray-400">No collaboration requests yet.</div>
        ) : requests.map((request) => (
          <article key={request.id} className="border-b border-black/5 p-6 last:border-b-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF5C00]/10 font-bold text-[#FF5C00]">
                  {initials(request.sender?.name)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-[#111111]">{request.sender?.name ?? 'Investor'}</h2>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <Link to={`/pitches/${request.post?.id}`} className="mt-1 block text-sm font-bold text-[#FF5C00] hover:text-[#E65300] transition-colors">
                    {request.post?.title}
                  </Link>
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm font-semibold leading-relaxed text-gray-600">
                    {request.message}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateStatus(request.id, 'accept')}
                      className="inline-flex items-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-4 py-2 text-xs font-bold text-white transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(request.id, 'reject')}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-bold text-red-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </>
                )}
                <Link
                  to={`/messages?user=${request.sender?.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F4] border border-black/5 hover:bg-black/5 hover:border-black/10 px-4 py-2 text-xs font-bold text-gray-700 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
