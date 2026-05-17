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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Collab Inbox</h1>
        <p className="mt-1 text-gray-400">Review investor interest and decide who should get closer access.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No collaboration requests yet.</div>
        ) : requests.map((request) => (
          <article key={request.id} className="border-b border-white/10 p-5 last:border-b-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-200">
                  {initials(request.sender?.name)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-white">{request.sender?.name ?? 'Investor'}</h2>
                    <span className="rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold uppercase text-gray-300">{request.status}</span>
                  </div>
                  <Link to={`/pitches/${request.post?.id}`} className="mt-1 block text-sm text-cyan-300 hover:text-cyan-200">{request.post?.title}</Link>
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-gray-300">{request.message}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {request.status === 'pending' && (
                  <>
                    <button type="button" onClick={() => updateStatus(request.id, 'accept')} className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400">
                      <Check className="h-4 w-4" /> Accept
                    </button>
                    <button type="button" onClick={() => updateStatus(request.id, 'reject')} className="inline-flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </>
                )}
                <Link to={`/messages?user=${request.sender?.id}`} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/60">
                  <MessageSquare className="h-4 w-4" /> Message
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
