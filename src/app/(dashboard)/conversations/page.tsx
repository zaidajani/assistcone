'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, AlertTriangle, CheckCircle2, Clock, User, Bot, Mail, Send, Reply, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const MOCK_CONVERSATIONS = [
  { id: 'c1', user: 'anonymous_user_458', status: 'escalated', agent: 'Customer Support Bot', time: '10 mins ago', preview: 'I need to speak with a human, my account is locked.', messages: [
      { role: 'user', content: 'I cannot access my account.', time: '10:01 AM' },
      { role: 'assistant', content: 'I can help with that. Are you seeing an error message?', time: '10:01 AM' },
      { role: 'user', content: 'Yes it says locked. I need to speak with a human, my account is locked.', time: '10:02 AM' },
      { role: 'system', content: 'User requested human escalation.', time: '10:02 AM' },
    ]
  },
  { id: 'c2', user: 'sarah.j@example.com', status: 'active', agent: 'Sales Assistant', time: '2 hours ago', preview: 'What are the pricing tiers for enterprise?', messages: [
      { role: 'user', content: 'What are the pricing tiers for enterprise?', time: '08:15 AM' },
      { role: 'assistant', content: 'Our enterprise tiers start at $499/mo and include custom SLAs. Would you like to schedule a demo?', time: '08:15 AM' }
    ]
  },
  { id: 'c3', user: 'dev_team_lead', status: 'resolved', agent: 'Technical Docs AI', time: '1 day ago', preview: 'How to configure the webhooks?', messages: [
      { role: 'user', content: 'How to configure the webhooks?', time: 'Yesterday' },
      { role: 'assistant', content: 'You can configure webhooks by navigating to Settings > API and entering your endpoint URL.', time: 'Yesterday' },
      { role: 'user', content: 'Thanks!', time: 'Yesterday' }
    ]
  },
];

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'escalated'>('all');
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
  const [replyText, setReplyText] = useState('');

  const filteredConvos = activeTab === 'all' 
    ? MOCK_CONVERSATIONS 
    : MOCK_CONVERSATIONS.filter(c => c.status === 'escalated');

  const selectedConvo = MOCK_CONVERSATIONS.find(c => c.id === selectedConvoId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-slate-500 text-sm mt-1">Review AI chats and handle human escalations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant={activeTab === 'all' ? 'default' : 'outline'} className={activeTab === 'all' ? 'bg-[#5b13ec] hover:bg-[#4a0fd6]' : ''} onClick={() => setActiveTab('all')}>
            All Chats
          </Button>
          <Button variant={activeTab === 'escalated' ? 'default' : 'outline'} className={activeTab === 'escalated' ? 'bg-orange-500 hover:bg-orange-600' : ''} onClick={() => setActiveTab('escalated')}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Needs Attention
            <span className="ml-2 bg-white text-orange-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">1</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 border border-slate-200 rounded-2xl bg-white shadow-sm flex overflow-hidden min-h-0">
        
        {/* Left List Pane */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 space-y-3 shrink-0 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search messages or users..." className="pl-9 bg-slate-50 border-slate-200" />
            </div>
            <div className="flex gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
               <button className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 whitespace-nowrap">Filter: All Agents</button>
               <button className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 whitespace-nowrap">Filter: Last 7 Days</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredConvos.map(convo => (
              <div 
                key={convo.id} 
                onClick={() => setSelectedConvoId(convo.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                  selectedConvoId === convo.id 
                    ? 'bg-white border-[#5b13ec]/20 shadow-[0_2px_10px_rgba(91,19,236,0.05)]' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar className={`w-6 h-6 ${convo.status === 'escalated' ? 'bg-orange-100 text-orange-600' : 'bg-[#5b13ec]/10 text-[#5b13ec]'}`}>
                      <AvatarFallback className="text-[10px] font-bold">{convo.user.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[120px] truncate" title={convo.user}>{convo.user}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{convo.time}</span>
                </div>
                
                <p className={`text-xs truncate ${selectedConvoId === convo.id ? 'text-slate-700' : 'text-slate-500'}`}>
                  {convo.preview}
                </p>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-semibold text-slate-400">{convo.agent}</span>
                  {convo.status === 'escalated' ? (
                    <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" /> Escalated
                    </span>
                  ) : convo.status === 'resolved' ? (
                    <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat History Pane */}
        {selectedConvo ? (
          <div className="flex-1 flex flex-col bg-slate-50/30">
            {/* Convo Header */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
               <div className="flex items-center gap-3">
                 <h2 className="font-bold">{selectedConvo.user}</h2>
                 <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-semibold">
                   {selectedConvo.agent}
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 {selectedConvo.status === 'escalated' && (
                   <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs font-semibold">
                     <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Resolved
                   </Button>
                 )}
               </div>
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedConvo.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : msg.role === 'system' ? 'mx-auto max-w-full justify-center' : ''}`}>
                  {msg.role !== 'system' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-[#5b13ec] text-white shadow-sm'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  )}
                  
                  {msg.role === 'system' ? (
                     <div className="bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                       <AlertTriangle className="w-3.5 h-3.5" /> {msg.content}
                     </div>
                  ) : (
                    <div>
                      <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-sm' 
                          : 'bg-[#5b13ec] text-white rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`text-[10px] font-semibold text-slate-400 mt-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Admin Reply Area (Only for Escalated) */}
            {selectedConvo.status === 'escalated' && (
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex gap-3">
                  <Mail className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-orange-800 mb-2">Reply to user via Email</p>
                    <div className="relative">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response to the user here..."
                        className="w-full text-sm rounded-lg border-slate-200 bg-white p-3 min-h-[80px] focus:ring-[#5b13ec] outline-none"
                      />
                      <Button className="absolute right-2 bottom-2 h-8 px-4 bg-[#5b13ec] hover:bg-[#4a0fd6] text-xs font-semibold">
                        <Reply className="w-3.5 h-3.5 mr-1.5" /> Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
            <Clock className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium">Select a conversation to view history</p>
          </div>
        )}
      </div>
    </div>
  );
}
