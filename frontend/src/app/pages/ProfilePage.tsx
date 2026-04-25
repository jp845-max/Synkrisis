import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ExternalLink, Twitter, Github, Linkedin, Globe, MapPin, Calendar, Star, Briefcase, ChevronLeft, Settings } from "lucide-react";
import { SettingsPanel } from "../components/SettingsPanel";
import { toast } from "sonner";

const getAvatarUrl = (avatar?: string) => avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : undefined;

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  // We refetch the profile whenever id changes or settings panel closes (in case of updates)
  useEffect(() => {
    if (!isSettingsOpen) {
      fetchProfile();
    }
  }, [id, isSettingsOpen]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/users/${id}`);
      setProfileUser(data);
    } catch (error) {
      toast.error("Failed to load profile");
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1117' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!profileUser) return null;

  const isProvider = profileUser.role === 'provider';
  const accent = isProvider 
    ? { gradient: 'from-violet-600 to-blue-500', text: 'text-violet-400', bg: 'bg-violet-500/10' } 
    : { gradient: 'from-emerald-400 to-cyan-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0f1117' }}>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Header Banner */}
      <div className={`h-48 w-full bg-gradient-to-r ${accent.gradient} opacity-20`}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl -mt-24 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <Avatar className="w-32 h-32 ring-4 ring-[#0f1117] bg-white/5 text-4xl">
              <AvatarImage src={getAvatarUrl(profileUser.avatar)} />
              <AvatarFallback className="bg-white/10 text-white">{profileUser.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{profileUser.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accent.bg} ${accent.text}`}>
                      {isProvider ? 'Builder' : 'Artist'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {isOwnProfile ? (
                  <Button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    className={`bg-gradient-to-r ${accent.gradient} text-white border-0 shadow-lg`}
                    onClick={() => {
                      // Navigate to messages with this user
                      navigate(`/dashboard`);
                      // In a real app, open specific chat
                    }}
                  >
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {profileUser.bio || "This user hasn't written a bio yet."}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{isProvider ? 'Skills' : 'Needs'}</h2>
                <div className="flex flex-wrap gap-2">
                  {((isProvider ? profileUser.skills : profileUser.needs) || []).map((skill: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm">
                      {skill}
                    </span>
                  ))}
                  {((isProvider ? profileUser.skills : profileUser.needs) || []).length === 0 && (
                    <span className="text-white/40 italic">No specific {isProvider ? 'skills' : 'needs'} listed.</span>
                  )}
                </div>
              </section>

              {isProvider && profileUser.reviews?.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {profileUser.reviews.map((review: any) => (
                      <div key={review._id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/profile/${review.artist?._id}`)}>
                            <Avatar className="w-10 h-10 ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
                              <AvatarImage src={getAvatarUrl(review.artist?.avatar)} />
                              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                                {(review.artist?.name || 'A')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white group-hover:text-emerald-400 transition-colors">{review.artist?.name}</p>
                              <p className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              {/* Platform Stats for Providers */}
              {isProvider && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Platform Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Completed</span>
                      <span className="text-white font-medium">{profileUser.completedProjects || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Rating</span>
                      <span className="text-white font-medium">{profileUser.rating > 0 ? `${profileUser.rating.toFixed(1)} / 5.0` : 'No ratings yet'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">Links & Socials</h3>
                <div className="space-y-3">
                  {isProvider && profileUser.portfolio && (
                    <a href={profileUser.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">Portfolio</span>
                    </a>
                  )}

                  {profileUser.socialLinks?.website && (
                    <a href={profileUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">Website</span>
                    </a>
                  )}
                  {profileUser.socialLinks?.twitter && (
                    <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-[#1DA1F2] transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#1DA1F2]/20 transition-colors">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">Twitter</span>
                    </a>
                  )}
                  {profileUser.socialLinks?.github && (
                    <a href={profileUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Github className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">GitHub</span>
                    </a>
                  )}
                  {profileUser.socialLinks?.linkedin && (
                    <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-[#0A66C2] transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#0A66C2]/20 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">LinkedIn</span>
                    </a>
                  )}

                  {!profileUser.portfolio && !profileUser.socialLinks?.website && !profileUser.socialLinks?.twitter && !profileUser.socialLinks?.github && !profileUser.socialLinks?.linkedin && (
                    <span className="text-white/40 italic text-sm">No links provided.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
