import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Github } from "lucide-react";

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'artist';
  const [userType, setUserType] = useState(type);
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Artist form state
  const [artistData, setArtistData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    needs: [] as string[]
  });

  // Provider form state
  const [providerData, setProviderData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    portfolio: '',
    skills: [] as string[]
  });

  const needsOptions = ['Development', 'Marketing', 'Design', 'Content Writing', 'SEO', 'Social Media'];
  const skillsOptions = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing', 'SEO', 'Content Creation', 'Branding', 'Data Analysis'];

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (artistData.password !== artistData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: artistData.name,
        email: artistData.email,
        password: artistData.password,
        role: 'artist',
        needs: artistData.needs,
      });
      toast.success("Account created successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (providerData.password !== providerData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: providerData.name,
        email: providerData.email,
        password: providerData.password,
        role: 'provider',
        portfolio: providerData.portfolio,
        skills: providerData.skills,
      });
      toast.success("Account created! Pending approval.");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNeed = (need: string) => {
    setArtistData(prev => ({
      ...prev,
      needs: prev.needs.includes(need) 
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need]
    }));
  };

  const toggleSkill = (skill: string) => {
    setProviderData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0f1117' }}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl relative z-10" style={{ background: 'rgba(15, 17, 23, 0.8)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-white/10 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Synkrisis</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login')} className="text-white/70 hover:text-white hover:bg-white/10">
            Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Join Synkrisis</h1>
            <p className="text-white/50 text-lg">Sign up to get started</p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" onClick={handleGoogleLogin} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleGithubLogin} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
          
          <div className="flex items-center justify-center mb-8">
            <span className="h-px bg-white/10 w-24"></span>
            <span className="px-4 text-xs font-medium text-white/40 uppercase tracking-wider">or sign up with email</span>
            <span className="h-px bg-white/10 w-24"></span>
          </div>

          {/* User Type Switcher */}
          <div className="flex justify-center gap-3 mb-10 bg-white/5 p-1.5 rounded-xl max-w-sm mx-auto border border-white/10">
            <Button 
              variant="ghost"
              className={`flex-1 rounded-lg transition-all ${userType === 'artist' ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              onClick={() => setUserType('artist')}
            >
              Artist Sign-Up
            </Button>
            <Button 
              variant="ghost"
              className={`flex-1 rounded-lg transition-all ${userType === 'builder' ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              onClick={() => setUserType('builder')}
            >
              Provider Sign-Up
            </Button>
          </div>

          {/* Artist Sign-Up Form */}
          {userType === 'artist' && (
            <Card className="max-w-2xl mx-auto border-emerald-500/20 shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-2xl text-white">Artist Sign-Up</CardTitle>
                <CardDescription className="text-white/50">Create your account to post projects and find builders</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleArtistSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="artist-name" className="text-white/70">Name</Label>
                      <Input 
                        id="artist-name"
                        type="text"
                        placeholder="Your full name"
                        value={artistData.name}
                        onChange={(e) => setArtistData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist-email" className="text-white/70">Email</Label>
                      <Input 
                        id="artist-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={artistData.email}
                        onChange={(e) => setArtistData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist-password" className="text-white/70">Password</Label>
                      <Input 
                        id="artist-password"
                        type="password"
                        value={artistData.password}
                        onChange={(e) => setArtistData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist-confirm" className="text-white/70">Confirm Password</Label>
                      <Input 
                        id="artist-confirm"
                        type="password"
                        value={artistData.confirmPassword}
                        onChange={(e) => setArtistData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Label className="mb-4 block text-white/70">What do you need help with?</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {needsOptions.map(need => (
                        <div key={need} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`need-${need}`}
                            checked={artistData.needs.includes(need)}
                            onCheckedChange={() => toggleNeed(need)}
                            className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <label 
                            htmlFor={`need-${need}`}
                            className="text-sm cursor-pointer text-white/80"
                          >
                            {need}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-lg h-12 mt-6 text-lg" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Artist Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Provider Sign-Up Form */}
          {userType === 'builder' && (
            <Card className="max-w-2xl mx-auto border-violet-500/20 shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-2xl text-white">Provider Sign-Up</CardTitle>
                <CardDescription className="text-white/50">Create your account to showcase your skills. Note: Accounts must be approved by admin before applying to projects.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleProviderSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="provider-name" className="text-white/70">Name</Label>
                      <Input 
                        id="provider-name"
                        type="text"
                        placeholder="Your full name"
                        value={providerData.name}
                        onChange={(e) => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider-email" className="text-white/70">Email</Label>
                      <Input 
                        id="provider-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={providerData.email}
                        onChange={(e) => setProviderData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider-password" className="text-white/70">Password</Label>
                      <Input 
                        id="provider-password"
                        type="password"
                        value={providerData.password}
                        onChange={(e) => setProviderData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider-confirm" className="text-white/70">Confirm Password</Label>
                      <Input 
                        id="provider-confirm"
                        type="password"
                        value={providerData.confirmPassword}
                        onChange={(e) => setProviderData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="text-white/70">Portfolio / GitHub URL</Label>
                    <Input 
                      id="portfolio"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={providerData.portfolio}
                      onChange={(e) => setProviderData(prev => ({ ...prev, portfolio: e.target.value }))}
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 h-11"
                    />
                  </div>
                  <div className="pt-2">
                    <Label className="mb-4 block text-white/70">Your Skills</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {skillsOptions.map(skill => (
                        <div key={skill} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`skill-${skill}`}
                            checked={providerData.skills.includes(skill)}
                            onCheckedChange={() => toggleSkill(skill)}
                            className="border-white/20 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                          />
                          <label 
                            htmlFor={`skill-${skill}`}
                            className="text-sm cursor-pointer text-white/80"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white border-0 shadow-lg h-12 mt-6 text-lg" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Provider Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mt-10 text-center text-sm">
            <span className="text-white/50">Already have an account? </span>
            <span 
              className="text-cyan-400 font-semibold cursor-pointer hover:text-cyan-300 transition-colors"
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
