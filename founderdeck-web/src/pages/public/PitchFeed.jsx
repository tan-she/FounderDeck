import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import { formatStage, getPostImage, initials, numberCompact } from '../../lib/format';
import { ChevronRight, Eye, Filter, Loader2, MessageSquare, Search, ThumbsDown, ThumbsUp } from 'lucide-react';

const industries = ['All', 'Technology', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS', 'Web3', 'CleanTech', 'Logistics'];
const stages = [
  { label: 'All stages', value: '' },
  { label: 'Idea', value: 'idea' },
  { label: 'MVP', value: 'mvp' },
  { label: 'Seed', value: 'seed' },
  { label: 'Series A', value: 'series_a' },
  { label: 'Co-founder search', value: 'looking_for_cofounders' },
];

export default function PitchFeed() {
  const [pitches, setPitches] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('trending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({
    search: search || undefined,
    industry: industry !== 'All' ? industry : undefined,
    funding_stage: stage || undefined,
    sort,
    per_page: 12,
  }), [industry, search, sort, stage]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    getPosts(params)
      .then(({ data }) => {
        if (!isMounted) return;
        setPitches(data.data ?? []);
        setMeta(data.meta ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Could not load pitches right now. Please check that the Laravel API is running.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <main className="min-h-screen bg-gray-950 pt-20 pb-12 text-white">
      <section className="border-b border-white/10 bg-gray-900/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">Live pitch room</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Discover founder ideas</h1>
              <p className="mt-2 max-w-2xl text-gray-400">
                Browse startup concepts, validate early traction, and open collaboration conversations with serious builders.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400"
            >
              Join FounderDeck
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 rounded-lg border border-white/10 bg-gray-950/70 p-3 md:grid-cols-[1fr_180px_180px_160px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by idea, problem, industry..."
                className="h-11 w-full rounded-md border border-white/10 bg-gray-900 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </label>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="h-11 rounded-md border border-white/10 bg-gray-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              {industries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="h-11 rounded-md border border-white/10 bg-gray-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              {stages.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-md border border-white/10 bg-gray-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              <option value="trending">Trending</option>
              <option value="latest">Latest</option>
              <option value="most_voted">Most voted</option>
              <option value="most_viewed">Most viewed</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between text-sm text-gray-400">
          <span>{meta?.total ? `${meta.total} pitches found` : 'Explore the newest pitches'}</span>
          <span className="inline-flex items-center gap-2"><Filter className="h-4 w-4" /> Community ranked</span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : pitches.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-gray-900 p-10 text-center">
            <h2 className="text-xl font-semibold">No pitches matched your filters</h2>
            <p className="mt-2 text-gray-400">Clear the search or publish the first idea in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pitches.map((pitch) => {
              const cover = getPostImage(pitch);
              return (
                <Link
                  key={pitch.id}
                  to={`/pitches/${pitch.id}`}
                  className="group flex min-h-[390px] flex-col overflow-hidden rounded-lg border border-white/10 bg-gray-900 transition hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-950/40"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-800">
                    {cover ? (
                      <img src={cover} alt={pitch.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_32%),linear-gradient(135deg,#111827,#0f172a_55%,#164e63)]">
                        <span className="text-3xl font-bold text-white/80">{initials(pitch.title)}</span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md bg-gray-950/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      {pitch.industry}
                    </div>
                    <div className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-950">
                      {formatStage(pitch.funding_stage)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">
                        {initials(pitch.user?.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{pitch.user?.name ?? 'Founder'}</p>
                        <p className="text-xs text-gray-500">Founder</p>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white transition group-hover:text-cyan-300">{pitch.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">{pitch.tagline}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(pitch.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag.id ?? tag.name} className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300">
                          #{tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{numberCompact(pitch.upvotes_count)}</span>
                        <span className="inline-flex items-center gap-1"><ThumbsDown className="h-4 w-4" />{numberCompact(pitch.downvotes_count)}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{numberCompact(pitch.comments_count)}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{numberCompact(pitch.views_count)}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
