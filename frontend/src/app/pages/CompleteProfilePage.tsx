import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function CompleteProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'artist' | 'provider'>(
    (user?.role as 'artist' | 'provider') || 'artist'
  );
  
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [needs, setNeeds] = useState(user?.needs?.join(', ') || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  
  const [socialLinks, setSocialLinks] = useState({
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
    website: user?.socialLinks?.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        role,
        skills: skills ? skills.split(',').map((s) => s.trim()) : [],
        needs: needs ? needs.split(',').map((n) => n.trim()) : [],
        portfolio,
        socialLinks,
      };

      const updatedUser = await api.put('/users/complete-profile', payload);
      updateUser(updatedUser);
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-white/60">Let's set up your account so you can get the most out of Synkrisis.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-white">I am joining as a...</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('artist')}
                className={`p-4 rounded-xl border transition-all ${
                  role === 'artist'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-xl mb-2">✦</div>
                <div className="font-semibold text-white">Artist</div>
                <div className="text-xs text-white/50 mt-1">I have a project idea and need builders</div>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`p-4 rounded-xl border transition-all ${
                  role === 'provider'
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-xl mb-2">⚙</div>
                <div className="font-semibold text-white">Builder</div>
                <div className="text-xs text-white/50 mt-1">I want to build and manage projects</div>
              </button>
            </div>
          </div>

          {role === 'artist' && (
            <div className="space-y-2">
              <Label htmlFor="needs" className="text-white">What skills do you usually need? (comma separated)</Label>
              <Input
                id="needs"
                placeholder="e.g. Frontend Development, UI/UX Design, Smart Contracts"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          )}

          {role === 'provider' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-white">Your Skills (comma separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g. React, Node.js, Graphic Design"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-white">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </>
          )}

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-medium text-white">Social Links (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-white/60 text-xs">Twitter / X</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="text-white/60 text-xs">GitHub</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-white/60 text-xs">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-white/60 text-xs">Personal Website</Label>
                <Input
                  id="website"
                  placeholder="https://your-website.com"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 mt-6 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Complete Profile & Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
