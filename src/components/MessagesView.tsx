import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Send, User as UserIcon, MessageCircle } from 'lucide-react';

interface MessagesViewProps {
  user: User;
  lang: 'IT' | 'EN';
  onMessagesRead?: () => void;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user?: {
    full_name: string;
    avatar_url: string;
  };
  last_message?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function MessagesView({ user, lang, onMessagesRead }: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const markMessagesAsRead = async (conversationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !conversationId) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('read', false);

    onMessagesRead?.();
  };

  useEffect(() => {
    if (selectedConversation?.id) {
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMsg = payload.new as Message;
        if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();

          // Mark as read immediately if it's from the other user and we are looking at it
          if (newMsg.sender_id !== user.id) {
            await markMessagesAsRead(selectedConversation.id);
          }
        }
        fetchConversations(); // Refresh list to update last message/order
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchConversations = async () => {
    try {
      // Get conversations where user is participant
      const { data: convs, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!user1_id(full_name, avatar_url),
          user2:profiles!user2_id(full_name, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to identify "other user"
      const processedConvs = await Promise.all(convs.map(async (c: any) => {
        const isUser1 = c.user1_id === user.id;
        const otherUser = isUser1 ? c.user2 : c.user1;
        
        // Fetch last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...c,
          other_user: otherUser,
          last_message: lastMsg?.content || 'Inizia la conversazione'
        };
      }));

      setConversations(processedConvs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    console.log('MESSAGES:', data);
    console.log('ERROR:', error);

    if (!error && data) {
      setMessages(data as any);
      scrollToBottom();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const msgContent = newMessage;
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: msgContent
        });

      if (error) throw error;
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Errore invio messaggio');
    }
  };

  const t = {
    IT: {
      title: 'Chat',
      subtitle: 'Le tue conversazioni',
      placeholder: 'Scrivi un messaggio...',
      send: 'Invia',
      noConversations: 'Nessuna conversazione attiva.',
      selectConversation: 'Seleziona una chat per iniziare',
      startBrowsing: 'Cerca nella community'
    },
    EN: {
      title: 'Chat',
      subtitle: 'Your conversations',
      placeholder: 'Type a message...',
      send: 'Send',
      noConversations: 'No active conversations.',
      selectConversation: 'Select a chat to start',
      startBrowsing: 'Browse community'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row border border-gray-100">
        
        {/* Sidebar List */}
        <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t.noConversations}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left ${selectedConversation?.id === conv.id ? 'bg-amber-50' : ''}`}
                  >
                    <div className="relative">
                      {conv.other_user?.avatar_url ? (
                        <img src={conv.other_user.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{conv.other_user?.full_name || 'Utente'}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-gray-500">
                    ←
                  </button>
                  <div className="flex items-center space-x-3">
                    {selectedConversation.other_user?.avatar_url ? (
                      <img src={selectedConversation.other_user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    <span className="font-bold text-gray-900">{selectedConversation.other_user?.full_name}</span>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  const dateString = formatDate(msg.created_at);
                  const prevMsg = messages[index - 1];
                  const prevDateString = prevMsg ? formatDate(prevMsg.created_at) : '';
                  const showDate = dateString !== prevDateString;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                            {dateString}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                          isMe 
                            ? 'bg-amber-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-amber-700 text-white p-3 rounded-xl hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
              <p className="text-lg">{t.selectConversation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
