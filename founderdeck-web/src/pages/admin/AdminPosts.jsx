import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getPosts } from '../../api/posts';
import { formatStage } from '../../lib/format';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await getPosts({ sort: 'latest', per_page: 30 });
      setPosts(data.data ?? []);
    } catch {
      toast.error('Could not load posts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const removePost = async (post) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await api.delete(`/admin/posts/${post.id}`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post.');
    }
  };

  return (
    <div className="space-y-6 text-[#111111]">
      <div>
        <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">Posts</h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">Moderate public pitch posts.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
          </div>
        ) : posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-3 border-b border-black/5 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
            <div>
              <Link to={`/pitches/${post.id}`} className="font-bold text-[#111111] hover:text-[#FF5C00] transition-colors text-base">
                {post.title}
              </Link>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                {post.industry} &bull; {formatStage(post.funding_stage)} &bull; {post.user?.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removePost(post)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-bold text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
