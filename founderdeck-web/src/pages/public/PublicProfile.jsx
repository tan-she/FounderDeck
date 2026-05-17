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
      <div className="flex min-h-screen items-center justify-center bg-[#EAEAEA] pt-16">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF5C00]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#EAEAEA] px-4 pt-28">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-white p-6 text-red-600 font-bold shadow-sm">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAEAEA] pt-16 text-[#111111]">
      <section className="border-b border-black/5 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FF5C00]/10 text-3xl font-bold text-[#FF5C00]">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" /> : initials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF5C00]">{profile.role}</p>
            <h1 className="mt-1 text-4xl font-display font-black text-[#111111] uppercase tracking-tight">{profile.name}</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-gray-500">{profile.bio || 'This member has not added a bio yet.'}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F4] border border-black/5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-black/5 transition-all">
                  <BriefcaseBusiness className="h-4 w-4 text-gray-400" /> LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F4] border border-black/5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-black/5 transition-all">
                  <Code2 className="h-4 w-4" /> GitHub
                </a>
              )}
              <Link to={`/messages?user=${profile.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-5 py-2 text-xs font-bold text-white transition-all">
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-[#111111] uppercase tracking-tight">Published Pitches</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{posts.length} visible</span>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-center font-semibold text-gray-400 shadow-sm">No published pitches yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.id} to={`/pitches/${post.id}`} className="block rounded-xl border border-black/5 bg-white p-5 transition hover:border-[#FF5C00]/30 shadow-sm">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-[#FF5C00]/10 px-2 py-0.5 font-bold text-[#FF5C00] uppercase tracking-wide">{post.industry}</span>
                  <span className="rounded-md bg-black/5 px-2 py-0.5 font-bold text-gray-500 uppercase tracking-wide">{formatStage(post.funding_stage)}</span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] leading-snug">{post.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-relaxed text-gray-500">{post.tagline}</p>
                <div className="mt-4 flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1"><ThumbsUp className="h-4 w-4 text-[#FF5C00]" /> {numberCompact(post.upvotes_count)}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4 text-gray-400" /> {numberCompact(post.comments_count)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
