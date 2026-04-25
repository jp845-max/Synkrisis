import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";

export function PostCreationPage() {
  const navigate = useNavigate();

  const handlePostPublicly = () => {
    navigate('/public-post');
  };

  const handleRequestConsult = () => {
    navigate('/consulting-request');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.8)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold text-white">Synkrisis</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">How would you like to proceed?</h1>
            <p className="text-white/60">Choose the option that best fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Post Publicly Option */}
            <Card className="border-white/10 shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={handlePostPublicly}>
              <CardHeader>
                <div className="w-12 h-12 bg-white/5 group-hover:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white text-xl">Post Publicly to Forum</CardTitle>
                <CardDescription className="text-white/50 mt-2">
                  Share your project requirements with all builders on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-white/70 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Get multiple proposals from interested builders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Compare different approaches and pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Choose the builder that best fits your needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Free to post</span>
                  </li>
                </ul>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0" onClick={handlePostPublicly}>
                  Post Publicly
                </Button>
              </CardContent>
            </Card>

            {/* Request Consulting Option */}
            <Card className="shadow-xl transition-all cursor-pointer border border-cyan-500/30 hover:border-cyan-400/60 group relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={handleRequestConsult}>
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
              
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Request Consulting</CardTitle>
                <CardDescription className="text-white/50 mt-2">
                  Get personalized help from our team to find the perfect match
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 text-sm text-white/70 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    <span>Expert guidance to define your requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    <span>Hand-picked builder recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    <span>Save time with curated matches</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    <span>Schedule a call with our team</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-md" onClick={handleRequestConsult}>
                  Request Consulting
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8 border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-white mb-2">Not sure which option to choose?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Post publicly if you have a clear idea of what you need and want to see multiple options. 
                Request consulting if you need help defining your project or want a curated match based on your specific requirements.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
