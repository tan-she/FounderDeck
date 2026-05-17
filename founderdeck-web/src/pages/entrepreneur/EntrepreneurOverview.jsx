import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getMyPosts } from '../../api/posts';
import { numberCompact } from '../../lib/format';
import { Handshake, MessageSquare, Plus, Presentation, ThumbsUp } from 'lucide-react';

export default function EntrepreneurOverview() {
  const [posts, setPosts] = useState([]);
  const [collabs, setCollabs] = useState([]);

  useEffect(() => {
    Promise.all([
      getMyPosts({ per_page: 6 }),
      api.get('/collab/received'),
    ]).then(([postResponse, collabResponse]) => {
      setPosts(postResponse.data.data ?? []);
      setCollabs(collabResponse.data.data ?? []);
    }).catch(() => {
      setPosts([]);
      setCollabs([]);
    });
  }, []);

  const totalVotes = posts.reduce((sum, post) => sum + (post.upvotes_count ?? 0) - (post.downvotes_count ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments_count ?? 0), 0);
  const pendingCollabs = collabs.filter((item) => item.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-[#111111]">Founder Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Track pitch traction and investor interest.</p>
        </div>
        <Link to="/dashboard/entrepreneur/pitches/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] px-5 py-2.5 font-bold text-white transition-all shadow-md shadow-[#FF5C00]/15 hover:scale-[1.02]">
          <Plus className="h-4 w-4" /> New Pitch
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Presentation} label="Pitches" value={posts.length} />
        <Stat icon={ThumbsUp} label="Net votes" value={numberCompact(totalVotes)} />
        <Stat icon={MessageSquare} label="Comments" value={numberCompact(totalComments)} />
        <Stat icon={Handshake} label="Pending collabs" value={numberCompact(pendingCollabs)} />
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-display font-black text-[#111111]">Recent pitches</h2>
          <Link to="/dashboard/entrepreneur/pitches" className="text-sm font-bold text-[#FF5C00] hover:text-[#E65300] transition-colors">Manage all</Link>
        </div>
        {posts.length === 0 ? (
          <p className="rounded-xl bg-[#F4F4F4] p-4 text-sm font-semibold text-gray-500">Create your first pitch to start collecting validation.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {posts.slice(0, 4).map((post) => (
              <Link key={post.id} to={`/pitches/${post.id}`} className="rounded-xl border border-black/5 bg-[#F4F4F4] p-4 transition-all hover:border-[#FF5C00]/40 hover:bg-white hover:shadow-sm">
                <h3 className="font-display font-bold text-[#111111]">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-500">{post.tagline}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[#FF5C00]/10 text-[#FF5C00] p-2.5 transition-colors group-hover:bg-[#FF5C00] group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-display font-black text-[#111111]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-gray-500">{label}</p>
    </div>
  );
}
