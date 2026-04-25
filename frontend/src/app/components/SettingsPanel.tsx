import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Lock, Bell, Shield, ChevronRight, Save, Eye, EyeOff, Camera } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  
  const [socialLinks, setSocialLinks] = useState({
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
    website: user?.socialLinks?.website || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Settings State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData);
      updateUser({ ...user, avatar: response.avatar });
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedData = await api.put('/users/profile', {
        name,
        bio,
        portfolio: user?.role === 'provider' ? portfolio : undefined,
        socialLinks
      });
      updateUser(updatedData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.put('/users/profile', {
        password: newPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isProvider = user.role === 'provider';
  const accentColor = isProvider ? 'violet' : 'emerald';

  const navItems = [
    { id: 'profile' as const, icon: User, label: 'Profile', desc: 'Your personal info' },
    { id: 'security' as const, icon: Shield, label: 'Security', desc: 'Password & access' },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications', desc: 'Alert preferences' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-white/10" style={{ background: '#0f1117' }}>
        {/* Header with user profile */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative group">
              <Avatar className={`w-14 h-14 ring-2 ring-${accentColor}-500 ring-offset-2 ring-offset-[#0f1117]`}>
                <AvatarImage src={user.avatar ? `http://localhost:5000${user.avatar}` : undefined} />
                <AvatarFallback className="bg-white/10 text-white text-xl font-bold">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <p className="text-white/40 text-sm">{user.email}</p>
            </div>
          </div>
          <SheetTitle className="text-xl font-bold text-white">Settings</SheetTitle>
          <SheetDescription className="text-white/40">
            Manage your account preferences
          </SheetDescription>
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-xl p-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === item.id
                    ? isProvider 
                      ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70 text-sm">Display Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white/70 text-sm">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..."
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 resize-none"
                />
              </div>
              {user.role === 'provider' && (
                <div className="space-y-2">
                  <Label htmlFor="portfolio" className="text-white/70 text-sm">Portfolio URL</Label>
                  <Input 
                    id="portfolio" 
                    type="url"
                    placeholder="https://your-portfolio.com"
                    value={portfolio} 
                    onChange={(e) => setPortfolio(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 h-11"
                  />
                </div>
              )}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-white/80 text-sm font-medium">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-white/60 text-xs">Twitter</Label>
                    <Input id="twitter" value={socialLinks.twitter} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className="text-white/60 text-xs">GitHub</Label>
                    <Input id="github" value={socialLinks.github} onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-white/60 text-xs">LinkedIn</Label>
                    <Input id="linkedin" value={socialLinks.linkedin} onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white/60 text-xs">Website</Label>
                    <Input id="website" value={socialLinks.website} onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })} className="bg-white/5 border-white/10 text-white h-9 text-sm" />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full h-11 text-white border-0 shadow-lg ${
                  isProvider 
                    ? 'bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400' 
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400'
                }`}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <form onSubmit={handlePasswordSave} className="space-y-5">
              <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isProvider ? 'bg-violet-500/20' : 'bg-emerald-500/20'}`}>
                    <Lock className={`w-5 h-5 ${isProvider ? 'text-violet-400' : 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Change Password</h3>
                    <p className="text-white/40 text-xs">Update your account password</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-white/70 text-sm">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 h-11"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-white/70 text-sm">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="new-password" 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 h-11 pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white/70 text-sm">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 h-11"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full h-11 text-white border-0 shadow-lg ${
                  isProvider 
                    ? 'bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400' 
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400'
                }`}
                disabled={isLoading || !newPassword}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isProvider ? 'bg-violet-500/15' : 'bg-emerald-500/15'}`}>
                      <Bell className={`w-4 h-4 ${isProvider ? 'text-violet-400' : 'text-emerald-400'}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Email Notifications</p>
                      <p className="text-white/40 text-xs">Receive emails for account activity</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isProvider ? 'bg-blue-500/15' : 'bg-teal-500/15'}`}>
                      <svg className={`w-4 h-4 ${isProvider ? 'text-blue-400' : 'text-teal-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Project Updates</p>
                      <p className="text-white/40 text-xs">Notifications when project status changes</p>
                    </div>
                  </div>
                  <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isProvider ? 'bg-indigo-500/15' : 'bg-cyan-500/15'}`}>
                      <svg className={`w-4 h-4 ${isProvider ? 'text-indigo-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Message Alerts</p>
                      <p className="text-white/40 text-xs">Get notified for new messages</p>
                    </div>
                  </div>
                  <Switch checked={messageAlerts} onCheckedChange={setMessageAlerts} />
                </div>
              </div>
            </div>
          )}


        </div>
      </SheetContent>
    </Sheet>
  );
}
