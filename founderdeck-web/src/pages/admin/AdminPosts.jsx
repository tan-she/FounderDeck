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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="mt-1 text-gray-400">Moderate public pitch posts.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-3 border-b border-white/10 p-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
            <div>
              <Link to={`/pitches/${post.id}`} className="font-semibold text-white hover:text-cyan-300">{post.title}</Link>
              <p className="mt-1 text-sm text-gray-500">{post.industry} - {formatStage(post.funding_stage)} - {post.user?.name}</p>
            </div>
            <button type="button" onClick={() => removePost(post)} className="inline-flex w-fit items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
