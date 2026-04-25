import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Users, Briefcase, FileText, Activity, Settings, Search } from "lucide-react";
import { SettingsPanel } from "../components/SettingsPanel";
import { Input } from "../components/ui/input";

export function AdminPanelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [consultingRequests, setConsultingRequests] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTab, setUserTab] = useState<'artist' | 'provider'>('artist');

  const filteredDirectoryUsers = users.filter(u => {
    const matchesTab = u.role === userTab;
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, consultingRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/consulting'),
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setConsultingRequests(consultingRes);
    } catch (error: any) {
      toast.error('Failed to load admin data');
    }
  };

  const handleApproveProvider = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/approve`, {});
      toast.success('Provider approved');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleMatchProvider = async (requestId: string, providerId: string) => {
    if (!providerId) return;
    try {
      await api.put(`/admin/consulting/${requestId}/match`, { providerId });
      toast.success('Provider matched successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to match');
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, #2C6062 0%, #252526 100%)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold text-white">Synkrisis <span className="text-emerald-400 text-sm ml-2">Admin Control</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-white/60 hover:text-white transition-colors p-2" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-5 h-5" />
            </button>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => navigate('/dashboard')}>
              Exit Admin View
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-blue-500/20 p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-3 bg-blue-500/15 text-blue-400 rounded-lg"><Users /></div>
              <div>
                <p className="text-sm font-medium text-white/40">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="rounded-xl border border-teal-500/20 p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-3 bg-teal-500/15 text-teal-400 rounded-lg"><Briefcase /></div>
              <div>
                <p className="text-sm font-medium text-white/40">Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-lg"><FileText /></div>
              <div>
                <p className="text-sm font-medium text-white/40">Active Contracts</p>
                <p className="text-2xl font-bold text-white">{stats.activeContracts}</p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/20 p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-3 bg-amber-500/15 text-amber-400 rounded-lg"><Activity /></div>
              <div>
                <p className="text-sm font-medium text-white/40">Pending Consulting</p>
                <p className="text-2xl font-bold text-white">{stats.pendingConsulting}</p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="providers" className="rounded-lg text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">Provider Approvals</TabsTrigger>
            <TabsTrigger value="consulting" className="rounded-lg text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">Consulting Matching</TabsTrigger>
            <TabsTrigger value="directory" className="rounded-lg text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">User Directory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="directory">
            <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">User Directory</h3>
                  <p className="text-white/40 text-sm">Manage and view all registered accounts</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input 
                    placeholder="Search name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10"
                  />
                </div>
              </div>
              
              <div className="border-b border-white/10 flex">
                <button 
                  onClick={() => setUserTab('artist')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${userTab === 'artist' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:text-white/80'}`}
                >
                  Artists <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-xs">{users.filter(u => u.role === 'artist').length}</span>
                </button>
                <button 
                  onClick={() => setUserTab('provider')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${userTab === 'provider' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:text-white/80'}`}
                >
                  Providers <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-xs">{users.filter(u => u.role === 'provider').length}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-white/40 font-medium border-b border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">{userTab === 'artist' ? 'Needs' : 'Skills'}</th>
                      <th className="py-3 px-4">Joined</th>
                      {userTab === 'provider' && <th className="py-3 px-4">Status</th>}
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDirectoryUsers.map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                              {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white/50">{u.email}</td>
                        <td className="py-3 px-4 text-xs text-white/40 max-w-[200px] truncate">
                          {((userTab === 'artist' ? u.needs : u.skills) || []).join(', ') || '—'}
                        </td>
                        <td className="py-3 px-4 text-white/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                        {userTab === 'provider' && (
                          <td className="py-3 px-4">
                            {u.isApproved ? (
                              <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-xs rounded-full font-medium">Approved</span>
                            ) : (
                              <span className="px-2 py-1 bg-amber-500/15 text-amber-400 text-xs rounded-full font-medium">Pending</span>
                            )}
                          </td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}>
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredDirectoryUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-white/40">
                          No users found matching "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Provider Management</h3>
                <p className="text-white/40 text-sm">Review and approve builders before they can apply</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-white/40 font-medium border-b border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Skills</th>
                      <th className="py-3 px-4">Portfolio</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'provider').map(provider => (
                      <tr key={provider._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{provider.name}</td>
                        <td className="py-3 px-4 text-white/50">{provider.email}</td>
                        <td className="py-3 px-4 text-xs text-white/40">{(provider.skills || []).join(', ')}</td>
                        <td className="py-3 px-4">
                          {provider.portfolio && <a href={provider.portfolio} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">View</a>}
                        </td>
                        <td className="py-3 px-4">
                          {provider.isApproved ? (
                            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-xs rounded-full font-medium">Approved</span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-500/15 text-amber-400 text-xs rounded-full font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!provider.isApproved && (
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg" onClick={() => handleApproveProvider(provider._id)}>
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="consulting">
            <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Consulting Requests</h3>
                <p className="text-white/40 text-sm">Match artists with the right providers manually</p>
              </div>
              <div className="p-6 space-y-4">
                {consultingRequests.filter(r => r.status === 'pending').map(request => (
                  <div key={request._id} className="border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-6 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-white">{request.artist?.name}'s Request</h3>
                        {request.scheduledCall && <span className="px-2 py-1 bg-blue-500/15 text-blue-400 text-xs rounded-full font-medium">Call Requested</span>}
                      </div>
                      <p className="text-white/50 text-sm mb-4">{request.projectDescription}</p>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div><span className="text-white/40">Budget:</span> <span className="text-white">₹{request.budgetMin} - ₹{request.budgetMax}</span></div>
                        <div><span className="text-white/40">Timeline:</span> <span className="text-white">{request.timeline}</span></div>
                        <div className="col-span-2">
                          <span className="text-white/40">Needed Skills:</span> <span className="text-white">{(request.preferredSkills || []).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-64 border-t border-white/10 md:border-t-0 md:border-l md:border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 justify-center">
                      <Label className="text-white/60">Match Provider</Label>
                      <select 
                        className="w-full p-2 border border-white/10 rounded-lg text-sm bg-white/5 text-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleMatchProvider(request._id, e.target.value)
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select a provider...</option>
                        {users.filter(u => u.role === 'provider' && u.isApproved).map(p => (
                          <option key={p._id} value={p._id}>{p.name} - {p.skills?.[0]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {consultingRequests.filter(r => r.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
                    No pending consulting requests at the moment.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
