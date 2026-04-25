import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, CheckCircle2, DollarSign, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
const getAvatarUrl = (avatar?: string) => avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : undefined;

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Application form state (for providers)
  const [appForm, setAppForm] = useState({
    coverLetter: '',
    proposedBudget: '',
    proposedTimeline: ''
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id, user]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes);

      if (user?.role === 'artist' && projRes.postedBy?._id === user._id) {
        // Fetch applications if the user is the owner
        const appsRes = await api.get(`/projects/${id}/applications`);
        setApplications(appsRes);
      }
    } catch (error: any) {
      toast.error('Failed to load project details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/projects/${id}/apply`, {
        coverLetter: appForm.coverLetter,
        proposedBudget: Number(appForm.proposedBudget) || undefined,
        proposedTimeline: appForm.proposedTimeline || undefined
      });
      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewContract = async () => {
    try {
      const contractRes = await api.get(`/projects/${id}/contract`);
      navigate(`/contract/${contractRes._id}`);
    } catch (error: any) {
      toast.error('Could not find contract for this project');
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const res = await api.put(`/applications/${applicationId}/accept`, {});
      toast.success('Provider accepted! Contract created.');
      if (res.contract) {
        navigate(`/contract/${res.contract}`);
      } else {
        fetchProjectDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept application');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: '#0f1117' }}>Loading project...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: '#0f1117' }}>Project not found</div>;

  const isOwner = user?.role === 'artist' && project.postedBy?._id === user._id;
  const isProvider = user?.role === 'provider';
  
  const accentGradient = isProvider 
    ? 'from-violet-600 to-blue-500' 
    : 'from-emerald-400 to-cyan-500';

  const accentColorClass = isProvider ? 'text-violet-400' : 'text-emerald-400';
  const badgeColorClass = isProvider ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1117' }}>
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
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base text-white/60">{project.description}</CardDescription>
                  </div>
                  {project.assignmentType === 'consulting' && (
                    <Badge variant="secondary" className="ml-4 bg-white/10 text-white/80 hover:bg-white/20 border-0">
                      Assigned via Consulting
                    </Badge>
                  )}
                </div>
                {project.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className={`border-white/20 text-white/70 bg-white/5`}>{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-white/5 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm text-white/40 mb-1">Budget</p>
                    <p className="font-semibold text-lg text-white">₹{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Timeline</p>
                    <p className="font-semibold text-white">{project.timeline || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Status</p>
                    <p className={`font-medium capitalize ${accentColorClass}`}>{project.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none prose-invert">
                  <p className="text-white/70 whitespace-pre-line leading-relaxed">{project.fullDescription || 'No detailed description provided.'}</p>
                </div>
              </CardContent>
            </Card>

            {project.deliverables?.length > 0 && (
              <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">Expected Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {project.deliverables.map((deliverable: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                        <CheckCircle2 className={`w-5 h-5 ${accentColorClass} mt-0.5 flex-shrink-0`} />
                        <span className="text-white/80">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Posted By</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${project.postedBy?._id}`)}>
                  <Avatar className="w-12 h-12 ring-2 ring-white/10 ring-offset-2 ring-offset-[#0f1117] group-hover:ring-white/30 transition-all">
                    <AvatarImage src={getAvatarUrl(project.postedBy?.avatar)} />
                    <AvatarFallback className="bg-white/10 text-white font-bold text-lg">
                      {(project.postedBy?.name || 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{project.postedBy?.name}</p>
                    <p className="text-sm text-white/40">Posted on {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {user?.role === 'provider' && project.status === 'open' && (
              <Card className="sticky top-4 border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-blue-500" />
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">Apply for this Project</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Cover Letter</label>
                      <Textarea 
                        required 
                        rows={5} 
                        placeholder="Why are you a good fit?"
                        value={appForm.coverLetter}
                        onChange={e => setAppForm({...appForm, coverLetter: e.target.value})}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Proposed Budget (₹)</label>
                      <Input 
                        type="number" 
                        placeholder={project.budget ? project.budget.toString() : ""}
                        value={appForm.proposedBudget}
                        onChange={e => setAppForm({...appForm, proposedBudget: e.target.value})}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Proposed Timeline</label>
                      <Input 
                        placeholder="e.g. 3 Weeks"
                        value={appForm.proposedTimeline}
                        onChange={e => setAppForm({...appForm, proposedTimeline: e.target.value})}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white border-0 shadow-lg h-12"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {isOwner && project.status === 'open' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-white">Received Applications ({applications.length})</h3>
                {applications.length === 0 ? (
                  <Card className="border-white/10 bg-white/5"><CardContent className="p-6 text-center text-white/40">No applications yet.</CardContent></Card>
                ) : (
                  applications.map(app => (
                    <Card key={app._id} className="border-emerald-500/20 shadow-lg hover:border-emerald-500/40 transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/profile/${app.provider?._id}`)}>
                          <Avatar className="w-10 h-10 ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
                            <AvatarImage src={getAvatarUrl(app.provider?.avatar)} />
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold">
                              {(app.provider?.name || 'P')[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{app.provider?.name}</p>
                            <a href={app.provider?.portfolio || '#'} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline">Portfolio</a>
                          </div>
                        </div>
                        <div className="text-sm text-white/70 bg-white/5 border border-white/5 p-3 rounded-lg line-clamp-3">
                          {app.coverLetter}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {app.proposedBudget && <div className="flex items-center text-white/60"><DollarSign className="w-3 h-3 mr-1 text-white/40"/>₹{app.proposedBudget}</div>}
                          {app.proposedTimeline && <div className="flex items-center text-white/60"><Calendar className="w-3 h-3 mr-1 text-white/40"/>{app.proposedTimeline}</div>}
                        </div>
                        <Button size="sm" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-md" onClick={() => handleAcceptApplication(app._id)}>Accept & Contract</Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {!['open', 'draft'].includes(project.status) && (isOwner || project.assignedTo?._id === user?._id) && (
              <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">Project Contract</CardTitle>
                  <CardDescription className="text-white/50">This project is currently {project.status.replace('_', ' ')}.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button className={`w-full bg-gradient-to-r ${accentGradient} text-white border-0 shadow-lg`} onClick={handleViewContract}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Contract
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-md text-white">Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Budget:</span>
                  <span className="font-medium text-white">₹{project.budget}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Timeline:</span>
                  <span className="font-medium text-white">{project.timeline || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-white/50">Deliverables:</span>
                  <span className="font-medium text-white">{project.deliverables?.length || 0} items</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
