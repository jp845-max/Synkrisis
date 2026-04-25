import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Search, Plus, LogOut, Bell, Settings, LayoutGrid, FolderKanban, MessageSquare, Briefcase, Star, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { SettingsPanel } from "../components/SettingsPanel";
import { DashboardMessagesPanel } from "../components/DashboardMessagesPanel";
const getAvatarUrl = (avatar?: string) => avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : undefined;

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myConsulting, setMyConsulting] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, myProjectsRes, myConsultingRes, unreadRes] = await Promise.all([
        api.get('/projects'), // fetches open public projects
        api.get('/projects/my'),
        api.get('/consulting/my'),
        api.get('/messages/unread-count').catch(() => ({ unreadCount: 0 })),
      ]);
      setProjects(projectsRes);
      setMyProjects(myProjectsRes);
      setMyConsulting(myConsultingRes);
      setUnreadCount(unreadRes.unreadCount || 0);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkill = !selectedSkill || (project.skills && project.skills.includes(selectedSkill));
    return matchesSearch && matchesSkill;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allSkills = Array.from(new Set(projects.flatMap(p => p.skills || [])));

  if (!user) return null; // handled by ProtectedRoute

  const isProvider = user.role === 'provider';

  // Role-specific accent configuration
  const accent = isProvider 
    ? {
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #5094BA 100%)',
        gradientClass: 'from-violet-600 to-blue-500',
        border: 'border-violet-500/30',
        borderHover: 'hover:border-violet-400/50',
        text: 'text-violet-400',
        textLight: 'text-violet-300',
        bg: 'bg-violet-500/10',
        badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        btnGradient: 'bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400',
        tabActive: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-blue-500 data-[state=active]:text-white',
        avatarBorder: 'ring-violet-500',
        label: 'Builder',
      }
    : {
        gradient: 'linear-gradient(135deg, #94E4D1 0%, #5094BA 100%)',
        gradientClass: 'from-emerald-400 to-cyan-500',
        border: 'border-emerald-500/30',
        borderHover: 'hover:border-emerald-400/50',
        text: 'text-emerald-400',
        textLight: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        btnGradient: 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400',
        tabActive: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white',
        avatarBorder: 'ring-emerald-500',
        label: 'Artist',
      };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.95)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Synkrisis</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate(`/profile/${user._id}`)}>
              <Avatar className={`w-8 h-8 ring-2 ${accent.avatarBorder}`}>
                <AvatarImage src={getAvatarUrl(user.avatar)} />
                <AvatarFallback className="bg-white/10 text-white text-sm font-bold">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${accent.badgeBg}`}>{isProvider ? 'Provider' : accent.label}</span>
            </div>
            
            <div className="relative cursor-pointer group" onClick={() => navigate('/dashboard')}>
              <Bell className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {user.role === 'admin' && (
              <Button variant="outline" size="sm" className="bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white" onClick={() => navigate('/admin')}>
                Admin Panel
              </Button>
            )}
            <button className="text-white/50 hover:text-white transition-colors" onClick={() => setIsSettingsOpen(true)} title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex-1">
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className={`rounded-xl border ${accent.border} overflow-hidden`} style={{ background: 'rgba(255,255,255,0.03)' }}>
              {/* Gradient Banner */}
              <div className={`h-20 bg-gradient-to-r ${accent.gradientClass} opacity-80`} />
              <div className="px-4 pb-4 -mt-8">
                <Avatar className={`w-16 h-16 ring-4 ${accent.avatarBorder} ring-offset-2 ring-offset-[#0f1117]`}>
                  <AvatarFallback className="bg-[#1a1d28] text-white text-xl font-bold">
                    {user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-white mt-3">{user.name}</h3>
                <p className="text-white/40 text-sm">{user.email}</p>
                <Badge className={`mt-2 ${accent.badgeBg} border text-xs`}>
                  {isProvider ? '⚙ Builder' : '✦ Artist'}
                </Badge>

                {user.role === 'artist' && user.needs && user.needs.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {user.needs.map((need: string) => (
                        <Badge key={need} variant="outline" className="text-xs text-white/60 border-white/10">{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {user.role === 'provider' && user.skills && user.skills.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {user.skills.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs text-white/60 border-white/10">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {user.role === 'provider' && user.portfolio && (
                  <a 
                    href={user.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-sm ${accent.text} hover:underline mt-2 block truncate`}
                  >
                    View Portfolio →
                  </a>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {user.role === 'artist' && (
              <div className={`rounded-xl border ${accent.border} p-4`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                <h4 className="font-semibold text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    className={`w-full ${accent.btnGradient} text-white border-0 shadow-lg`}
                    onClick={() => navigate('/post-creation')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                  <Button 
                    variant="outline"
                    className={`w-full border-white/10 text-white/80 hover:bg-white/5 hover:text-white ${accent.btnGradient}`}
                    onClick={() => navigate('/consulting-request')}
                  >
                    Request Consulting
                  </Button>
                </div>
              </div>
            )}

            {/* Your Stats */}
            <div className={`rounded-xl border ${accent.border} p-4`} style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="font-semibold text-white mb-3">Your Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Active Projects</span>
                  <span className={`font-semibold ${accent.text}`}>{myProjects.length}</span>
                </div>
                {user.role === 'provider' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-sm">Rating</span>
                      <span className={`font-semibold ${accent.text}`}>{user.rating > 0 ? `${user.rating.toFixed(1)} ★` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-sm">Completed</span>
                      <span className={`font-semibold ${accent.text}`}>{user.completedProjects || 0}</span>
                    </div>
                  </>
                )}
                {user.role === 'artist' && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Completed</span>
                    <span className={`font-semibold ${accent.text}`}>{user.completedProjects || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className={`grid w-full mb-6 bg-white/5 border border-white/10 rounded-xl p-1 h-auto ${isProvider ? 'grid-cols-3' : 'grid-cols-4'}`}>
                <TabsTrigger value="browse" className={`rounded-lg text-white/60 ${accent.tabActive} data-[state=active]:shadow-lg transition-all py-2.5 flex items-center gap-2`}>
                  <LayoutGrid className="w-4 h-4" />
                  Browse
                </TabsTrigger>
                <TabsTrigger value="my-projects" className={`rounded-lg text-white/60 ${accent.tabActive} data-[state=active]:shadow-lg transition-all py-2.5 flex items-center gap-2`}>
                  <FolderKanban className="w-4 h-4" />
                  My Projects
                </TabsTrigger>
                {!isProvider && (
                  <TabsTrigger value="consulting" className={`rounded-lg text-white/60 ${accent.tabActive} data-[state=active]:shadow-lg transition-all py-2.5 flex items-center gap-2`}>
                    <MessageSquare className="w-4 h-4" />
                    Consulting
                  </TabsTrigger>
                )}
                <TabsTrigger value="messages" className={`rounded-lg text-white/60 ${accent.tabActive} data-[state=active]:shadow-lg transition-all py-2.5 flex items-center gap-2`}>
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                <div className={`rounded-xl border ${accent.border} p-6`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">Browse Projects</h2>
                    <p className="text-white/40 text-sm">Find open projects that match your skills</p>
                  </div>

                  {/* Search */}
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input 
                        placeholder="Search open projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
                      />
                    </div>
                    
                    {allSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-white/60">Filter by skill:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant={selectedSkill === null ? 'default' : 'outline'}
                            className={`cursor-pointer ${selectedSkill === null ? accent.btnGradient + ' text-white border-0' : 'text-white/50 border-white/10 hover:text-white hover:border-white/20'}`}
                            onClick={() => setSelectedSkill(null)}
                          >
                            All
                          </Badge>
                          {allSkills.map(skill => (
                            <Badge 
                              key={skill}
                              variant={selectedSkill === skill ? 'default' : 'outline'}
                              className={`cursor-pointer ${selectedSkill === skill ? accent.btnGradient + ' text-white border-0' : 'text-white/50 border-white/10 hover:text-white hover:border-white/20'}`}
                              onClick={() => setSelectedSkill(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Cards */}
                  {isLoading ? (
                    <div className="text-center py-8 text-white/40">Loading projects...</div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-8 text-white/40">No projects found.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProjects.map(project => (
                        <div key={project._id} className={`rounded-xl border ${accent.border} ${accent.borderHover} p-5 transition-all hover:bg-white/[0.02]`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                              <p className="text-white/40 text-sm line-clamp-2">{project.description}</p>
                            </div>
                            <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${accent.badgeBg}`}>
                              ₹{project.budget}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {project.skills?.map((skill: string) => (
                                <Badge key={skill} variant="outline" className="text-white/50 border-white/10">{skill}</Badge>
                              ))}
                            </div>
                            <Button 
                              className={`${accent.btnGradient} text-white border-0 shadow-lg`}
                              onClick={() => navigate(`/project/${project._id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-sm text-white/30">
                            <span>Posted by {project.postedBy?.name || 'Unknown'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${accent.bg} ${accent.text}`}>Status: {project.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="my-projects">
                <div className={`rounded-xl border ${accent.border} p-6`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">My Projects</h2>
                    <p className="text-white/40 text-sm">
                      {user.role === 'artist' ? 'Projects you have posted' : 'Projects you have applied to'}
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8 text-white/40">Loading...</div>
                  ) : myProjects.length === 0 ? (
                    <div className="text-center py-16 text-white/40">
                      <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p>No projects yet</p>
                      {user.role === 'artist' && (
                        <Button 
                          className={`mt-4 ${accent.btnGradient} text-white border-0 shadow-lg`}
                          onClick={() => navigate('/post-creation')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Project
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProjects.map(project => (
                        <div key={project._id} className={`rounded-xl border ${accent.border} ${accent.borderHover} p-5 flex items-center justify-between transition-all hover:bg-white/[0.02]`}>
                          <div>
                            <h3 className="font-semibold text-lg text-white">{project.title}</h3>
                            <p className="text-sm text-white/40">Status: <span className={`capitalize font-medium ${accent.text}`}>{project.status}</span></p>
                          </div>
                          <Button onClick={() => navigate(`/project/${project._id}`)} variant="ghost" className="border border-white/20 text-white hover:bg-white/10">View</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {!isProvider && (
                <TabsContent value="consulting">
                <div className={`rounded-xl border ${accent.border} p-6`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">Consulting Requests</h2>
                    <p className="text-white/40 text-sm">
                      {user.role === 'artist' 
                        ? 'Your consulting requests' 
                        : 'Projects where you have been recommended'}
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8 text-white/40">Loading...</div>
                  ) : myConsulting.length === 0 ? (
                    <div className="text-center py-16">
                      {user.role === 'artist' ? (
                        <div>
                          <p className="text-white/40 mb-4">
                            Need help finding the right builder? Request a consultation with our team.
                          </p>
                          <Button className={`${accent.btnGradient} text-white border-0 shadow-lg`} onClick={() => navigate('/consulting-request')}>
                            Request Consulting
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white/40">No consulting requests yet</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myConsulting.map(req => (
                        <div key={req._id} className={`rounded-xl border ${accent.border} ${accent.borderHover} p-5 transition-all hover:bg-white/[0.02]`}>
                          <h3 className="font-semibold mb-2 text-white">Request on {new Date(req.createdAt).toLocaleDateString()}</h3>
                          <p className="text-sm text-white/40 mb-4">{req.projectDescription}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize text-white/50 border-white/10">{req.status}</Badge>
                            {req.resultingProject && (
                              <Button size="sm" className={`${accent.btnGradient} text-white border-0`} onClick={() => navigate(`/project/${req.resultingProject}`)}>View Project</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              )}

              <TabsContent value="messages">
                <DashboardMessagesPanel />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
