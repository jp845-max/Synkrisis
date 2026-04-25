import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MessagesPanel } from "./MessagesPanel";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";

export function DashboardMessagesPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isProvider = user?.role === 'provider';

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/contracts/my");
      const activeContracts = res.filter((c: any) => c.artistAccepted && c.providerAccepted);
      setContracts(activeContracts);
      if (activeContracts.length > 0 && !selectedContractId) {
        setSelectedContractId(activeContracts[0]._id);
      }
    } catch (error) {
      console.error("Failed to load contracts for messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const accent = isProvider
    ? { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', activeBg: 'border-violet-500' }
    : { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', activeBg: 'border-emerald-500' };

  if (isLoading) {
    return <div className="p-8 text-center text-white/40">Loading messages...</div>;
  }

  if (contracts.length === 0) {
    return (
      <div className={`rounded-xl border ${accent.border} p-12 text-center flex flex-col items-center`} style={{ background: 'rgba(255,255,255,0.03)' }}>
        <MessageSquare className="w-12 h-12 text-white/10 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Active Conversations</h3>
        <p className="text-white/40">You can start messaging once a contract is mutually accepted.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <div className={`md:col-span-1 rounded-xl border ${accent.border} overflow-y-auto`} style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="p-4 border-b border-white/10 font-semibold text-white sticky top-0 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.95)' }}>
          Active Conversations
        </div>
        <div className="divide-y divide-white/5">
          {contracts.map(contract => {
            const otherParty = user?.role === 'artist' ? contract.provider : contract.artist;
            const isSelected = selectedContractId === contract._id;
            return (
              <div 
                key={contract._id}
                onClick={() => setSelectedContractId(contract._id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected ? `${accent.bg} border-l-4 ${accent.activeBg}` : 'hover:bg-white/[0.02] border-l-4 border-transparent'
                }`}
              >
                <Avatar 
                  className="w-10 h-10 cursor-pointer"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (otherParty?._id) navigate(`/profile/${otherParty._id}`); 
                  }}
                >
                  <AvatarImage src={otherParty?.avatar ? (otherParty.avatar.startsWith('http') ? otherParty.avatar : `http://localhost:5000${otherParty.avatar}`) : undefined} />
                  <AvatarFallback className="bg-white/10 text-white text-sm">
                    {(otherParty?.name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{contract.project?.title}</p>
                  <p className="text-xs text-white/40 truncate">with {otherParty?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Panel */}
      <div className="md:col-span-2 h-full">
        {selectedContractId ? (
          <MessagesPanel key={selectedContractId} contractId={selectedContractId} />
        ) : (
          <div className={`h-full rounded-xl border ${accent.border} flex items-center justify-center text-white/40`} style={{ background: 'rgba(255,255,255,0.03)' }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
