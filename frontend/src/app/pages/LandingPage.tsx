import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowRight, Sparkles, Users, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.95)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Synkrisis</span>
          </div>
          <nav className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-white/50 hover:text-white transition-colors">How it Works</a>
              <a href="#for-artists" className="text-white/50 hover:text-white transition-colors">For Artists</a>
              <a href="#for-builders" className="text-white/50 hover:text-white transition-colors">For Builders</a>
            </div>
            {isAuthenticated ? (
              <Button className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white border-0 shadow-lg hover:from-emerald-300 hover:to-cyan-400" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            ) : (
              <Button className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white border-0 shadow-lg hover:from-emerald-300 hover:to-cyan-400 rounded-full px-6" onClick={() => navigate('/login')}>Get Started</Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Where Creative Vision Meets Technical Expertise</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-6">
            <span className="text-white">Connect </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Artists</span>
            <span className="text-white"> with</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Builders</span>
          </h1>
          <p className="text-lg text-white/50 mb-12 max-w-2xl mx-auto">
            The marketplace where creative vision meets technical expertise. 
            Artists find the right talent, Builders find meaningful projects.
          </p>

          {/* Two Big Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="w-full sm:w-64 h-16 text-lg bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl"
              onClick={() => navigate('/signup?type=artist')}
            >
              I'm an Artist
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="w-full sm:w-64 h-16 text-lg bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white border-0 shadow-lg shadow-violet-500/20 rounded-xl"
              onClick={() => navigate('/signup?type=builder')}
            >
              I'm a Builder
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="max-w-5xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold mb-2 text-white">Sign Up</h3>
              <p className="text-white/40">
                Artists post projects, Builders showcase their skills and portfolio.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold mb-2 text-white">Connect</h3>
              <p className="text-white/40">
                Browse projects, request consulting, or apply directly to opportunities.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold mb-2 text-white">Collaborate</h3>
              <p className="text-white/40">
                Agree on terms, milestones, and payment. Build something amazing together.
              </p>
            </div>
          </div>
        </div>

        {/* Dual Roles Section */}
        <div id="roles" className="max-w-5xl mx-auto mt-24 mb-16 grid md:grid-cols-2 gap-6">
          {/* For Artists Section */}
          <div className="flex flex-col rounded-2xl border border-emerald-500/20 p-8 bg-gradient-to-b from-emerald-500/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 group-hover:bg-emerald-500/50 transition-colors"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">For Artists</h2>
            </div>
            
            <ul className="space-y-5 flex-1 mb-10">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Post your project needs publicly or request personalized consulting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Find developers, marketers, and other technical specialists</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Set your budget, timeline, and requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Get matched with the right talent through our platform</span>
              </li>
            </ul>

            <Button 
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white border-0 shadow-lg text-base"
              onClick={() => navigate('/signup?type=artist')}
            >
              Join as Artist →
            </Button>
          </div>

          {/* For Builders Section */}
          <div className="flex flex-col rounded-2xl border border-blue-500/20 p-8 bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 group-hover:bg-blue-500/50 transition-colors"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">For Builders</h2>
            </div>
            
            <ul className="space-y-5 flex-1 mb-10">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Showcase your portfolio and skills to the right audience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Browse projects that match your expertise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Apply to projects or get recommended through our matching system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span className="text-white/70 leading-relaxed">Work on meaningful projects with clear milestones and payment terms</span>
              </li>
            </ul>

            <Button 
              className="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg text-base"
              onClick={() => navigate('/signup?type=builder')}
            >
              Join as Builder →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
