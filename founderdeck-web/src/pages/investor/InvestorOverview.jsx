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
          <h1 className="text-2xl font-bold">Investor Dashboard</h1>
          <p className="mt-1 text-gray-400">Find strong ideas and manage founder outreach.</p>
        </div>
        <Link to="/pitches" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-gray-950 transition hover:bg-cyan-400">
          <Search className="h-4 w-4" /> Browse Pitches
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={TrendingUp} label="Trending pitches" value={posts.length} />
        <Stat icon={Handshake} label="Sent requests" value={collabs.length} />
        <Stat icon={Handshake} label="Accepted" value={accepted} />
      </div>

      <section className="rounded-lg border border-white/10 bg-gray-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Trending now</h2>
          <Link to="/pitches" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">View feed</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/pitches/${post.id}`} className="rounded-lg border border-white/10 bg-gray-950 p-4 transition hover:border-cyan-400/60">
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-cyan-200">{post.industry}</span>
                <span className="rounded-md bg-gray-800 px-2 py-1 text-gray-300">{formatStage(post.funding_stage)}</span>
              </div>
              <h3 className="font-semibold">{post.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-400">{post.tagline}</p>
              <p className="mt-3 text-xs text-gray-500">{numberCompact(post.upvotes_count)} upvotes</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900 p-5">
      <Icon className="mb-4 h-5 w-5 text-cyan-300" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}
