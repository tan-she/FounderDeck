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
    <main className="min-h-screen bg-[#EAEAEA] pt-20 pb-12 text-[#111111]">
      <section className="border-b border-black/5 bg-[#F4F4F4]/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF5C00] font-display">Live pitch room</p>
              <h1 className="mt-2 text-3xl font-display font-black tracking-tight sm:text-4xl text-[#111111]">Discover founder ideas</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-gray-500">
                Browse startup concepts, validate early traction, and open collaboration conversations with serious builders.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#FF5C00] hover:bg-[#E65300] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md shadow-[#FF5C00]/15 hover:scale-[1.02]"
            >
              Join FounderDeck
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm md:grid-cols-[1fr_180px_180px_160px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by idea, problem, industry..."
                className="h-11 w-full rounded-xl border border-black/5 bg-[#F4F4F4] pl-10 pr-3 text-sm text-gray-800 font-semibold outline-none transition focus:border-[#FF5C00]"
              />
            </label>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="h-11 rounded-xl border border-black/5 bg-[#F4F4F4] px-3 text-sm text-gray-800 font-semibold outline-none transition focus:border-[#FF5C00]"
            >
              {industries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="h-11 rounded-xl border border-black/5 bg-[#F4F4F4] px-3 text-sm text-gray-800 font-semibold outline-none transition focus:border-[#FF5C00]"
            >
              {stages.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-xl border border-black/5 bg-[#F4F4F4] px-3 text-sm text-gray-800 font-semibold outline-none transition focus:border-[#FF5C00]"
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
        <div className="mb-5 flex items-center justify-between text-sm font-semibold text-gray-500">
          <span>{meta?.total ? `${meta.total} pitches found` : 'Explore the newest pitches'}</span>
          <span className="inline-flex items-center gap-2"><Filter className="h-4 w-4" /> Community ranked</span>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
          </div>
        ) : pitches.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-display font-black text-[#111111]">No pitches matched your filters</h2>
            <p className="mt-2 text-sm font-semibold text-gray-500">Clear the search or publish the first idea in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pitches.map((pitch) => {
              const cover = getPostImage(pitch);
              return (
                <Link
                  key={pitch.id}
                  to={`/pitches/${pitch.id}`}
                  className="group flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition hover:-translate-y-1 hover:border-[#FF5C00]/40 hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {cover ? (
                      <img src={cover} alt={pitch.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,92,0,0.15),transparent_32%),linear-gradient(135deg,#F4F4F4,#EAEAEA_55%,#FF5C00/5)]">
                        <span className="text-3xl font-display font-black text-[#FF5C00]">{initials(pitch.title)}</span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md bg-[#FF5C00]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#FF5C00]">
                      {pitch.industry}
                    </div>
                    <div className="absolute right-3 top-3 rounded-md bg-gray-950 px-2.5 py-1 text-xs font-bold text-white">
                      {formatStage(pitch.funding_stage)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5C00]/10 text-sm font-bold text-[#FF5C00]">
                        {initials(pitch.user?.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">{pitch.user?.name ?? 'Founder'}</p>
                        <p className="text-xs text-gray-400 font-semibold">Founder</p>
                      </div>
                    </div>
                    <h2 className="text-xl font-display font-black tracking-tight text-[#111111] transition group-hover:text-[#FF5C00]">{pitch.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 font-semibold">{pitch.tagline}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(pitch.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag.id ?? tag.name} className="rounded-full bg-[#F4F4F4] px-3 py-1 text-xs text-gray-500 font-semibold border border-black/5">
                          #{tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4 text-sm font-semibold text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{numberCompact(pitch.upvotes_count)}</span>
                        <span className="inline-flex items-center gap-1"><ThumbsDown className="h-4 w-4" />{numberCompact(pitch.downvotes_count)}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{numberCompact(pitch.comments_count)}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{numberCompact(pitch.views_count)}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#FF5C00] transition group-hover:translate-x-1" />
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
