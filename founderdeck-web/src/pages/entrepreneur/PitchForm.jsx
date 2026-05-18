import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, getPost, updatePost } from '../../api/posts';
import { generateOneLiner, enhanceDescription } from '../../api/ai';
import { ArrowLeft, Code2, Image, Link2, Loader2, Play, Rocket, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DeckUploader from '../../components/pitch/DeckUploader';

const optionalUrl = z.string().trim().url('Enter a valid URL').or(z.literal('')).optional();

const pitchSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(150, 'Keep the title under 150 characters'),
  tagline: z.string().trim().min(10, 'Tagline must be at least 10 characters').max(255, 'Keep the tagline under 255 characters'),
  one_liner_summary: z.string().trim().max(255, 'Keep the summary under 255 characters').optional(),
  description: z.string().trim().min(80, 'Describe the problem, solution, customer, and traction in at least 80 characters'),
  industry: z.string().trim().min(2, 'Industry is required').max(100, 'Keep industry under 100 characters'),
  funding_stage: z.enum(['idea', 'mvp', 'seed', 'series_a', 'looking_for_cofounders']),
  tech_stack: z.string().optional(),
  tags: z.string().optional(),
  cover_image_url: optionalUrl,
  video_url: optionalUrl,
  slides: z.string().optional(),
  demo_url: optionalUrl,
  github_repo_url: optionalUrl,
});

const defaultValues = {
  title: '',
  tagline: '',
  one_liner_summary: '',
  description: '',
  industry: 'Technology',
  funding_stage: 'idea',
  tech_stack: '',
  tags: '',
  cover_image_url: '',
  video_url: '',
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
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const [deckFiles, setDeckFiles] = useState([]);
  const [removedDeck, setRemovedDeck] = useState([]);
  const [existingDeckFiles, setExistingDeckFiles] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pitchSchema),
    defaultValues,
  });

  const handleEnhance = async () => {
    const currentContent = watch('description');
    if (!currentContent || currentContent.trim().length < 50) {
      toast.error('Write at least 50 characters in Full Pitch first.');
      return;
    }

    setIsEnhancing(true);
    try {
      const { description } = await enhanceDescription({
        title: watch('title'),
        description: currentContent,
        industry: watch('industry')
      });

      setValue('description', description, { shouldValidate: true, shouldDirty: true });
      toast.success('Description enhanced!');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Enhancement failed.';
      toast.error(msg);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate automated AI summary from Pitch description or tagline
  const handleGenerateSummary = async () => {
    const title = watch('title');
    if (!title) {
      toast.error("Please enter a Startup Name first.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const { summary } = await generateOneLiner({
        title,
        tagline: watch('tagline'),
        description: watch('description'),
        industry: watch('industry'),
      });

      setValue('one_liner_summary', summary, { shouldValidate: true, shouldDirty: true });
      toast.success("One-liner generated!");
    } catch (err) {
      const msg = err.response?.data?.message ?? "AI generation failed.";
      toast.error(msg);
    } finally {
      setIsGeneratingSummary(false);
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
        const pitchData = data.data;
        reset({
          title: pitchData.title ?? '',
          tagline: pitchData.tagline ?? '',
          one_liner_summary: pitchData.one_liner_summary ?? '',
          description: pitchData.description ?? '',
          industry: pitchData.industry ?? 'Technology',
          funding_stage: pitchData.funding_stage ?? 'idea',
          tech_stack: (pitchData.tech_stack ?? []).join(', '),
          tags: joinList(pitchData.tags ?? []),
          cover_image_url: pitchData.cover_image_url ?? '',
          video_url: pitchData.video_url ?? '',
          demo_url: pitchData.demo_url ?? '',
          github_repo_url: pitchData.github_repo_url ?? '',
        });
        setExistingDeckFiles(pitchData.deck_files ?? []);
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
    const formData = new FormData();
    
    // Append standard fields
    Object.keys(data).forEach((key) => {
      if (['tech_stack', 'tags', 'slides', 'cover_image_url'].includes(key)) return;
      if (data[key]) formData.append(key, data[key]);
    });

    const techStack = splitList(data.tech_stack);
    techStack.forEach((item) => formData.append("tech_stack[]", item));

    const tags = splitList(data.tags);
    tags.forEach((item) => formData.append("tags[]", item));

    deckFiles.forEach((f) => formData.append("deck_slides[]", f));
    removedDeck.forEach((p) => formData.append("remove_deck_slides[]", p));

    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }

    if (isEditing) {
      formData.append("_method", "PATCH");
    }

    try {
      if (isEditing) {
        await updatePost(id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pitch updated successfully');
      } else {
        await createPost(formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      <div className="flex h-64 items-center justify-center bg-[#EAEAEA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-12 text-[#111111]">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/entrepreneur/pitches')}
          className="rounded-full border border-black/5 bg-white p-2.5 text-gray-500 transition hover:bg-black/5 hover:text-[#111111]"
          aria-label="Back to pitches"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-black text-[#111111] uppercase tracking-tight">{title}</h1>
          <p className="text-sm font-semibold text-gray-500">Turn a raw startup thought into a clear investor-ready post.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 border-b border-black/5 pb-3">
            <Rocket className="h-5 w-5 text-[#FF5C00]" />
            <h2 className="text-xl font-display font-black text-[#111111] uppercase tracking-tight">Pitch Basics</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-gray-700">Startup Name / Title</span>
              <input
                {...register('title')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="FounderDeck"
              />
              {errors.title && <p className="mt-2 text-sm font-semibold text-red-500">{errors.title.message}</p>}
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-gray-700">One-Line Tagline</span>
              <input
                {...register('tagline')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="A focused network where founders earn feedback, votes, and investor conversations."
              />
              {errors.tagline && <p className="mt-2 text-sm font-semibold text-red-500">{errors.tagline.message}</p>}
            </label>

            {/* AI Auto-Generated One-Liner Summary Input */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Auto-Generated One-Liner Summary</span>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5C00]/10 border border-[#FF5C00]/20 px-3 py-1.5 text-xs font-bold text-[#FF5C00] hover:bg-[#FF5C00]/20 transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isGeneratingSummary ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-[#FF5C00] border-t-transparent rounded-full" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>Auto-Generate One-Liner</span>
                    </>
                  )}
                </button>
              </div>
              <input
                {...register('one_liner_summary')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="💡 Click Auto-Generate to capture key value proposition instantly."
              />
              {errors.one_liner_summary && <p className="mt-2 text-sm font-semibold text-red-500">{errors.one_liner_summary.message}</p>}
            </div>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">Industry</span>
              <input
                {...register('industry')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="SaaS"
              />
              {errors.industry && <p className="mt-2 text-sm font-semibold text-red-500">{errors.industry.message}</p>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">Funding Stage</span>
              <select
                {...register('funding_stage')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
              >
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP</option>
                <option value="seed">Seed</option>
                <option value="series_a">Series A</option>
                <option value="looking_for_cofounders">Looking for co-founders</option>
              </select>
              {errors.funding_stage && <p className="mt-2 text-sm font-semibold text-red-500">{errors.funding_stage.message}</p>}
            </label>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="description" className="text-sm font-bold text-gray-700">
                  Full Pitch
                </label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5C00]/10 border border-[#FF5C00]/20 px-4 py-2 text-xs font-bold text-[#FF5C00] hover:bg-[#FF5C00]/20 transition-all disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                >
                  {isEnhancing ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#FF5C00] border-t-transparent rounded-full" />
                      <span>Enhancing... (may take ~30s)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-[#FF5C00]" />
                      <span>Enhance description</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="description"
                {...register('description')}
                rows={9}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm leading-relaxed"
                placeholder="Describe the problem, your solution, who it is for, current traction, business model, and what kind of collaboration or investment you want."
              />
              {errors.description && <p className="mt-2 text-sm font-semibold text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 border-b border-black/5 pb-3">
            <Link2 className="h-5 w-5 text-[#FF5C00]" />
            <h2 className="text-xl font-display font-black text-[#111111] uppercase tracking-tight">Rich Content and Resource Links</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">Tech Stack</span>
              <input
                {...register('tech_stack')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="React, Laravel, PostgreSQL"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">Tags</span>
              <input
                {...register('tags')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="ai, marketplace, productivity"
              />
            </label>

            {/* Video Pitch Link */}
            <label className="md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <Play className="h-4 w-4 text-[#FF5C00] fill-current" /> Elevator Video Pitch URL (YouTube or Loom)
              </span>
              <input
                {...register('video_url')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="https://www.youtube.com/watch?v=... or https://loom.com/share/..."
              />
              {errors.video_url && <p className="mt-2 text-sm font-semibold text-red-500">{errors.video_url.message}</p>}
            </label>

            {/* Pitch Deck Slide Preview URLs */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pitch Deck Slides
              </label>
              <DeckUploader
                existingFiles={existingDeckFiles}
                onChange={(files, removed) => {
                  setDeckFiles(files);
                  setRemovedDeck(removed);
                }}
              />
            </div>

            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <Image className="h-4 w-4" /> Cover Image
              </span>
              <div className="relative overflow-hidden rounded-xl border border-dashed border-black/20 bg-[#F4F4F4] transition-all hover:bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverImageFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                />
                {coverImageFile ? (
                  <div className="text-sm font-bold text-gray-700">{coverImageFile.name}</div>
                ) : getValues('cover_image_url') ? (
                  <div className="text-sm font-bold text-gray-700">Current cover image exists. Upload to replace.</div>
                ) : (
                  <div className="text-sm font-bold text-gray-500">
                    <span className="text-[#FF5C00]">Upload image</span> (Max 5MB)
                  </div>
                )}
              </div>
            </label>

            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700"><Link2 className="h-4 w-4" /> Demo URL</span>
              <input
                {...register('demo_url')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="https://..."
              />
              {errors.demo_url && <p className="mt-2 text-sm font-semibold text-red-500">{errors.demo_url.message}</p>}
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700"><Code2 className="h-4 w-4" /> GitHub Repository URL</span>
              <input
                {...register('github_repo_url')}
                className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                placeholder="https://github.com/yourname/project"
              />
              {errors.github_repo_url && <p className="mt-2 text-sm font-semibold text-red-500">{errors.github_repo_url.message}</p>}
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] shadow-md shadow-[#FF5C00]/15 px-8 py-3.5 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isEditing ? 'Save Pitch' : 'Publish Pitch'}
          </button>
        </div>
      </form>
    </div>
  );
}
