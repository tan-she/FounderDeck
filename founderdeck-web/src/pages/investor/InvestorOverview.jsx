import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getPosts } from '../../api/posts';
import { formatStage, numberCompact } from '../../lib/format';
import { Handshake, Search, TrendingUp } from 'lucide-react';

export default function InvestorOverview() {
  const [posts, setPosts] = useState([]);
  const [collabs, setCollabs] = useState([]);

  useEffect(() => {
    Promise.all([
      getPosts({ sort: 'trending', per_page: 6 }),
      api.get('/collab/sent'),
    ]).then(([postResponse, collabResponse]) => {
      setPosts(postResponse.data.data ?? []);
      setCollabs(collabResponse.data.data ?? []);
    }).catch(() => {
      setPosts([]);
      setCollabs([]);
    });
  }, []);

  const accepted = collabs.filter((item) => item.status === 'accepted').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">Investor Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Find strong ideas and manage founder outreach.</p>
        </div>
        <Link to="/pitches" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-6 py-3 font-bold text-white transition-all">
          <Search className="h-4 w-4" /> Browse Pitches
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={TrendingUp} label="Trending pitches" value={posts.length} />
        <Stat icon={Handshake} label="Sent requests" value={collabs.length} />
        <Stat icon={Handshake} label="Accepted" value={accepted} />
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-[#111111] uppercase tracking-tight">Trending now</h2>
          <Link to="/pitches" className="text-sm font-bold text-[#FF5C00] hover:text-[#E65300] transition-colors">View feed</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/pitches/${post.id}`} className="block rounded-xl border border-black/5 bg-[#F4F4F4] p-5 transition hover:border-[#FF5C00]/30">
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-[#FF5C00]/10 px-2 py-1 font-bold text-[#FF5C00] uppercase tracking-wide">{post.industry}</span>
                <span className="rounded-md bg-black/5 px-2 py-1 font-bold text-gray-600 uppercase tracking-wide">{formatStage(post.funding_stage)}</span>
              </div>
              <h3 className="font-bold text-[#111111] text-base leading-snug">{post.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-gray-500 leading-relaxed">{post.tagline}</p>
              <p className="mt-4 text-xs font-bold text-[#FF5C00] uppercase tracking-wider">{numberCompact(post.upvotes_count)} upvotes</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-[#FF5C00]/10 rounded-xl flex-shrink-0">
        <Icon className="h-6 w-6 text-[#FF5C00]" />
      </div>
      <div>
        <p className="text-3xl font-display font-black text-[#111111] leading-none">{value}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      </div>
    </div>
  );
}
