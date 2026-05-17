import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePost, getMyPosts } from '../../api/posts';
import { formatStage, getPostImage, initials, numberCompact } from '../../lib/format';
import { Edit2, Eye, Loader2, MessageSquare, Plus, Presentation, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MyPitches() {
  const [pitches, setPitches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPitches = useCallback(async () => {
    try {
      const { data } = await getMyPosts({ per_page: 30 });
      setPitches(data.data ?? []);
    } catch {
      toast.error('Failed to load your pitches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  const handleDeletePitch = async (id) => {
    if (!confirm('Delete this pitch? Investors will no longer be able to view it.')) return;

    try {
      await deletePost(id);
      setPitches((current) => current.filter((pitch) => pitch.id !== id));
      toast.success('Pitch deleted successfully');
    } catch {
      toast.error('Failed to delete pitch');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Pitches</h1>
          <p className="mt-1 text-gray-400">Manage your startup ideas, links, visibility, and traction.</p>
        </div>
        <Link
          to="/dashboard/entrepreneur/pitches/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-gray-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Create Pitch
        </Link>
      </div>

      {pitches.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-gray-900 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
            <Presentation className="h-8 w-8 text-cyan-300" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">No pitches yet</h2>
          <p className="mx-auto mb-6 max-w-md text-gray-400">
            Publish your first idea to start getting votes, comments, investor requests, and collaboration signals.
          </p>
          <Link
            to="/dashboard/entrepreneur/pitches/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-gray-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Create Your First Pitch
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {pitches.map((pitch) => {
            const cover = getPostImage(pitch);
            return (
              <article key={pitch.id} className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="h-44 bg-gray-800 md:h-full">
                    {cover ? (
                      <img src={cover} alt={pitch.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full min-h-44 items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_35%),linear-gradient(135deg,#111827,#164e63)]">
                        <span className="text-3xl font-bold text-white/80">{initials(pitch.title)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-white">{pitch.title}</h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">{pitch.industry} - {formatStage(pitch.funding_stage)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-200">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {numberCompact((pitch.upvotes_count ?? 0) - (pitch.downvotes_count ?? 0))}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-gray-400">{pitch.tagline}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-300">
                      {(pitch.tags ?? []).slice(0, 4).map((tag) => (
                        <span key={tag.id ?? tag.name} className="rounded-md border border-white/10 px-2 py-1">#{tag.name}</span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{numberCompact(pitch.views_count)}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{numberCompact(pitch.comments_count)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/entrepreneur/pitches/${pitch.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-700"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePitch(pitch.id)}
                          className="inline-flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
