import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, Rocket, ShieldCheck, TrendingUp } from 'lucide-react';
import retroComputer from '../../assets/retro-computer.png';

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#EAEAEA] text-[#111111] font-sans">
      
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] border-b border-black/5 pt-20">
        
        {/* Giant Watermark title behind the hero PC image */}
        <div className="absolute right-24 top-24 hidden md:block opacity-[0.03] select-none pointer-events-none text-right">
          <h1 className="text-[10vw] font-black tracking-tighter leading-none">
            <span className="font-pixel">FOUNDER</span><br />
            <span className="font-display">DECK</span>
          </h1>
        </div>

        {/* Floating PC render */}
        <img
          src={retroComputer}
          alt=""
          className="absolute right-[-80px] top-24 hidden h-[520px] w-[520px] object-contain md:block lg:right-16 drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl relative z-10">
            
            {/* Soft accent top pill */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5C00] animate-pulse" />
              <span className="text-sm font-display font-bold text-[#FF5C00]">Online entrepreneur clubs for serious builders</span>
            </div>
            
            <h1 className="text-5xl font-display font-black tracking-tight text-[#111111] sm:text-7xl">
              FounderDeck
            </h1>
            
            <p className="mt-6 max-w-2xl text-xl leading-9 text-gray-600 font-medium">
              A compact LinkedIn, Twitter, and Reddit style platform where founders publish ideas, investors vote, and promising conversations become private collaborations.
            </p>
            
            {/* Capsule style button groups */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5C00] hover:bg-[#E65300] px-7 py-4 text-lg font-bold text-white transition-all shadow-lg shadow-[#FF5C00]/25 hover:scale-[1.02]">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/pitches" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/40 backdrop-blur-sm px-7 py-4 text-lg font-bold text-gray-800 transition hover:bg-white/70">
                Explore Pitches
              </Link>
            </div>
          </div>

          {/* Metric cards list */}
          <div className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-3 relative z-10">
            <Metric value="Votes" label="Validate ideas with public upvotes and downvotes" />
            <Metric value="Collab" label="Investors can request structured collaboration" />
            <Metric value="Chat" label="Private messages are encrypted before storage" />
          </div>
        </div>
      </section>

      {/* Built for momentum Section */}
      <section id="how-it-works" className="border-b border-black/5 bg-[#F4F4F4] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-display font-black text-[#111111] sm:text-4xl">Built for founder momentum</h2>
            <p className="mt-3 text-gray-500 font-medium">The core loops are simple: publish clearly, earn signals, and move the right people into a real conversation.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Feature icon={Rocket} title="Post investor-ready ideas" text="Founders add a pitch, tech stack, public links, and funding stage without fighting a complex CMS." />
            <Feature icon={TrendingUp} title="Rank by traction" text="Investors can browse, search, vote, comment, and sort pitches by what the community is noticing." />
            <Feature icon={Handshake} title="Request collaboration" text="Interested investors can send collaboration requests and continue through direct encrypted messaging." />
          </div>
        </div>
      </section>

      {/* Security Deploy Section (Original Content + Premium Card layout, without names section) */}
      <section className="bg-[#EAEAEA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl border border-black/5 bg-white p-8 sm:p-12 shadow-xl shadow-black/[0.02] flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-[fade-in_0.3s_ease-out]">
            <div className="inline-flex items-center justify-center rounded-2xl bg-[#FF5C00]/10 text-[#FF5C00] p-4 flex-shrink-0">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-extrabold text-[#111111]">Deploy-ready split</h3>
              <p className="mt-3 text-base leading-relaxed text-gray-500 font-semibold">
                React builds cleanly for Vercel. Laravel exposes the API, auth, SQL migrations, and encrypted messaging for Render.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all">
      <p className="text-lg font-display font-black text-[#FF5C00]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-500">{label}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-[#FF5C00]/10 text-[#FF5C00] p-3 transition-colors group-hover:bg-[#FF5C00] group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-display font-extrabold text-[#111111]">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-500">{text}</p>
    </article>
  );
}
