import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { initials } from '../../lib/format';
import { Loader2, LockKeyhole, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Messages() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const requestedUser = searchParams.get('user');
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const activeUserId = activeUser?.id;

  const conversationUsers = useMemo(() => conversations.map((conversation) => conversation.user), [conversations]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.get('/messages/conversations')
      .then(async ({ data }) => {
        if (!isMounted) return;
        const items = data.data ?? [];
        setConversations(items);

        if (requestedUser) {
          const existing = items.find((item) => item.user?.id === requestedUser)?.user;
          if (existing) {
            setActiveUser(existing);
          } else {
            const profile = await api.get(`/profile/${requestedUser}`);
            if (isMounted) setActiveUser(profile.data.data);
          }
        } else if (items[0]?.user) {
          setActiveUser(items[0].user);
        }
      })
      .catch(() => toast.error('Could not load conversations.'))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestedUser]);

  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    api.get(`/messages/${activeUserId}`)
      .then(({ data }) => {
        if (isMounted) setMessages(data.data ?? []);
        return api.patch(`/messages/${activeUserId}/read`);
      })
      .catch(() => toast.error('Could not load this message thread.'));

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeUserId || !body.trim()) return;

    setIsSending(true);
    try {
      const { data } = await api.post(`/messages/${activeUserId}`, { body: body.trim() });
      setMessages((current) => [...current, data.data]);
      setBody('');
      setConversations((current) => {
        const withoutActive = current.filter((item) => item.user?.id !== activeUserId);
        return [{ user: activeUser, last_message_preview: data.data.body, unread_count: 0, last_message_at: data.data.created_at }, ...withoutActive];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 pt-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr] lg:px-8">
        <aside className="rounded-t-lg border border-white/10 bg-gray-900 lg:rounded-l-lg lg:rounded-tr-none">
          <div className="border-b border-white/10 p-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500"><LockKeyhole className="h-3.5 w-3.5" /> Stored encrypted on the backend</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>
            ) : conversationUsers.length === 0 && !activeUser ? (
              <p className="p-4 text-sm text-gray-400">No conversations yet. Open a pitch and message a founder.</p>
            ) : (
              <>
                {activeUser && !conversationUsers.some((item) => item.id === activeUser.id) && (
                  <ConversationButton user={activeUser} active onClick={() => setActiveUser(activeUser)} />
                )}
                {conversations.map((conversation) => (
                  <ConversationButton
                    key={conversation.user.id}
                    user={conversation.user}
                    preview={conversation.last_message_preview}
                    unread={conversation.unread_count}
                    active={conversation.user.id === activeUserId}
                    onClick={() => setActiveUser(conversation.user)}
                  />
                ))}
              </>
            )}
          </div>
        </aside>

        <section className="flex min-h-[75vh] flex-col rounded-b-lg border-x border-b border-white/10 bg-gray-900 lg:rounded-r-lg lg:rounded-bl-none lg:border-l-0 lg:border-t">
          {activeUser ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-200">
                  {initials(activeUser.name)}
                </div>
                <div>
                  <h2 className="font-semibold">{activeUser.name}</h2>
                  <p className="text-xs text-gray-500">{activeUser.role}</p>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="rounded-lg bg-gray-950 p-4 text-sm text-gray-400">Start the conversation with a clear intro and next step.</div>
                ) : messages.map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 ${mine ? 'bg-cyan-500 text-gray-950' : 'bg-gray-950 text-gray-200'}`}>
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        <p className={`mt-1 text-[11px] ${mine ? 'text-gray-800' : 'text-gray-500'}`}>{new Date(message.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSend} className="border-t border-white/10 p-4">
                <div className="flex gap-3">
                  <input
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Write a private message..."
                    className="h-11 flex-1 rounded-md border border-white/10 bg-gray-950 px-4 text-sm outline-none transition focus:border-cyan-400"
                  />
                  <button type="submit" disabled={isSending || !body.trim()} className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-500 px-4 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:opacity-60">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-400">Choose a conversation to begin.</div>
          )}
        </section>
      </div>
    </main>
  );
}

function ConversationButton({ user, preview, unread = 0, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-white/10 p-4 text-left transition ${active ? 'bg-cyan-500/10' : 'hover:bg-gray-800'}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">{initials(user.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
        <span className="block truncate text-xs text-gray-500">{preview || user.role}</span>
      </span>
      {unread > 0 && <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-gray-950">{unread}</span>}
    </button>
  );
}
