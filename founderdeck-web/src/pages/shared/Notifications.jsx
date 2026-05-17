import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Bell, CheckCheck, Handshake, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

const iconByType = {
  post_upvoted: ThumbsUp,
  new_comment: MessageSquare,
  new_message: MessageSquare,
  new_collab_request: Handshake,
  collab_accepted: Handshake,
  collab_rejected: Handshake,
};

const titleByType = {
  post_upvoted: 'New upvote',
  new_comment: 'New comment',
  new_message: 'New message',
  new_collab_request: 'New collaboration request',
  collab_accepted: 'Collaboration accepted',
  collab_rejected: 'Collaboration rejected',
};

function describeNotification(notification) {
  const data = notification.data ?? {};
  if (notification.type === 'post_upvoted') return `${data.actor_name} upvoted "${data.post_title}".`;
  if (notification.type === 'new_comment') return `${data.actor_name} commented on "${data.post_title}".`;
  if (notification.type === 'new_message') return `${data.sender_name} sent you a private message.`;
  if (notification.type === 'new_collab_request') return `${data.sender_name} requested to collaborate on "${data.post_title}".`;
  if (notification.type === 'collab_accepted') return `${data.entrepreneur_name} accepted your request for "${data.post_title}".`;
  if (notification.type === 'collab_rejected') return `${data.entrepreneur_name} rejected your request for "${data.post_title}".`;
  return 'You have a new update.';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data ?? []);
    } catch {
      toast.error('Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() })));
    } catch {
      toast.error('Could not mark notifications as read.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 px-4 pt-28 pb-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="mt-1 text-gray-400">Votes, comments, collaboration requests, and messages in one place.</p>
          </div>
          <button type="button" onClick={markAllRead} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/60">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
          {isLoading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <p className="text-gray-400">No notifications yet.</p>
            </div>
          ) : notifications.map((notification) => {
            const Icon = iconByType[notification.type] ?? Bell;
            return (
              <article key={notification.id} className={`flex gap-4 border-b border-white/10 p-4 last:border-b-0 ${notification.is_read ? 'bg-gray-900' : 'bg-cyan-500/5'}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold">{titleByType[notification.type] ?? 'Update'}</h2>
                    <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{describeNotification(notification)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
