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
      <div className="flex h-64 items-center justify-center bg-[#EAEAEA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">My Pitches</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Manage your startup ideas, links, visibility, and traction.</p>
        </div>
        <Link
          to="/dashboard/entrepreneur/pitches/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-6 py-3 font-bold text-white transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Pitch
        </Link>
      </div>

      {pitches.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5C00]/10">
            <Presentation className="h-8 w-8 text-[#FF5C00]" />
          </div>
          <h2 className="mb-2 text-xl font-display font-black text-[#111111] uppercase tracking-tight">No pitches yet</h2>
          <p className="mx-auto mb-6 max-w-md text-sm font-semibold text-gray-500">
            Publish your first idea to start getting votes, comments, investor requests, and collaboration signals.
          </p>
          <Link
            to="/dashboard/entrepreneur/pitches/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-6 py-3 font-bold text-white transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Your First Pitch
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pitches.map((pitch) => {
            const cover = getPostImage(pitch);
            return (
              <article key={pitch.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                <div className="grid md:grid-cols-[200px_1fr]">
                  <div className="h-44 bg-gray-50 md:h-full shrink-0">
                    {cover ? (
                      <img src={cover} alt={pitch.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full min-h-44 items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,92,0,0.2),transparent_35%),linear-gradient(135deg,#FF5C00,#E65300)]">
                        <span className="text-3xl font-display font-black text-white/95">{initials(pitch.title)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#111111] leading-tight">{pitch.title}</h2>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#FF5C00]">{pitch.industry} - {formatStage(pitch.funding_stage)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#FF5C00]/25 bg-[#FF5C00]/10 px-2 py-0.5 text-xs font-bold text-[#FF5C00]">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {numberCompact((pitch.upvotes_count ?? 0) - (pitch.downvotes_count ?? 0))}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-500">{pitch.tagline}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                      {(pitch.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag.id ?? tag.name} className="rounded-md bg-[#F4F4F4] border border-black/5 px-2 py-0.5 font-bold uppercase tracking-wider text-gray-600">#{tag.name}</span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4 text-[#FF5C00]" />{numberCompact(pitch.views_count)}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{numberCompact(pitch.comments_count)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/entrepreneur/pitches/${pitch.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F4] border border-black/5 hover:bg-black/5 hover:border-black/10 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePitch(pitch.id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 text-xs font-bold text-red-600 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
