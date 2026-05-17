import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { getPost } from '../../api/posts';
import { useAuthStore } from '../../store/useAuthStore';
import { formatStage, getPostImage, initials, numberCompact } from '../../lib/format';
import {
  ArrowUpRight,
  Code2,
  Loader2,
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PitchDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [pitch, setPitch] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [collabMessage, setCollabMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSendingCollab, setIsSendingCollab] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user?.id && pitch?.user?.id === user.id;
  const canRequestCollab = isAuthenticated && user?.role === 'investor' && !isOwner;

  const loadPitch = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [{ data: postData }, { data: commentData }] = await Promise.all([
        getPost(id),
        api.get(`/posts/${id}/comments`),
      ]);
      setPitch(postData.data);
      setComments(commentData.data ?? []);
      setCollabMessage(`Hi ${postData.data.user?.name ?? 'there'}, I like ${postData.data.title} and would like to explore a collaboration or investment conversation.`);
    } catch {
      setError('This pitch could not be loaded. It may have been removed or the API is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPitch();
  }, [loadPitch]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote.');
      return;
    }

    try {
      const { data } = await api.post(`/posts/${id}/vote`, { vote_type: voteType });
      setPitch((current) => ({
        ...current,
        upvotes_count: data.upvotes,
        downvotes_count: data.downvotes,
        user_vote: data.user_vote,
      }));
    } catch (voteError) {
      toast.error(voteError.response?.data?.message || 'Could not save your vote.');
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!comment.trim()) return;

    setIsCommenting(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { body: comment.trim() });
      setComments((current) => [data.data, ...current]);
      setPitch((current) => ({ ...current, comments_count: (current.comments_count ?? 0) + 1 }));
      setComment('');
      toast.success('Comment posted');
    } catch (commentError) {
      toast.error(commentError.response?.data?.message || 'Could not post comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCollab = async (event) => {
    event.preventDefault();
    if (!canRequestCollab || !collabMessage.trim()) return;

    setIsSendingCollab(true);
    try {
      await api.post(`/posts/${id}/collab`, { message: collabMessage.trim() });
      toast.success('Collaboration request sent');
    } catch (collabError) {
      toast.error(collabError.response?.data?.message || 'Could not send collaboration request.');
    } finally {
      setIsSendingCollab(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 pt-16">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !pitch) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-100">{error}</div>
      </main>
    );
  }

  const cover = getPostImage(pitch);

  return (
    <main className="min-h-screen bg-gray-950 pt-16 text-white">
      <section className="border-b border-white/10 bg-gray-900/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-md bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">{pitch.industry}</span>
              <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-gray-950">{formatStage(pitch.funding_stage)}</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{pitch.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-300">{pitch.tagline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link to={`/profile/${pitch.user?.id}`} className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-gray-950 px-3 py-2 transition hover:border-cyan-400/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">
                  {initials(pitch.user?.name)}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{pitch.user?.name ?? 'Founder'}</span>
                  <span className="block text-xs text-gray-500">View founder profile</span>
                </span>
              </Link>
              {isOwner && (
                <Link
                  to={`/dashboard/entrepreneur/pitches/${pitch.id}/edit`}
                  className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400"
                >
                  Edit Pitch
                </Link>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
            <div className="h-56 bg-gray-800">
              {cover ? (
                <img src={cover} alt={pitch.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_35%),linear-gradient(135deg,#111827,#164e63)]">
                  <span className="text-4xl font-bold text-white/80">{initials(pitch.title)}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center">
              <div className="p-4">
                <p className="text-xl font-bold">{numberCompact((pitch.upvotes_count ?? 0) - (pitch.downvotes_count ?? 0))}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
              <div className="p-4">
                <p className="text-xl font-bold">{numberCompact(pitch.comments_count)}</p>
                <p className="text-xs text-gray-500">Comments</p>
              </div>
              <div className="p-4">
                <p className="text-xl font-bold">{numberCompact(pitch.views_count)}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-8">
          <article className="rounded-lg border border-white/10 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">Pitch</h2>
            <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-300">{pitch.description}</p>

            {(pitch.tech_stack?.length > 0 || pitch.tags?.length > 0) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {(pitch.tech_stack ?? []).map((item) => (
                  <span key={item} className="rounded-md bg-gray-800 px-2.5 py-1 text-sm text-gray-300">{item}</span>
                ))}
                {(pitch.tags ?? []).map((tag) => (
                  <span key={tag.id ?? tag.name} className="rounded-md border border-white/10 px-2.5 py-1 text-sm text-cyan-200">#{tag.name}</span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {pitch.demo_url && (
                <a href={pitch.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/60">
                  Live demo <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {pitch.github_repo_url && (
                <a href={pitch.github_repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/60">
                  <Code2 className="h-4 w-4" /> GitHub
                </a>
              )}
            </div>
          </article>

          <section className="rounded-lg border border-white/10 bg-gray-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Founder Feedback</h2>
              <span className="text-sm text-gray-500">{comments.length} comments</span>
            </div>

            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder={isAuthenticated ? 'Share feedback, a question, or validation insight...' : 'Log in to comment'}
                disabled={!isAuthenticated}
                className="w-full resize-y rounded-md border border-white/10 bg-gray-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!isAuthenticated || isCommenting || !comment.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCommenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post Comment
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="rounded-lg bg-gray-950 p-4 text-sm text-gray-400">No comments yet. Be the first to add useful feedback.</p>
              ) : comments.map((item) => (
                <article key={item.id} className="rounded-lg border border-white/10 bg-gray-950 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-200">
                      {initials(item.user?.name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.user?.name ?? 'Member'}</p>
                      <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-white/10 bg-gray-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">Vote on the idea</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleVote('up')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${pitch.user_vote === 'up' ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
              >
                <ThumbsUp className="h-4 w-4" />
                {numberCompact(pitch.upvotes_count)}
              </button>
              <button
                type="button"
                onClick={() => handleVote('down')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${pitch.user_vote === 'down' ? 'bg-red-400 text-gray-950' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
              >
                <ThumbsDown className="h-4 w-4" />
                {numberCompact(pitch.downvotes_count)}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-gray-900 p-5">
            <h2 className="text-lg font-semibold">Connect</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Investors can request collaboration. Accepted requests can move into private encrypted messaging.</p>
            {canRequestCollab ? (
              <form onSubmit={handleCollab} className="mt-4 space-y-3">
                <textarea
                  value={collabMessage}
                  onChange={(event) => setCollabMessage(event.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-md border border-white/10 bg-gray-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={isSendingCollab || !collabMessage.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingCollab ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Request Collaboration
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-lg bg-gray-950 p-4 text-sm text-gray-400">
                {isAuthenticated ? 'Collaboration requests are available from investor accounts.' : 'Log in as an investor to request collaboration.'}
              </div>
            )}
            {isAuthenticated && !isOwner && (
              <Link
                to={`/messages?user=${pitch.user?.id}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/60"
              >
                <MessageSquare className="h-4 w-4" />
                Message Founder
              </Link>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
