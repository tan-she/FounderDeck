import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, Rocket, ShieldCheck, TrendingUp } from 'lucide-react';
import heroImage from '../../assets/hero.png';

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-gray-950 text-white">
      <section className="relative min-h-[calc(100vh-4rem)] border-b border-white/10 pt-20">
        <img
          src={heroImage}
          alt=""
          className="absolute right-[-80px] top-24 hidden h-[520px] w-[520px] object-contain opacity-70 md:block lg:right-16"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030712_0%,rgba(3,7,18,0.94)_46%,rgba(3,7,18,0.66)_100%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              <span className="text-sm font-medium text-cyan-100">Online entrepreneur clubs for serious builders</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
              FounderDeck
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-gray-300">
              A compact LinkedIn, Twitter, and Reddit style platform where founders publish ideas, investors vote, and promising conversations become private collaborations.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-7 py-4 text-lg font-semibold text-gray-950 transition hover:bg-cyan-400">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/pitches" className="inline-flex items-center justify-center rounded-lg border border-white/15 px-7 py-4 text-lg font-semibold text-white transition hover:border-cyan-400/60">
                Explore Pitches
              </Link>
            </div>
          </div>
          <div className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
            <Metric value="Votes" label="Validate ideas with public upvotes and downvotes" />
            <Metric value="Collab" label="Investors can request structured collaboration" />
            <Metric value="Chat" label="Private messages are encrypted before storage" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-white/10 bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for founder momentum</h2>
            <p className="mt-3 text-gray-400">The core loops are simple: publish clearly, earn signals, and move the right people into a real conversation.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Feature icon={Rocket} title="Post investor-ready ideas" text="Founders add a pitch, tech stack, public links, and funding stage without fighting a complex CMS." />
            <Feature icon={TrendingUp} title="Rank by traction" text="Investors can browse, search, vote, comment, and sort pitches by what the community is noticing." />
            <Feature icon={Handshake} title="Request collaboration" text="Interested investors can send collaboration requests and continue through direct encrypted messaging." />
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold">Professional names you can consider</h2>
            <p className="mt-3 text-gray-400">FounderDeck works well, but these are sharper options if you want a more premium brand direction.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['VentureRoom', 'PitchCircuit', 'FoundryLoop', 'BackerBoard', 'SignalFoundry', 'CapTable Club'].map((name) => (
                <div key={name} className="rounded-lg border border-white/10 bg-gray-900 p-4 font-semibold">{name}</div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-6">
            <ShieldCheck className="mb-4 h-8 w-8 text-cyan-300" />
            <h3 className="text-xl font-bold">Deploy-ready split</h3>
            <p className="mt-3 leading-7 text-gray-300">React builds cleanly for Vercel. Laravel exposes the API, auth, SQL migrations, and encrypted messaging for Render.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/80 p-4">
      <p className="text-lg font-bold text-cyan-200">{value}</p>
      <p className="mt-1 text-sm leading-6 text-gray-400">{label}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="rounded-lg border border-white/10 bg-gray-950 p-6">
      <Icon className="mb-5 h-7 w-7 text-cyan-300" />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-gray-400">{text}</p>
    </article>
  );
}
