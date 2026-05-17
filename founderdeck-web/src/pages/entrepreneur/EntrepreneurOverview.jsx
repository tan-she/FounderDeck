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
          <h1 className="text-2xl font-bold">Founder Dashboard</h1>
          <p className="mt-1 text-gray-400">Track pitch traction and investor interest.</p>
        </div>
        <Link to="/dashboard/entrepreneur/pitches/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-gray-950 transition hover:bg-cyan-400">
          <Plus className="h-4 w-4" /> New Pitch
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Presentation} label="Pitches" value={posts.length} />
        <Stat icon={ThumbsUp} label="Net votes" value={numberCompact(totalVotes)} />
        <Stat icon={MessageSquare} label="Comments" value={numberCompact(totalComments)} />
        <Stat icon={Handshake} label="Pending collabs" value={numberCompact(pendingCollabs)} />
      </div>

      <section className="rounded-lg border border-white/10 bg-gray-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent pitches</h2>
          <Link to="/dashboard/entrepreneur/pitches" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Manage all</Link>
        </div>
        {posts.length === 0 ? (
          <p className="rounded-lg bg-gray-950 p-4 text-sm text-gray-400">Create your first pitch to start collecting validation.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {posts.slice(0, 4).map((post) => (
              <Link key={post.id} to={`/pitches/${post.id}`} className="rounded-lg border border-white/10 bg-gray-950 p-4 transition hover:border-cyan-400/60">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">{post.tagline}</p>
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
    <div className="rounded-lg border border-white/10 bg-gray-900 p-5">
      <Icon className="mb-4 h-5 w-5 text-cyan-300" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}
