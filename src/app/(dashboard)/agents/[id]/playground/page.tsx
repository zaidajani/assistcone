'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, ArrowRight, Settings2, Info, ArrowLeft, RefreshCw, Send } from 'lucide-react';

export default function AgentPlayground({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const agentId = unwrappedParams.id;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [agent, setAgent] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data.agent);
          setMessages([{ 
            role: 'assistant', 
            content: data.agent.widgetSettings?.greetingMessage || "Hi! I'm your AI Support Assistant. How can I help you?", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
        }
      } catch(e) { console.error(e) }
    }
    fetchAgent();
  }, [agentId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newUserMsg = { role: 'user', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newUserMsg.content,
          agentId: agentId,
          conversationId,
          visitorId: 'test_playground_user'
        })
      });

      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || "Sorry, I couldn't generate a response.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch(err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error communicating with the agent.', time: new Date().toLocaleTimeString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              Customer Support Bot
              <span className="text-[10px] bg-[#5b13ec]/10 text-[#5b13ec] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Playground</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Test your agent's responses before deploying.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => {
             setConversationId(null);
             setMessages([{ role: 'assistant', content: agent?.widgetSettings?.greetingMessage || "Hi!", time: new Date().toLocaleTimeString() }]);
           }}>
             <RefreshCw className="w-4 h-4 mr-2" /> Reset Chat
           </Button>
           <Link href="/agents/new">
             <Button variant="outline" className="border-slate-200 text-[#5b13ec] hover:text-[#5b13ec] hover:bg-[#5b13ec]/5 border-[#5b13ec]/20">
               <Settings2 className="w-4 h-4 mr-2" /> Edit Agent
             </Button>
           </Link>
        </div>
      </div>

      <div className="flex-1 border border-slate-200 rounded-2xl bg-white shadow-sm flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center text-xs font-semibold text-slate-400 bg-slate-100 py-1 px-3 rounded-full w-fit mx-auto mb-8">
              Today
            </div>
            
            {messages.map((msg: any, i: number) => (
              <div key={i} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-[#5b13ec] text-white shadow-md shadow-[#5b13ec]/20'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
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
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative max-w-4xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isLoading}
                placeholder={isLoading ? "Typing..." : "Message your agent..."} 
                className="w-full h-14 bg-slate-50 border-slate-200 rounded-2xl pl-6 pr-14 text-[15px] focus-visible:ring-[#5b13ec]/50 shadow-inner"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl bg-[#5b13ec] hover:bg-[#4a0fd6] shadow-md disabled:bg-slate-200 disabled:shadow-none transition-all"
              >
                <Send className="w-4 h-4 text-white ml-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-80 bg-white border-l border-slate-100 p-6 overflow-y-auto hidden lg:block">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#5b13ec]" /> Agent Details
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model</span>
                  <span className="font-semibold text-slate-900">{agent?.model === 'premium' ? 'GPT-5 Premium' : 'GPT-5 Mini'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tone</span>
                  <span className="font-semibold text-slate-900">{agent?.tone || 'Friendly'}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge Base</p>
              <div className={`p-3 rounded-xl border flex items-center gap-3 text-sm ${agent?.sources?.length ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                 <div className={`w-2 h-2 rounded-full animate-pulse ${agent?.sources?.length ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                 <span className="font-semibold">{agent?.sources?.length || 0} Sources Sent</span>
              </div>
              {agent?.sources?.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-slate-600 border-l-2 border-slate-100 pl-3">
                   {agent.sources.map((src: any, i: number) => (
                     <li key={i} className="truncate" title={src.url}>{src.url}</li>
                   ))}
                </ul>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-100">
               <h4 className="font-semibold text-sm mb-2 text-slate-900">Deployment</h4>
               <p className="text-xs text-slate-500 mb-4 leading-relaxed">Agent is ready. Copy the code below to add the widget to your website.</p>
               <div className="bg-slate-900 p-3 rounded-xl relative group">
                  <pre className="text-[10px] text-emerald-400 whitespace-pre-wrap font-mono">
                    {`<script src="https://cdn.assistcone.com/widget.js" data-agent-id="${agentId}"></script>`}
                  </pre>
                  <Button variant="secondary" size="sm" className="absolute top-2 right-2 h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Copy</Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
