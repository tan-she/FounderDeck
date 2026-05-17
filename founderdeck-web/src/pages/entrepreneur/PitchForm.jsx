import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, getPost, updatePost, enhancePitch } from '../../api/posts';
import { ArrowLeft, Code2, Image, Link2, Loader2, Rocket, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const optionalUrl = z.string().trim().url('Enter a valid URL').or(z.literal('')).optional();

const pitchSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(150, 'Keep the title under 150 characters'),
  tagline: z.string().trim().min(10, 'Tagline must be at least 10 characters').max(255, 'Keep the tagline under 255 characters'),
  description: z.string().trim().min(80, 'Describe the problem, solution, customer, and traction in at least 80 characters'),
  industry: z.string().trim().min(2, 'Industry is required').max(100, 'Keep industry under 100 characters'),
  funding_stage: z.enum(['idea', 'mvp', 'seed', 'series_a', 'looking_for_cofounders']),
  tech_stack: z.string().optional(),
  tags: z.string().optional(),
  cover_image_url: optionalUrl,
  demo_url: optionalUrl,
  github_repo_url: optionalUrl,
});

const defaultValues = {
  title: '',
  tagline: '',
  description: '',
  industry: 'Technology',
  funding_stage: 'idea',
  tech_stack: '',
  tags: '',
  cover_image_url: '',
  demo_url: '',
  github_repo_url: '',
};

const splitList = (value = '') => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const joinList = (value = []) => value.map((item) => item?.name ?? item).filter(Boolean).join(', ');

export default function PitchForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pitchSchema),
    defaultValues,
  });

  const handleEnhance = async () => {
    const currentContent = watch('description');
    if (!currentContent || currentContent.trim().length < 10) {
      toast.error('Please enter at least a few rough notes or a brief description before enhancing.');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const response = await enhancePitch({
        field: 'description',
        content: currentContent
      });
      
      if (response.data && response.data.enhanced_content) {
        setValue('description', response.data.enhanced_content, { shouldValidate: true, shouldDirty: true });
        toast.success('Pitch enhanced successfully!');
      } else {
        toast.error('AI response did not return expected content.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to enhance pitch with AI.';
      toast.error(message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const title = useMemo(() => (isEditing ? 'Edit Pitch' : 'Create New Pitch'), [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    setIsLoading(true);

    getPost(id)
      .then(({ data }) => {
        if (!isMounted) return;
        const pitch = data.data;
        reset({
          title: pitch.title ?? '',
          tagline: pitch.tagline ?? '',
          description: pitch.description ?? '',
          industry: pitch.industry ?? 'Technology',
          funding_stage: pitch.funding_stage ?? 'idea',
          tech_stack: (pitch.tech_stack ?? []).join(', '),
          tags: joinList(pitch.tags ?? []),
          cover_image_url: pitch.cover_image_url ?? '',
          demo_url: pitch.demo_url ?? '',
          github_repo_url: pitch.github_repo_url ?? '',
        });
      })
      .catch(() => {
        toast.error('Could not load this pitch for editing.');
        navigate('/dashboard/entrepreneur/pitches');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, navigate, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tech_stack: splitList(data.tech_stack),
      tags: splitList(data.tags),
      cover_image_url: data.cover_image_url || null,
      demo_url: data.demo_url || null,
      github_repo_url: data.github_repo_url || null,
    };

    try {
      if (isEditing) {
        await updatePost(id, payload);
        toast.success('Pitch updated successfully');
      } else {
        await createPost(payload);
        toast.success('Pitch published successfully');
      }
      navigate('/dashboard/entrepreneur/pitches');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save pitch';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/entrepreneur/pitches')}
          className="rounded-lg border border-white/10 bg-gray-900 p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          aria-label="Back to pitches"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400">Turn a raw startup thought into a clear investor-ready post.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-lg border border-white/10 bg-gray-900 p-6">
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
            <Rocket className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Pitch Basics</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-gray-300">Startup Name / Title</span>
              <input
                {...register('title')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="FounderDeck"
              />
              {errors.title && <p className="mt-1 text-sm text-red-300">{errors.title.message}</p>}
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-gray-300">One-Line Tagline</span>
              <input
                {...register('tagline')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="A focused network where founders earn feedback, votes, and investor conversations."
              />
              {errors.tagline && <p className="mt-1 text-sm text-red-300">{errors.tagline.message}</p>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-300">Industry</span>
              <input
                {...register('industry')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="SaaS"
              />
              {errors.industry && <p className="mt-1 text-sm text-red-300">{errors.industry.message}</p>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-300">Funding Stage</span>
              <select
                {...register('funding_stage')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP</option>
                <option value="seed">Seed</option>
                <option value="series_a">Series A</option>
                <option value="looking_for_cofounders">Looking for co-founders</option>
              </select>
              {errors.funding_stage && <p className="mt-1 text-sm text-red-300">{errors.funding_stage.message}</p>}
            </label>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Full Pitch
                </label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="inline-flex items-center gap-1.5 rounded-md bg-cyan-950 px-3 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/80 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                      <span>Enhance with AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="description"
                {...register('description')}
                rows={9}
                className="w-full resize-y rounded-md border border-white/10 bg-gray-950 px-4 py-3 leading-7 text-white outline-none transition focus:border-cyan-400"
                placeholder="Describe the problem, your solution, who it is for, current traction, business model, and what kind of collaboration or investment you want."
              />
              {errors.description && <p className="mt-1 text-sm text-red-300">{errors.description.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-gray-900 p-6">
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
            <Link2 className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Links and Discovery</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-gray-300">Tech Stack</span>
              <input
                {...register('tech_stack')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="React, Laravel, PostgreSQL"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-300">Tags</span>
              <input
                {...register('tags')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="ai, marketplace, productivity"
              />
            </label>

            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"><Image className="h-4 w-4" /> Cover Image URL</span>
              <input
                {...register('cover_image_url')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="https://..."
              />
              {errors.cover_image_url && <p className="mt-1 text-sm text-red-300">{errors.cover_image_url.message}</p>}
            </label>

            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"><Link2 className="h-4 w-4" /> Demo URL</span>
              <input
                {...register('demo_url')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="https://..."
              />
              {errors.demo_url && <p className="mt-1 text-sm text-red-300">{errors.demo_url.message}</p>}
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"><Code2 className="h-4 w-4" /> GitHub Repository URL</span>
              <input
                {...register('github_repo_url')}
                className="w-full rounded-md border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="https://github.com/yourname/project"
              />
              {errors.github_repo_url && <p className="mt-1 text-sm text-red-300">{errors.github_repo_url.message}</p>}
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isEditing ? 'Save Pitch' : 'Publish Pitch'}
          </button>
        </div>
      </form>
    </div>
  );
}
