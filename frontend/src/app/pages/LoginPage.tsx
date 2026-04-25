import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Github } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success("Logged in successfully");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;
  };

  return (
    <div className="min-h-screen py-12 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0f1117' }}>
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div 
            className="flex items-center justify-center gap-3 cursor-pointer mb-8"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-[#0f1117] overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Synkrisis</span>
          </div>

          <Card className="w-full border-white/10 shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-white/50">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/70">Password</Label>
                  </div>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 h-11"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-lg h-11 mt-2" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-8 flex items-center justify-center space-x-4">
                <span className="h-px bg-white/10 flex-1"></span>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Or continue with</span>
                <span className="h-px bg-white/10 flex-1"></span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGoogleLogin} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-11">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={handleGithubLogin} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-11">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="mt-8 text-center text-sm">
                <span className="text-white/50">Don't have an account? </span>
                <span 
                  className="text-cyan-400 font-semibold cursor-pointer hover:text-cyan-300 transition-colors"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
