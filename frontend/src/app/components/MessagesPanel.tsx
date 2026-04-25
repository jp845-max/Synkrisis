import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, MessageSquare } from 'lucide-react';

interface MessagesPanelProps {
  contractId: string;
}

export function MessagesPanel({ contractId }: MessagesPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/contracts/${contractId}/messages`);
      setMessages(res);
      // Mark as read after fetching
      if (res.some((m: any) => !m.readBy.includes(user?._id))) {
        await api.put(`/contracts/${contractId}/messages/read`, {});
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [contractId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post(`/contracts/${contractId}/messages`, {
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, res]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isProvider = user?.role === 'provider';
  
  // Base accent colors
  const providerGradient = 'bg-gradient-to-r from-violet-600 to-blue-500';
  const artistGradient = 'bg-gradient-to-r from-emerald-400 to-cyan-500';

  const myGradient = isProvider ? providerGradient : artistGradient;
  const otherGradient = isProvider ? artistGradient : providerGradient;

  return (
    <Card className="flex flex-col h-[600px] shadow-sm mb-6 border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <CardHeader className="border-b border-white/10 py-3 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.95)' }}>
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5 text-white/60" />
          <CardTitle className="text-lg">Project Messages</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-white/40 mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/40 mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user?._id;
            const senderRole = msg.sender?.role || 'artist';
            
            // Check if we need to show a date separator
            const showDate = index === 0 || 
              new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

            // Determine bubble style based on who sent it
            let bubbleClass = '';
            if (isMe) {
              bubbleClass = `${myGradient} text-white rounded-tr-none shadow-lg`;
            } else {
              // The other person's bubble uses their theme gradient, but slightly faded or just their gradient
              bubbleClass = `${otherGradient} opacity-90 text-white rounded-tl-none shadow-md`;
            }

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full border border-white/5">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white/10">
                    <AvatarFallback className={isMe ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'}>
                      {(msg.sender?.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && <span className="text-xs text-white/40 ml-1 mb-1">{msg.sender?.name}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl ${bubbleClass}`}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-white/30 mt-1 mx-1">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-3 border-t border-white/10 backdrop-blur-xl rounded-b-lg" style={{ background: 'rgba(15, 17, 23, 0.95)' }}>
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20 h-11"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim()}
            className={`${myGradient} text-white rounded-full h-11 w-11 flex-shrink-0 border-0 shadow-lg`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
