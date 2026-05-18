import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getPosts } from '../../api/posts';
import { useAuthStore } from '../../store/useAuthStore';
import { getPostImage, initials } from '../../lib/format';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
  Send,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

// Custom stage formatting helper for mock values
const formatStageLabel = (stage) => {
  if (stage === 'series_a') return 'Series A';
  if (stage === 'seed') return 'Seed';
  if (stage === 'mvp') return 'MVP';
  if (stage === 'idea') return 'Pre-Seed';
  return 'Pre-Seed';
};

export default function PitchFeed() {
  const { isAuthenticated } = useAuthStore();
  const [pitches, setPitches] = useState([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [stage, setStage] = useState('');
  const [sort] = useState('trending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Target Range Slider state (default $5M+)
  const [rangeValue, setRangeValue] = useState(5000000);

  // Quick Preview Modal state
  const [previewPitch, setPreviewPitch] = useState(null);
  const [previewComments, setPreviewComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('details');

  // Load pitches from backend
  const params = useMemo(() => ({
    search: search || undefined,
    industry: industry !== 'All' ? industry : undefined,
    funding_stage: stage || undefined,
    sort,
    per_page: 24,
  }), [industry, search, sort, stage]);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await getPosts(params);
      setPitches(data.data ?? []);
    } catch {
      setError('Could not load pitches right now. Please check that the Laravel API is running.');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Deterministic Mock Seeks/Target Generator based on pitch ID & stage
  const getMockTargetAmount = (pitch) => {
    let hash = 0;
    const idStr = pitch.id || 'default';
    for (let i = 0; i < Math.min(idStr.length, 5); i++) {
      hash += idStr.charCodeAt(i);
    }
    const currentStage = pitch.funding_stage;
    if (currentStage === 'series_a') {
      return 1500000 + (hash % 36) * 100000;
    } else if (currentStage === 'seed') {
      return 500000 + (hash % 11) * 100000;
    } else if (currentStage === 'mvp') {
      return 200000 + (hash % 4) * 100000;
    } else {
      return 50000 + (hash % 4) * 50000;
    }
  };

  const formatMockAmount = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}k`;
  };

  const getMockCommitment = (pitch) => {
    let hash = 0;
    const idStr = pitch.id || 'default';
    for (let i = 0; i < Math.min(idStr.length, 5); i++) {
      hash += idStr.charCodeAt(i);
    }
    return 15 + (hash % 15) * 5; // Deterministic range 15% - 85%
  };

  const getMockDaysLeft = (pitch) => {
    let hash = 0;
    const idStr = pitch.id || 'default';
    for (let i = 0; i < Math.min(idStr.length, 5); i++) {
      hash += idStr.charCodeAt(i);
    }
    return 5 + (hash % 6) * 5; // Deterministic range 5 to 30 days
  };

  // Locally Filter pitches by slider value in addition to server-side filters!
  const filteredPitches = useMemo(() => {
    return pitches.filter((pitch) => {
      const target = getMockTargetAmount(pitch);
      return target <= rangeValue;
    });
  }, [pitches, rangeValue]);

  // Handle inline vote/intent reaction from card or modal
  const handleInlineVote = async (event, pitchId, voteType) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error('Please log in to cast a signal or vote.');
      return;
    }

    try {
      const { data } = await api.post(`/posts/${pitchId}/vote`, { vote_type: voteType });
      
      setPitches((current) =>
        current.map((item) =>
          item.id === pitchId
            ? {
                ...item,
                upvotes_count: data.upvotes,
                downvotes_count: data.downvotes,
                weighted_score: data.weighted_score,
                seeking_cofounder_count: data.seeking_cofounder_count,
                looking_to_invest_count: data.looking_to_invest_count,
                need_advisor_count: data.need_advisor_count,
                user_vote: data.user_vote,
              }
            : item
        )
      );

      if (previewPitch && previewPitch.id === pitchId) {
        setPreviewPitch((current) => ({
          ...current,
          upvotes_count: data.upvotes,
          downvotes_count: data.downvotes,
          weighted_score: data.weighted_score,
          seeking_cofounder_count: data.seeking_cofounder_count,
          looking_to_invest_count: data.looking_to_invest_count,
          need_advisor_count: data.need_advisor_count,
          user_vote: data.user_vote,
        }));
      }

      const formattedLabel = {
        up: 'Upvoted pitch!',
        down: 'Downvoted pitch.',
        seeking_cofounder: '🤝 Intent cast: Seeking Co-Founder',
        looking_to_invest: '💸 Intent cast: Looking to Invest',
        need_advisor: '💡 Intent cast: Need Advisor',
      }[voteType] || 'Signal updated!';

      toast.success(formattedLabel);
    } catch (voteError) {
      toast.error(voteError.response?.data?.message || 'Could not save your vote.');
    }
  };

  // Toggle Bookmark for Pitch
  const handleBookmarkToggle = async (event, pitchId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save bookmarks.');
      return;
    }

    try {
      const { data } = await api.post(`/posts/${pitchId}/bookmark`);
      
      setPitches((current) =>
        current.map((item) =>
          item.id === pitchId
            ? { ...item, is_bookmarked: data.is_bookmarked }
            : item
        )
      );

      if (previewPitch && previewPitch.id === pitchId) {
        setPreviewPitch((current) => ({
          ...current,
          is_bookmarked: data.is_bookmarked,
        }));
      }

      toast.success(data.message);
    } catch {
      toast.error('Bookmark update failed.');
    }
  };

  // Open Quick View Modal
  const openQuickView = async (event, pitch, initialTab = 'details') => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewPitch(pitch);
    setActiveModalTab(initialTab);
    setPreviewComments([]);
    setNewComment('');

    try {
      const { data } = await api.get(`/posts/${pitch.id}/comments`);
      setPreviewComments(data.data ?? []);
    } catch {
      // Ignored non-blocking comments load
    }
  };

  // Submit comment inside Quick View Modal
  const submitQuickComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || isCommenting || !previewPitch) return;

    setIsCommenting(true);
    try {
      const { data } = await api.post(`/posts/${previewPitch.id}/comments`, {
        body: newComment.trim(),
      });
      setPreviewComments((prev) => [data.data, ...prev]);
      setNewComment('');
      toast.success('Comment posted successfully');

      // Update feed item comments count
      setPitches((current) =>
        current.map((item) =>
          item.id === previewPitch.id
            ? { ...item, comments_count: (item.comments_count ?? 0) + 1 }
            : item
        )
      );
    } catch (commentErr) {
      toast.error(commentErr.response?.data?.message || 'Failed to post comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setIndustry('All');
    setStage('');
    setRangeValue(5000000);
    toast.success('Filters cleared successfully!');
  };

  return (
    <div className="bg-[#EAEAEA] text-[#111111] font-sans antialiased min-h-screen pb-24 pt-6">
      {/* Dynamic 3-Column Grid Dashboard */}
      <section className="mx-auto max-w-[1500px] px-6 lg:px-8 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ==================== LEFT COLUMN: FILTERS ==================== */}
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 border-r border-black/10 pr-6 lg:h-[calc(100vh-120px)] overflow-y-auto">
          <div>
            <h2 className="font-serif text-3xl font-black mb-6 text-[#111111] tracking-tight">Filters</h2>
          </div>

          {/* Industry Checkboxes */}
          <div className="space-y-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans">Industry</span>
            <div className="space-y-3">
              {[
                { name: 'FinTech', count: '320' },
                { name: 'SaaS', count: '512' },
                { name: 'HealthTech', count: '144' },
                { name: 'AI & ML', apiVal: 'Technology', count: '272' }
              ].map((indOption) => {
                const targetVal = indOption.apiVal || indOption.name;
                const isChecked = industry === targetVal;
                return (
                  <label key={indOption.name} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setIndustry(isChecked ? 'All' : targetVal)}
                        className="sr-only"
                      />
                      <div className={`w-[18px] h-[18px] border-[1.5px] rounded-[3px] flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-[#FF5C00] border-[#FF5C00]' 
                          : 'border-gray-300 bg-white group-hover:border-gray-500'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">{indOption.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Funding Stage buttons */}
          <div className="space-y-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans">Funding Stage</span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: 'Pre-Seed', value: 'idea' },
                { label: 'Seed', value: 'seed' },
                { label: 'Series A', value: 'series_a' }
              ].map((stgBtn) => {
                const isActive = stage === stgBtn.value;
                return (
                  <button
                    key={stgBtn.label}
                    type="button"
                    onClick={() => setStage(isActive ? '' : stgBtn.value)}
                    className={`px-4 py-2 border rounded-[4px] text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#FF5C00] border-[#FF5C00] text-white' 
                        : 'bg-white border-black/10 text-gray-800 hover:border-gray-400'
                    }`}
                  >
                    {stgBtn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Range Slider */}
          <div className="space-y-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans">Target Range</span>
            <div className="space-y-2">
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={rangeValue}
                onChange={(event) => setRangeValue(Number(event.target.value))}
                className="w-full accent-[#FF5C00] bg-gray-300 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-bold text-gray-500 font-sans">
                <span>$100k</span>
                <span className="text-[#FF5C00]">{formatMockAmount(rangeValue)}{rangeValue >= 5000000 ? '+' : ''} Limit</span>
                <span>$5M+</span>
              </div>
            </div>
          </div>

          {/* Reset All button */}
          <div className="pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full bg-[#FF5C00] hover:bg-[#E65300] active:bg-[#c64400] text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[4px] transition-all border border-black/5 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        </aside>

        {/* ==================== MIDDLE COLUMN: EXPLORER FEED ==================== */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Header block with count */}
          <div className="border-b border-black/10 pb-6 flex items-end justify-between">
            <div>
              <h1 className="font-serif text-5xl font-black text-[#111111] tracking-tight">Pitch Explorer</h1>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-500 font-sans tracking-wide">
                Showing {filteredPitches.length.toLocaleString()} Results
              </span>
            </div>
          </div>

          {/* Feed List */}
          {isLoading ? (
            <div className="flex h-96 items-center justify-center rounded-2xl border border-black/5 bg-white/80 backdrop-blur-md shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600 font-semibold shadow-sm">
              {error}
            </div>
          ) : filteredPitches.length === 0 ? (
            <div className="rounded-2xl bg-white border border-black/5 p-16 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-400 leading-relaxed italic">
                No pitches found matching your target filter parameters. Try resetting your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPitches.map((pitch, index) => {
                const targetAmt = getMockTargetAmount(pitch);
                const commitment = getMockCommitment(pitch);
                const daysLeft = getMockDaysLeft(pitch);
                
                // Index 0: Trending/Lumina Ledger full-size vertical card
                if (index === 0) {
                  return (
                    <VerticalPitchCard
                      key={pitch.id}
                      pitch={pitch}
                      targetAmt={targetAmt}
                      commitment={commitment}
                      daysLeft={daysLeft}
                      formatMockAmount={formatMockAmount}
                      handleBookmarkToggle={handleBookmarkToggle}
                      handleInlineVote={handleInlineVote}
                      openQuickView={openQuickView}
                    />
                  );
                }
                
                // All other indexes: Horizontal split layouts
                return (
                  <HorizontalPitchCard
                    key={pitch.id}
                    pitch={pitch}
                    targetAmt={targetAmt}
                    commitment={commitment}
                    daysLeft={daysLeft}
                    formatMockAmount={formatMockAmount}
                    handleBookmarkToggle={handleBookmarkToggle}
                    handleInlineVote={handleInlineVote}
                    openQuickView={openQuickView}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* ==================== RIGHT COLUMN: SIDEBARS ==================== */}
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 border-l border-black/10 pl-6 overflow-y-auto">
          
          {/* Live Activity widget */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-serif text-2xl font-black text-gray-900 leading-none">Live Activity</h3>
              <div className="flex items-center gap-1.5 bg-[#FF5C00]/10 text-[#FF5C00] font-black uppercase text-[9px] tracking-wider px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] animate-ping" />
                • Live
              </div>
            </div>

            {/* Timeline structure exactly matching mockup */}
            <div className="relative pl-5 border-l border-black/10 space-y-6">
              {[
                { time: '2 mins ago', boldUser: 'Summit Ventures', text: 'requested a private meeting with', boldStartup: 'Lumina Ledger', highlight: true },
                { time: '15 mins ago', text: 'New Pitch:', boldUser: 'Quantum Shift', textAfter: 'just uploaded their Series B deck in Clean Energy.' },
                { time: '34 mins ago', boldUser: 'Angel Network NY', text: 'committed $500k to', boldStartup: 'NeuralPath Diagnostics' },
                { time: '1 hour ago', boldUser: '5 investors', text: 'viewed', boldStartup: 'CoreFlow Systems', textAfter: 'in the last 60 minutes.' }
              ].map((activityItem, idx) => (
                <div key={idx} className="relative space-y-1 text-xs">
                  {/* Circle Node indicator on the timeline */}
                  <span className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border bg-white ${
                    activityItem.highlight 
                      ? 'border-[#FF5C00] scale-110 shadow shadow-[#FF5C00]/20' 
                      : 'border-gray-300'
                  }`} />
                  
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {activityItem.time}
                  </span>
                  <p className="leading-relaxed text-gray-700 font-medium">
                    {activityItem.boldUser && <strong className="font-black text-black">{activityItem.boldUser} </strong>}
                    {activityItem.text && <span>{activityItem.text} </span>}
                    {activityItem.boldStartup && <strong className="font-black text-black">{activityItem.boldStartup}</strong>}
                    {activityItem.textAfter && <span>{activityItem.textAfter}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended for you box card */}
          <div className="border border-black/5 bg-white/80 backdrop-blur-md p-5 rounded-2xl space-y-4 shadow-sm hover:shadow-md hover:border-[#FF5C00]/30 transition-all duration-300">
            <div>
              <h4 className="font-serif text-xl font-black text-black leading-tight">Recommended for you</h4>
              <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-relaxed">
                Based on your interest in FinTech and Seed stage startups.
              </p>
            </div>

            <div className="flex items-center gap-3.5 pt-2">
              {/* S Box Logo */}
              <div className="w-10 h-10 rounded-[4px] bg-[#111111] text-white flex items-center justify-center font-black text-lg shrink-0 select-none">
                S
              </div>
              <div className="leading-tight">
                <span className="block text-sm font-black text-black">SwiftPay</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 block">Seed &bull; $800k Target</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-[#FF5C00] hover:bg-[#E65300] border border-[#FF5C00]/20 text-white text-xs font-black py-2.5 rounded-[4px] transition-all cursor-pointer"
            >
              Connect
            </button>
          </div>

          {/* YOUR STATS widget */}
          <div className="border-t border-black/10 pt-6 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span>Your Stats</span>
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div>
              <span className="font-serif text-5xl font-black text-black leading-none block">14</span>
              <span className="text-xs font-bold text-gray-600 mt-1 block">New Matches Today</span>
            </div>
          </div>

        </aside>

      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="max-w-[1500px] mx-auto px-6 lg:px-8 mt-24 pt-12 border-t border-black/10 grid grid-cols-1 md:grid-cols-12 gap-8 text-[#111111]">
        
        {/* Left footer: Branding */}
        <div className="md:col-span-5 space-y-4">
          <Link to="/" className="text-3xl font-display font-black tracking-tight text-[#FF5C00]">
            FounderDeck
          </Link>
          <p className="text-sm font-semibold text-gray-500 leading-relaxed max-w-sm">
            Connecting visionary founders with institutional capital through rigorous data and editorial storytelling.
          </p>
        </div>

        {/* Right footer: Nav columns */}
        <div className="md:col-span-7 grid grid-cols-3 gap-6 font-sans">
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Platform</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-gray-600">
              <Link to="/pitches" className="hover:text-black transition">Explore Pitches</Link>
              <Link to="/" className="hover:text-black transition">For Investors</Link>
              <Link to="/" className="hover:text-black transition">For Founders</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Company</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-gray-600">
              <Link to="/" className="hover:text-black transition">About Us</Link>
              <Link to="/" className="hover:text-black transition">Insights</Link>
              <Link to="/" className="hover:text-black transition">Contact</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Legal</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-gray-600">
              <Link to="/" className="hover:text-black transition">Privacy Policy</Link>
              <Link to="/" className="hover:text-black transition">Terms of Service</Link>
              <p className="text-[10px] font-bold text-gray-400 mt-2 select-none">© 2024 FounderDeck. All rights reserved.</p>
            </div>
          </div>

        </div>
      </footer>

      {/* ==================== QUICK PREVIEW MODAL ==================== */}
      {previewPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xl animate-scale-up text-[#111111]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#F9F9F9] border-b border-black/5 p-5">
              <div>
                <span className="rounded-md bg-[#FF5C00]/10 px-2.5 py-0.5 text-xs font-bold uppercase text-[#FF5C00]">
                  {previewPitch.industry} &bull; {formatStageLabel(previewPitch.funding_stage)}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-2xl font-serif font-black tracking-tight text-[#111111]">{previewPitch.title}</h3>
                  <button
                    type="button"
                    onClick={(event) => handleBookmarkToggle(event, previewPitch.id)}
                    className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-red-500 transition-all cursor-pointer border-none bg-transparent"
                    title={previewPitch.is_bookmarked ? "Remove Bookmark" : "Bookmark Pitch"}
                  >
                    <Heart className={`h-5 w-5 ${previewPitch.is_bookmarked ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPitch(null)}
                className="rounded-full bg-[#F4F4F4] border border-black/5 hover:bg-black/10 p-2 text-gray-500 hover:text-[#111111] transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Area */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Modal tabs selector */}
              <div className="flex border-b border-black/5 pb-2 overflow-x-auto gap-4">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('details')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeModalTab === 'details' ? 'border-[#FF5C00] text-[#FF5C00]' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📝 Pitch Details
                </button>
                
                {previewPitch.video_url && (
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('video')}
                    className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeModalTab === 'video' ? 'border-[#FF5C00] text-[#FF5C00]' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    🎥 Video Pitch
                  </button>
                )}

                {previewPitch.slides && previewPitch.slides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('slides')}
                    className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeModalTab === 'slides' ? 'border-[#FF5C00] text-[#FF5C00]' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    🖼️ Slides Preview
                  </button>
                )}
              </div>

              {/* Tab 1: Details */}
              {activeModalTab === 'details' && (
                <div className="space-y-6">
                  {/* AI Summary Banner */}
                  {previewPitch.one_liner_summary && (
                    <div className="rounded-xl border border-[#FF5C00]/10 bg-[#FF5C00]/5 p-4 flex gap-3 items-start">
                      <Sparkles className="w-5 h-5 text-[#FF5C00] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#FF5C00]">AI One-Liner Summary</h5>
                        <p className="mt-1 text-sm font-bold text-gray-800 leading-relaxed">{previewPitch.one_liner_summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Intent Reactions Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-black/5 p-4 rounded-xl">
                    <div className="text-center p-2 rounded bg-white border border-black/5 shadow-inner">
                      <span className="block text-[10px] font-black text-gray-400 uppercase">Credibility score</span>
                      <span className="text-lg font-serif font-black text-[#FF5C00]">{previewPitch.weighted_score ?? 0}</span>
                    </div>
                    <div className="text-center p-2 rounded bg-white border border-black/5 shadow-inner">
                      <span className="block text-[10px] font-black text-gray-400 uppercase">🤝 Partner</span>
                      <span className="text-lg font-serif font-black text-gray-800">{previewPitch.seeking_cofounder_count ?? 0}</span>
                    </div>
                    <div className="text-center p-2 rounded bg-white border border-black/5 shadow-inner">
                      <span className="block text-[10px] font-black text-gray-400 uppercase">💸 Invest</span>
                      <span className="text-lg font-serif font-black text-gray-800">{previewPitch.looking_to_invest_count ?? 0}</span>
                    </div>
                    <div className="text-center p-2 rounded bg-white border border-black/5 shadow-inner">
                      <span className="block text-[10px] font-black text-gray-400 uppercase">💡 Advise</span>
                      <span className="text-lg font-serif font-black text-gray-800">{previewPitch.need_advisor_count ?? 0}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tagline</h4>
                    <p className="text-sm font-semibold text-gray-700 leading-relaxed bg-[#F9F9F9] border border-black/5 p-4 rounded-xl">
                      {previewPitch.tagline}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Description</h4>
                    <p className="text-xs font-semibold leading-relaxed text-gray-600 whitespace-pre-wrap">
                      {previewPitch.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Video Elevator */}
              {activeModalTab === 'video' && previewPitch.video_url && (
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/5 bg-gray-50">
                    <iframe
                      src={previewPitch.video_url.replace('loom.com/share/', 'loom.com/embed/')}
                      title="Elevator Pitch Video"
                      className="h-full w-full border-none"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Slides Deck preview */}
              {activeModalTab === 'slides' && previewPitch.slides && previewPitch.slides.length > 0 && (
                <div className="space-y-4">
                  <SlideCarousel slides={previewPitch.slides} />
                </div>
              )}

              {/* Modal Comments */}
              <div className="border-t border-black/5 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Comments & Feedback ({previewComments.length})
                </h4>
                
                <form onSubmit={submitQuickComment} className="mb-4 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder={isAuthenticated ? "Write validation feedback or query..." : "Log in to join the conversation"}
                    disabled={!isAuthenticated}
                    className="h-10 flex-1 rounded-xl border border-black/5 bg-[#F4F4F4] px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#FF5C00] transition-shadow disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isCommenting || !newComment.trim() || !isAuthenticated}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#E65300] px-4 text-xs font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
                  >
                    {isCommenting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Post</span>
                  </button>
                </form>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {previewComments.length === 0 ? (
                    <p className="text-xs font-semibold text-gray-400 leading-relaxed italic">No feedback yet. Be the first to share validation thoughts!</p>
                  ) : (
                    previewComments.map((commentItem) => (
                      <div key={commentItem.id} className="rounded-xl border border-black/5 bg-[#F9F9F9] p-3 text-xs leading-relaxed">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">{commentItem.user?.name ?? 'Member'}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {new Date(commentItem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-600">{commentItem.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Reactions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F9F9F9] border-t border-black/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInlineVote(null, previewPitch.id, 'up')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    previewPitch.user_vote === 'up' ? 'bg-[#FF5C00]/15 border-[#FF5C00]/30 text-[#FF5C00]' : 'bg-white border-black/5 text-gray-600 hover:bg-black/5'
                  }`}
                >
                  👍 Up ({previewPitch.upvotes_count ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => handleInlineVote(null, previewPitch.id, 'down')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    previewPitch.user_vote === 'down' ? 'bg-red-500/15 border-red-500/30 text-red-600' : 'bg-white border-black/5 text-gray-600 hover:bg-black/5'
                  }`}
                >
                  👎 Down ({previewPitch.downvotes_count ?? 0})
                </button>
              </div>
              
              <Link
                to={`/pitches/${previewPitch.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FF5C00] hover:bg-[#E65300] px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-[#FF5C00]/15"
              >
                <span>Full Pitch View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SUB-COMPONENT: VERTICAL NEOPITCH CARD ====================
function VerticalPitchCard({ 
  pitch, 
  targetAmt, 
  commitment, 
  daysLeft, 
  formatMockAmount, 
  openQuickView 
}) {
  const cover = getPostImage(pitch);
  
  return (
    <article className="group relative flex flex-col border border-black/5 bg-white/80 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF5C00]/30 transition-all rounded-2xl duration-300">
      <Link to={`/pitches/${pitch.id}`} className="absolute inset-0 z-0" aria-label="View pitch details" />

      {/* Banner Cover with image overlays */}
      <div className="relative h-64 overflow-hidden bg-gray-50 z-10 border-b border-black/5">
        {cover ? (
          <img src={cover} alt={pitch.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-103" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,92,0,0.08),transparent_40%),linear-gradient(135deg,#fbfaf8,#F4F4F4)]">
            <span className="text-4xl font-serif font-black text-[#FF5C00]">{initials(pitch.title)}</span>
          </div>
        )}

        {/* TRENDING NOW Badge overlay */}
        <div className="absolute right-0 top-6 rounded-l-[4px] bg-[#FF5C00] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 select-none z-20 shadow-md shadow-[#FF5C00]/15">
          Trending Now
        </div>

        {/* Dynamic dots indicator overlay */}
        <div className="absolute right-4 bottom-4 flex gap-1 z-25">
          <span className="w-1.5 h-1.5 rounded-full bg-white select-none shadow-sm" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 select-none shadow-sm" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 select-none shadow-sm" />
        </div>
      </div>

      {/* Content Info */}
      <div className="p-6 space-y-4 z-10 pointer-events-none flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Industry label */}
          <span className="inline-block bg-gray-100 text-gray-500 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
            {pitch.industry ? pitch.industry.toUpperCase() : 'TECHNOLOGY'} &bull; {formatStageLabel(pitch.funding_stage).toUpperCase()}
          </span>

          <div className="flex items-start justify-between gap-4">
            {/* Title */}
            <h3 className="font-serif text-3xl font-black text-black leading-tight tracking-tight group-hover:text-[#FF5C00] transition-colors">
              {pitch.title}
            </h3>

            {/* Price seek amount */}
            <div className="text-right leading-none select-none">
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Seeking</span>
              <span className="font-serif text-3xl font-black text-[#FF5C00] block mt-1">
                {formatMockAmount(targetAmt)}
              </span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm font-semibold text-gray-500 leading-relaxed font-sans line-clamp-3">
            {pitch.tagline}
          </p>
        </div>

        {/* Stat Footer block with horizontal dividing line */}
        <div className="pt-5 border-t border-black/5 flex items-center justify-between pointer-events-auto relative mt-4">
          <div className="flex gap-6 text-xs text-gray-500 font-sans select-none">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Commitment</span>
              <span className="block font-black text-black text-sm mt-0.5">{commitment}% Raised</span>
            </div>
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Days Left</span>
              <span className="block font-black text-black text-sm mt-0.5">{daysLeft}d</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => openQuickView(event, pitch, 'details')}
            className="bg-black hover:bg-[#FF5C00] text-white text-xs font-bold py-2.5 px-5 rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
          >
            View Pitch Deck
          </button>
        </div>
      </div>
    </article>
  );
}

function HorizontalPitchCard({
  pitch,
  targetAmt,
  commitment,
  daysLeft,
  formatMockAmount,
  handleBookmarkToggle,
  openQuickView
}) {
  const cover = getPostImage(pitch);
  
  return (
    <article className="group relative flex flex-col md:flex-row border border-black/5 bg-white/80 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF5C00]/30 transition-all rounded-2xl min-h-[220px] duration-300">
      <Link to={`/pitches/${pitch.id}`} className="absolute inset-0 z-0" aria-label="View pitch details" />

      {/* Left side Cover Image */}
      <div className="relative w-full md:w-1/3 h-48 md:h-auto min-h-[180px] bg-gray-50 z-10 border-b md:border-b-0 md:border-r border-black/5 shrink-0">
        {cover ? (
          <img src={cover} alt={pitch.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-103" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,92,0,0.06),transparent_35%),linear-gradient(135deg,#fbfaf8,#F4F4F4)]">
            <span className="text-3xl font-serif font-black text-[#FF5C00]">{initials(pitch.title)}</span>
          </div>
        )}

        {/* Dots indicator overlay */}
        <div className="absolute right-3 bottom-3 flex gap-1 z-25">
          <span className="w-1 h-1 rounded-full bg-white select-none shadow-sm" />
          <span className="w-1 h-1 rounded-full bg-white/60 select-none shadow-sm" />
          <span className="w-1 h-1 rounded-full bg-white/60 select-none shadow-sm" />
        </div>
      </div>

      {/* Right side content */}
      <div className="flex-1 p-6 flex flex-col justify-between pointer-events-none z-10">
        <div className="space-y-2.5">
          
          <div className="flex justify-between items-start gap-4">
            {/* Category tag */}
            <span className="inline-block bg-gray-100 text-gray-500 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
              {pitch.industry ? pitch.industry.toUpperCase() : 'TECHNOLOGY'} &bull; {formatStageLabel(pitch.funding_stage).toUpperCase()}
            </span>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={(event) => handleBookmarkToggle(event, pitch.id)}
              className="pointer-events-auto p-1 text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer border-none bg-transparent z-25"
            >
              <Heart className={`w-4 h-4 ${pitch.is_bookmarked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          <div className="flex justify-between items-start gap-4">
            {/* Title */}
            <h3 className="font-serif text-2xl font-black text-black leading-tight tracking-tight group-hover:text-[#FF5C00] transition-colors">
              {pitch.title}
            </h3>

            {/* Price seek amount */}
            <div className="text-right leading-none select-none">
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Seeking</span>
              <span className="font-serif text-2xl font-black text-[#FF5C00] block mt-0.5">
                {formatMockAmount(targetAmt)}
              </span>
            </div>
          </div>

          {/* Tagline description */}
          <p className="text-xs font-semibold text-gray-500 leading-relaxed font-sans line-clamp-2">
            {pitch.tagline}
          </p>
        </div>

        {/* Stat Footer with divider */}
        <div className="pt-4 border-t border-black/5 flex items-center justify-between pointer-events-auto relative mt-4">
          <div className="flex gap-5 text-xs text-gray-500 font-sans select-none">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Commitment</span>
              <span className="block font-black text-black text-xs mt-0.5">{commitment}% Raised</span>
            </div>
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Days Left</span>
              <span className="block font-black text-black text-xs mt-0.5">{daysLeft}d</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => openQuickView(event, pitch, 'details')}
            className="bg-black hover:bg-[#FF5C00] text-white text-[11px] font-bold py-2 px-4 rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
          >
            View Pitch Deck
          </button>
        </div>

      </div>

    </article>
  );
}

// ==================== SUB-COMPONENT: SLIDES CAROUSEL ====================
function SlideCarousel({ slides = [] }) {
  const [index, setIndex] = useState(0);

  const prev = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const next = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/5 bg-black flex items-center justify-center">
      <img
        src={slides[index]}
        alt={`Slide ${index + 1}`}
        className="max-h-full max-w-full object-contain"
      />
      
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white p-2 text-gray-800 hover:text-black transition-all shadow cursor-pointer border-none"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white p-2 text-gray-800 hover:text-black transition-all shadow cursor-pointer border-none"
            aria-label="Next slide"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === dotIdx ? 'bg-[#FF5C00] w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
