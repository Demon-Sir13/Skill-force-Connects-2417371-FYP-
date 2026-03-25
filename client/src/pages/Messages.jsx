import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Send, MessageSquare, ArrowLeft, Circle, Lock, Unlock, CreditCard } from 'lucide-react';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers, markRead } = useSocket() || {};

  const [messages, setMessages] = useState([]);
  const [inbox, setInbox]       = useState([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [partner, setPartner]   = useState(null);
  const [msgStatus, setMsgStatus] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch { /* silent */ }
  }, [userId]);

  const fetchInbox = async () => {
    try { const { data } = await api.get('/messages/inbox'); setInbox(data); } catch {}
  };

  const fetchPartner = useCallback(async () => {
    if (!userId) return;
    try { const { data } = await api.get(`/users/${userId}`); setPartner(data); } catch {}
  }, [userId]);

  const fetchMsgStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/messaging-status');
      setMsgStatus(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    api.put(`/messages/${userId}/read`).catch(() => {});
    markRead?.(userId);
  }, [userId, markRead]);

  useEffect(() => {
    fetchInbox();
    fetchPartner();
    fetchMessages();
    fetchMsgStatus();
  }, [userId, fetchMessages, fetchPartner, fetchMsgStatus]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      const senderId = msg.senderId?.toString?.() ?? msg.senderId;
      const receiverId = msg.receiverId?.toString?.() ?? msg.receiverId;
      const myId = user?._id;
      const inConversation =
        (senderId === userId && receiverId === myId) ||
        (senderId === myId && receiverId === userId);
      if (inConversation) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (senderId === userId) {
          api.put(`/messages/${userId}/read`).catch(() => {});
          markRead?.(userId);
        }
      }
      fetchInbox();
    };
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, userId, user?._id, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isLocked = msgStatus && !msgStatus.messagingUnlocked && msgStatus.messageCount >= msgStatus.freeLimit;

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const { data } = await api.post('/payments/unlock-messaging');
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      // Dev mode auto-unlock
      if (data.unlocked) {
        toast.success('Messaging unlocked!');
        fetchMsgStatus();
      }
    } catch {
      toast.error('Failed to unlock messaging');
    } finally {
      setUnlocking(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !userId || isLocked) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      if (socket?.connected) {
        socket.emit('sendMessage', { receiverId: userId, message: content });
      } else {
        await api.post('/messages', { receiverId: userId, message: content });
        fetchMessages();
      }
      fetchMsgStatus();
    } catch {
      toast.error('Failed to send message');
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const conversations = inbox.reduce((acc, msg) => {
    const partnerId = msg.senderId?._id === user?._id ? msg.receiverId?._id : msg.senderId?._id;
    if (!acc.find(c => c.partnerId === partnerId)) {
      acc.push({
        partnerId,
        partnerName: msg.senderId?._id === user?._id ? msg.receiverId?.name : msg.senderId?.name,
        lastMessage: msg.message,
        timestamp: msg.timestamp,
      });
    }
    return acc;
  }, []);

  const isOnline = (uid) => onlineUsers?.has(uid?.toString());
  const remaining = msgStatus ? Math.max(0, msgStatus.freeLimit - msgStatus.messageCount) : null;

  return (
    <div className="page p-0 max-w-7xl mx-auto">
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className={`${userId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 lg:w-80 border-r border-surface-border bg-surface-card shrink-0`}>
          <div className="p-4 border-b border-surface-border">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-blue" />Messages
            </h2>
            {msgStatus && !msgStatus.messagingUnlocked && (
              <p className="text-[10px] text-gray-500 mt-1">
                {remaining > 0 ? `${remaining} free messages left` : 'Free limit reached'}
              </p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No conversations yet.</div>
            ) : (
              conversations.map(c => (
                <Link key={c.partnerId} to={`/messages/${c.partnerId}`}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-surface-border/50 hover:bg-surface-hover transition-colors ${userId === c.partnerId ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''}`}>
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {c.partnerName?.[0]?.toUpperCase() || '?'}
                    </div>
                    {isOnline(c.partnerId) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-surface-card" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.partnerName}</p>
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!userId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-brand-blue" />
              </div>
              <h3 className="font-semibold text-white mb-2">Your Messages</h3>
              <p className="text-gray-500 text-sm max-w-xs">Select a conversation from the sidebar or start a new one from a job or provider page.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-surface-border flex items-center gap-3 bg-surface-card">
                <Link to="/messages" className="md:hidden text-gray-400 hover:text-white mr-1">
                  <ArrowLeft size={18} />
                </Link>
                {partner && (
                  <>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-glow-sm">
                        {partner.name?.[0]?.toUpperCase()}
                      </div>
                      {isOnline(userId) && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-surface-card" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{partner.name}</p>
                      <p className={`text-xs flex items-center gap-1 ${isOnline(userId) ? 'text-green-400' : 'text-gray-500'}`}>
                        <Circle size={6} fill="currentColor" />
                        {isOnline(userId) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">No messages yet. Say hello 👋</div>
                )}
                {messages.map(msg => {
                  const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-brand text-white rounded-br-sm shadow-glow-sm'
                          : 'bg-surface-card border border-surface-border text-gray-200 rounded-bl-sm'
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Message limit banner */}
              {isLocked && (
                <div className="px-5 py-4 border-t border-surface-border bg-surface-card">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                      <Lock size={18} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Free message limit reached</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        You've used all {msgStatus.freeLimit} free messages. Unlock unlimited messaging for ₨{msgStatus.unlockPrice}.
                      </p>
                    </div>
                    <button onClick={handleUnlock} disabled={unlocking}
                      className="btn-primary text-sm shrink-0">
                      {unlocking ? <span className="spinner-sm" /> : <><Unlock size={14} />Unlock ₨{msgStatus.unlockPrice}</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              {!isLocked && (
                <form onSubmit={sendMessage} className="px-5 py-4 border-t border-surface-border bg-surface-card flex gap-3">
                  <input className="input flex-1" placeholder="Type a message..."
                    value={text} onChange={e => setText(e.target.value)} />
                  <button type="submit" disabled={sending || !text.trim()}
                    className="btn-primary px-4 py-2.5 shrink-0">
                    <Send size={16} />
                  </button>
                </form>
              )}

              {/* Free messages remaining indicator */}
              {!isLocked && msgStatus && !msgStatus.messagingUnlocked && remaining !== null && remaining <= 5 && remaining > 0 && (
                <div className="px-5 pb-2 bg-surface-card">
                  <p className="text-[10px] text-yellow-400 text-center">
                    {remaining} free message{remaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
