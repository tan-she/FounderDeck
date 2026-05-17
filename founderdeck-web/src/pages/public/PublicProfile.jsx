import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatStage, initials, numberCompact } from '../../lib/format';
import { BriefcaseBusiness, Code2, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.get(`/profile/${id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setProfile(data.data);
        setPosts(data.posts ?? []);
      })
      .catch(() => {
        if (isMounted) setError('Profile could not be loaded.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 pt-16">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-100">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 pt-16 text-white">
      <section className="border-b border-white/10 bg-gray-900/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cyan-500/15 text-3xl font-bold text-cyan-200">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" /> : initials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{profile.role}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{profile.name}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-gray-300">{profile.bio || 'This member has not added a bio yet.'}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:border-cyan-400/60">
                  <BriefcaseBusiness className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:border-cyan-400/60">
                  <Code2 className="h-4 w-4" /> GitHub
                </a>
              )}
              <Link to={`/messages?user=${profile.id}`} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400">
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Published Pitches</h2>
          <span className="text-sm text-gray-500">{posts.length} visible</span>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-gray-900 p-8 text-gray-400">No published pitches yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.id} to={`/pitches/${post.id}`} className="rounded-lg border border-white/10 bg-gray-900 p-5 transition hover:border-cyan-400/60">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-cyan-400/10 px-2 py-1 font-semibold text-cyan-200">{post.industry}</span>
                  <span className="rounded-md bg-gray-800 px-2 py-1 text-gray-300">{formatStage(post.funding_stage)}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">{post.tagline}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{numberCompact(post.upvotes_count)}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{numberCompact(post.comments_count)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
