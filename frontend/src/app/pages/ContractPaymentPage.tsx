import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Check, FileText, IndianRupee, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { loadRazorpayScript } from "../hooks/useRazorpay";

const getAvatarUrl = (avatar?: string) => avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : undefined;
export function ContractPaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/contracts/${id}`);
      setContract(res);
    } catch (error: any) {
      toast.error('Failed to load contract');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (user?.role === 'artist') {
      await handleRazorpayPayment();
    } else {
      try {
        await api.put(`/contracts/${id}/accept`, {});
        toast.success('Contract Accepted!');
        fetchContract();
      } catch (error: any) {
        toast.error(error.message || 'Failed to accept contract');
      }
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      setIsLoading(true);
      // Create order
      const orderData = await api.post('/payments/create-order', { contractId: id });
      
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Synkrisis',
        description: `Payment for Contract ${contract.project?.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              contractId: id
            });
            // Also call the original accept logic if needed, but verify endpoint sets it active
            await api.put(`/contracts/${id}/accept`, {});
            toast.success('Payment Successful & Contract Activated!');
            fetchContract();
          } catch (err: any) {
            toast.error(err.message || 'Payment Verification Failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#10b981'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      toast.error(error.message || 'Error initiating payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/contracts/${id}/complete`, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Contract marked as completed!');
      setShowReviewModal(false);
      fetchContract();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete contract');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: '#0f1117' }}>Loading contract...</div>;
  if (!contract) return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: '#0f1117' }}>Contract not found</div>;

  const totalStipend = contract.totalAmount || contract.milestones?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0;
  const platformFeePercentage = contract.platformFeePercentage || 0;
  const platformFeeAmount = contract.platformFeeAmount || 0;
  const providerPayout = contract.providerPayout || totalStipend;

  const isProvider = user?.role === 'provider';
  const accentGradient = isProvider 
    ? 'from-violet-600 to-blue-500' 
    : 'from-emerald-400 to-cyan-500';

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
          <Button variant="ghost" onClick={() => navigate(`/project/${contract.project?._id}`)} className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Contract & Payment</h1>
            <p className="text-white/50">Review and accept the project terms</p>
          </div>

          {/* Contract Overview */}
          <Card className="mb-6 border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl">Project: {contract.project?.title}</CardTitle>
                  <CardDescription className="text-white/50 mt-1">Contract Agreement</CardDescription>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${accentGradient} opacity-90`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${contract.artist?._id}`)}>
                  <Avatar className="w-12 h-12 ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[#0f1117] group-hover:ring-emerald-500/60 transition-all">
                    <AvatarImage src={getAvatarUrl(contract.artist?.avatar)} />
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold">
                      {(contract.artist?.name || 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Artist</p>
                    <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{contract.artist?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${contract.provider?._id}`)}>
                  <Avatar className="w-12 h-12 ring-2 ring-violet-500/30 ring-offset-2 ring-offset-[#0f1117] group-hover:ring-violet-500/60 transition-all">
                    <AvatarImage src={getAvatarUrl(contract.provider?.avatar)} />
                    <AvatarFallback className="bg-violet-500/20 text-violet-400 font-bold">
                      {(contract.provider?.name || 'P')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Provider</p>
                    <p className="font-semibold text-white group-hover:text-violet-400 transition-colors">{contract.provider?.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms */}
          {contract.milestones && contract.milestones.length > 0 && (
            <Card className="mb-6 border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Contract Terms</CardTitle>
                <CardDescription className="text-white/50">Project milestones and deliverables</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {contract.milestones.map((milestone: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-start justify-between p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.07] transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-r ${accentGradient}`}>
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-lg text-white">{milestone.title}</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-2 ml-11">{milestone.description}</p>
                        {milestone.duration && <p className="text-sm text-white/40 ml-11">Duration: {milestone.duration}</p>}
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-lg font-bold text-white">
                          <IndianRupee className="w-5 h-5 text-white/50" />
                          {milestone.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Breakdown */}
          <Card className="mb-6 border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-white/70">
                  <span>Project Budget</span>
                  <span className="font-semibold text-white">₹{totalStipend.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between text-white/70 text-sm border-l-2 border-white/20 pl-3 py-1 my-2 bg-white/5 rounded-r">
                  <span>Platform Commission ({platformFeePercentage}%)</span>
                  <span className="font-semibold text-white">- ₹{platformFeeAmount.toLocaleString('en-IN')}</span>
                </div>
                
                <Separator className="bg-white/10 my-4" />
                
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>PROVIDER RECEIVES</span>
                  <span className={`flex items-center gap-1 bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent`}>
                    <IndianRupee className={`w-6 h-6 ${isProvider ? 'text-violet-400' : 'text-emerald-400'}`} />
                    {providerPayout.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance Status */}
          <Card className="mb-8 border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">Acceptance Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${contract.artist?._id}`)}>
                    <Avatar className="w-10 h-10 group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all">
                      <AvatarImage src={getAvatarUrl(contract.artist?.avatar)} />
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold">
                        {(contract.artist?.name || 'A')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{contract.artist?.name} <span className="text-white/40 font-normal text-sm ml-1">(Artist)</span></p>
                      <p className="text-sm text-white/50">
                        {contract.artistAccepted ? (contract.paymentStatus === 'paid' ? 'Payment Escrowed & Accepted' : 'Accepted') : 'Pending payment & acceptance'}
                      </p>
                    </div>
                  </div>
                  {contract.artistAccepted && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full text-sm">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Accepted</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${contract.provider?._id}`)}>
                    <Avatar className="w-10 h-10 group-hover:ring-2 group-hover:ring-violet-500/50 transition-all">
                      <AvatarImage src={getAvatarUrl(contract.provider?.avatar)} />
                      <AvatarFallback className="bg-violet-500/20 text-violet-400 font-bold">
                        {(contract.provider?.name || 'P')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{contract.provider?.name} <span className="text-white/40 font-normal text-sm ml-1">(Provider)</span></p>
                      <p className="text-sm text-white/50">
                        {contract.providerAccepted ? 'Contract accepted' : 'Pending acceptance'}
                      </p>
                    </div>
                  </div>
                  {contract.providerAccepted && (
                    <div className="flex items-center gap-2 text-violet-400 bg-violet-400/10 px-3 py-1.5 rounded-full text-sm">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Accepted</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4">
            {user?.role === 'artist' && !contract.artistAccepted && (
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 shadow-lg h-14 text-lg"
                onClick={handleAccept}
              >
                <Check className="w-6 h-6 mr-2" />
                Pay ₹{totalStipend.toLocaleString('en-IN')} & Activate Contract
              </Button>
            )}
            
            {user?.role === 'provider' && !contract.providerAccepted && (
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white border-0 shadow-lg h-14 text-lg"
                onClick={handleAccept}
              >
                <Check className="w-6 h-6 mr-2" />
                Accept Contract Terms
              </Button>
            )}

            {contract.artistAccepted && contract.providerAccepted && contract.status === 'active' && (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center font-medium shadow-inner">
                  Contract is active! Both parties can proceed with the project.
                </div>
                {user?.role === 'artist' && (
                  <Button 
                    size="lg" 
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Mark Project as Completed
                  </Button>
                )}
              </div>
            )}

            {contract.status === 'completed' && (
              <div className="p-5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-center font-medium">
                This project and contract have been successfully completed! ✨
              </div>
            )}
          </div>

          {/* Messages Panel Link */}
          {contract.artistAccepted && contract.providerAccepted && (
            <div className="mt-10 text-center">
              <p className="text-white/50 mb-4">You can now message the other party regarding this project.</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                Go to Messages Dashboard
              </Button>
            </div>
          )}

        </div>
      </main>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-[#0f1117] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Leave a Review</DialogTitle>
            <DialogDescription className="text-white/50">
              Rate your experience with {contract?.provider?.name}. Your review will be public.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
                  onClick={() => setReviewRating(star)}
                />
              ))}
            </div>
            <Textarea
              placeholder="How was it working with them?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px] resize-none focus-visible:ring-emerald-500/50"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)} className="text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={!reviewComment.trim() || isLoading} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-lg">
              Submit & Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
