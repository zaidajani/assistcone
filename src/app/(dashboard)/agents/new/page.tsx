'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, UploadCloud, Link as LinkIcon, FileText, Bot, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Knowledge' },
  { id: 2, title: 'Model' },
  { id: 3, title: 'Behavior' },
  { id: 4, title: 'Widget' },
];

export default function NewAgentWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [agentId] = useState(() => crypto.randomUUID()); // Link sources and agent
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sources, setSources] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('mini');

  const [tone, setTone] = useState('Friendly');
  const [features, setFeatures] = useState({
    imageSupport: true,
    sourceCitations: true,
    conversationMemory: true,
    humanEscalation: true
  });
  const [escalationSettings, setEscalationSettings] = useState({
    toggleVisibility: true,
    supportEmail: 'support@yourcompany.com',
    buttonText: 'Speak to an agent'
  });

  const [widgetSettings, setWidgetSettings] = useState({
    agentName: 'AI Support Assistant',
    brandColor: '#5b13ec',
    greetingMessage: "Hi! I'm your AI support assistant. Ask me anything."
  });

  const nextStep = () => setCurrentStep((prev: number) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          model: selectedModel,
          tone,
          features,
          escalationSettings,
          widgetSettings,
          sources
        })
      });

      if (!res.ok) throw new Error('Failed to create agent');
      
      router.push(`/agents/${agentId}/playground`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 pb-12">
      {/* Header and Progress */}
      <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5b13ec]/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#5b13ec]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Create AI Agent</h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === step.id 
                  ? 'bg-[#5b13ec] text-white' 
                  : currentStep > step.id 
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </span>
              <span className={currentStep === step.id ? 'text-[#5b13ec] font-bold' : ''}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <Link href="/agents">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar Label */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Step {currentStep}: {STEPS[currentStep - 1].title}
                </h2>
                <p className="text-slate-500">
                  {currentStep === 1 && 'Add the data your agent should learn from. You can connect websites, repositories, or upload documents.'}
                  {currentStep === 2 && 'Choose the foundation for your AI agent. Each model offers different trade-offs.'}
                  {currentStep === 3 && 'Configure how your AI agent interacts and handles advanced requests.'}
                  {currentStep === 4 && 'Personalize colors and details for the website widget.'}
                </p>
              </div>
              <div className="text-sm font-bold text-[#5b13ec]">
                {Math.round((currentStep / 4) * 100)}% Completed
              </div>
            </div>
            {/* Minimal progress line */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-[#5b13ec] to-[#9156fc] transition-all duration-300" style={{ width: `${(currentStep / 4) * 100}%` }} />
            </div>
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 && <Step1Knowledge agentId={agentId} sources={sources} setSources={setSources} />}
            {currentStep === 2 && <Step2Model selectedModel={selectedModel} setSelectedModel={setSelectedModel} />}
            {currentStep === 3 && (
              <Step3Behavior 
                tone={tone} setTone={setTone}
                features={features} setFeatures={setFeatures}
                escalationSettings={escalationSettings} setEscalationSettings={setEscalationSettings}
              />
            )}
            {currentStep === 4 && (
              <Step4Widget widgetSettings={widgetSettings} setWidgetSettings={setWidgetSettings} />
            )}
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
             <Button 
               variant="ghost" 
               className={`font-semibold text-slate-500 hover:text-slate-900 ${currentStep === 1 ? 'invisible' : ''}`}
               onClick={prevStep}
             >
               <ArrowLeft className="w-4 h-4 mr-2" /> Back
             </Button>
             
             {currentStep < 4 ? (
               <Button 
                 className="bg-[#5b13ec] hover:bg-[#5b13ec]/90 text-white font-semibold px-8 h-12 rounded-xl shadow-md shadow-[#5b13ec]/20"
                 onClick={nextStep}
               >
                 Continue Step {currentStep + 1} <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             ) : (
               <Button 
                 disabled={isSubmitting}
                 className="bg-[#5b13ec] hover:bg-[#5b13ec]/90 text-white font-semibold px-8 h-12 rounded-xl shadow-md shadow-[#5b13ec]/20"
                 onClick={handleFinish}
               >
                 {isSubmitting ? 'Deploying...' : 'Finish & Deploy'} <Bot className="w-4 h-4 ml-2" />
               </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- EXTRACTED STEP COMPONENTS -----

function Step1Knowledge({ agentId, sources, setSources }: { agentId: string, sources: any[], setSources: any }) {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState<any>(null);

  // Poll for crawl status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isFetching || (crawlProgress && !crawlProgress.isFinished)) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/crawl/status?agentId=${agentId}`);
          if (res.ok) {
            const data = await res.json();
            setCrawlProgress(data);
            
            // If it's finished, we can stop polling
            if (data.isFinished) {
              setIsFetching(false);
              // Update the sources table with the synced pages
              const syncedSources = data.pages.map((p: any) => ({
                id: p._id,
                url: p.url,
                status: p.status === 'Completed' ? 'Synced' : 'Failed',
                words: p.status === 'Completed' ? '1,000+' : '0'
              }));
              setSources(syncedSources);
            }
          }
        } catch (e) {
          console.error('Status poll error:', e);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFetching, agentId, crawlProgress, setSources]);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setIsFetching(true);
    setCrawlProgress({ pages: [], isFinished: false, totalFound: 0 });
    
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          agentId: agentId,
          maxPages: 50 // Increased for "entire website"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start crawl');
      }

      // We don't manually add to sources anymore, we let the status poll handle it
      setUrl('');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      setIsFetching(false);
    }
  };

  const removeSource = (id: number) => {
    setSources((prev: any[]) => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
         <label className="text-sm font-bold text-slate-700 block mb-2">Connect Website</label>
         <div className="flex gap-3">
           <Input 
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
             placeholder="https://example.com/docs" 
             className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#5b13ec] text-md" 
           />
           <Button 
             onClick={handleFetch}
             disabled={isFetching || !url.trim()}
             className="h-12 px-8 bg-[#5b13ec] hover:bg-[#4a0fd6] text-white rounded-xl font-semibold relative overflow-hidden group"
           >
             <span className="relative z-10 flex items-center gap-2">
                {isFetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : 'Fetch Site'}
             </span>
           </Button>
         </div>
      </div>
      
      {/* Visual Crawl Indicator */}
      {crawlProgress && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-slate-400 font-mono text-sm shadow-xl">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${crawlProgress.isFinished ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
              <span className="text-white font-bold">{crawlProgress.isFinished ? 'Indexing Complete' : 'Deep Crawling Site...'}</span>
            </div>
            <div className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-300">
              {crawlProgress.totalFound} Pages Found
            </div>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar">
            {crawlProgress.pages.map((page: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-1 group">
                <div className="flex items-center gap-2 truncate pr-4">
                  <span className="text-slate-600">[{idx + 1}]</span>
                  <span className="truncate group-hover:text-blue-400 transition-colors">{page.url}</span>
                </div>
                <div className={`text-[10px] font-bold uppercase ${
                  page.status === 'Completed' ? 'text-emerald-500' : 
                  page.status === 'Processing' ? 'text-blue-500 animate-pulse' : 
                  'text-rose-500'
                }`}>
                  {page.status}
                </div>
              </div>
            ))}
            {crawlProgress.pages.length === 0 && !crawlProgress.isFinished && (
              <div className="text-slate-600 animate-pulse">Initializing crawler...</div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Button variant="outline" className="h-14 rounded-xl border-slate-200 text-[#5b13ec] hover:bg-[#5b13ec]/5 font-semibold bg-slate-50 hover:border-[#5b13ec]/30 transition-colors">
          <UploadCloud className="w-5 h-5 mr-2" /> Upload File
        </Button>
        <Button variant="outline" className="h-14 rounded-xl border-slate-200 text-[#5b13ec] hover:bg-[#5b13ec]/5 font-semibold bg-slate-50 hover:border-[#5b13ec]/30 transition-colors">
          <LinkIcon className="w-5 h-5 mr-2" /> GitHub Repo
        </Button>
        <Button variant="outline" className="h-14 rounded-xl border-slate-200 text-[#5b13ec] hover:bg-[#5b13ec]/5 font-semibold bg-slate-50 hover:border-[#5b13ec]/30 transition-colors">
          <FileText className="w-5 h-5 mr-2" /> Raw Text
        </Button>
      </div>

      <div className="pt-6">
        <h4 className="font-bold text-slate-900 mb-4 flex justify-between items-end">
          Indexed Sources
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{sources.length} Sources</span>
        </h4>
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Words</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No sources added yet. Start by fetching a URL above.
                  </td>
                </tr>
              ) : (
                sources.map((source: any) => (
                  <tr key={source.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{source.url}</td>
                    <td className="px-6 py-4">
                      {source.status === 'Synced' ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#5b13ec] bg-[#5b13ec]/10 px-2.5 py-1 rounded-full w-fit text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5b13ec]" /> Syncing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{source.words}</td>
                    <td className="px-6 py-4 text-right">
                      <X 
                        className="w-4 h-4 text-slate-400 ml-auto cursor-pointer hover:text-red-500 transition-colors" 
                        onClick={() => removeSource(source.id)} 
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Step2Model({ selectedModel, setSelectedModel }: { selectedModel: string, setSelectedModel: (model: string) => void }) {
  return (
    <div className="space-y-4">
      <div 
        className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 transition-colors cursor-pointer group ${selectedModel === 'premium' ? 'border-[#5b13ec] shadow-sm shadow-[#5b13ec]/10 bg-[#5b13ec]/[0.02]' : 'border-slate-100 hover:border-slate-300'}`}
        onClick={() => setSelectedModel('premium')}
      >
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 rounded-xl bg-slate-900 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
             {/* Mock gradient overlay for GPT-5 */}
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-500 opacity-60 mix-blend-color" />
             <div className="text-white font-bold text-lg relative z-10">GPT-5</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">GPT-5</h3>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase">Premium</span>
            </div>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">The most advanced model for complex reasoning, intricate creative writing, and deep analysis.</p>
            <div className="flex gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#5b13ec]" /> High Performance</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#5b13ec]" /> $$$ Cost</span>
            </div>
          </div>
          <div className={`pl-4 border-l ${selectedModel === 'premium' ? 'border-[#5b13ec]/20' : 'border-slate-100'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedModel === 'premium' ? 'bg-[#5b13ec] text-white shadow-md shadow-[#5b13ec]/30' : 'border-2 border-slate-200 group-hover:border-[#5b13ec]'}`}>
               {selectedModel === 'premium' && <CheckCircle2 className="w-4 h-4" />}
             </div>
          </div>
        </div>
      </div>

      <div 
        className={`relative overflow-hidden rounded-2xl border-2 p-6 cursor-pointer transition-colors ${selectedModel === 'mini' ? 'border-[#5b13ec] bg-[#5b13ec]/[0.02] shadow-sm shadow-[#5b13ec]/10' : 'border-slate-100 hover:border-slate-300 bg-white group'}`}
        onClick={() => setSelectedModel('mini')}
      >
        <div className="absolute top-0 left-6 bg-[#5b13ec] text-white text-[10px] items-center justify-center font-bold px-3 py-1 rounded-b-lg uppercase tracking-wider flex gap-1 shadow-md">
          Recommended
        </div>
        <div className="flex gap-6 items-center mt-3">
          <div className="w-24 h-24 rounded-xl bg-slate-900 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-purple-600 opacity-80 mix-blend-color" />
             <div className="text-white font-bold text-lg relative z-10">Mini</div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">GPT-5 Mini</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">Optimized for speed and efficiency. Best for high-volume tasks, real-time chat, and simple automation.</p>
            <div className="flex gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#5b13ec]" /> Ultra Fast</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#5b13ec]" /> $ Cost Efficient</span>
            </div>
          </div>
          <div className={`pl-4 border-l ${selectedModel === 'mini' ? 'border-[#5b13ec]/20' : 'border-slate-100'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedModel === 'mini' ? 'bg-[#5b13ec] text-white shadow-md shadow-[#5b13ec]/30' : 'border-2 border-slate-200 group-hover:border-[#5b13ec]'}`}>
               {selectedModel === 'mini' && <CheckCircle2 className="w-4 h-4" />}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Behavior({ 
  tone, setTone, 
  features, setFeatures, 
  escalationSettings, setEscalationSettings 
}: { 
  tone: string, 
  setTone: (val: string) => void,
  features: any,
  setFeatures: (val: any) => void,
  escalationSettings: any,
  setEscalationSettings: (val: any) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#5b13ec]" /> Tone Selection
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { name: 'Friendly', desc: 'Warm, approachable, and conversational.' },
             { name: 'Professional', desc: 'Polished, formal, and objective style.' },
             { name: 'Technical', desc: 'Precise, detailed, and jargon-aware.' },
           ].map(t => (
             <div 
               key={t.name} 
               onClick={() => setTone(t.name)}
               className={`p-4 rounded-xl border-2 ${tone === t.name ? 'border-[#5b13ec] bg-[#5b13ec]/5' : 'border-slate-100 hover:border-slate-300'} cursor-pointer transition-colors relative`}
             >
                {tone === t.name && <CheckCircle2 className="w-5 h-5 text-[#5b13ec] absolute top-4 right-4" />}
                <h5 className="font-bold text-md mb-1">{t.name}</h5>
                <p className="text-xs text-slate-500 leading-relaxed pr-6">{t.desc}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5b13ec]" /> Feature Capabilities
        </h4>
        
        {[
          { id: 'imageSupport', name: 'Enable image support', desc: 'Allow users to upload and process images.' },
          { id: 'sourceCitations', name: 'Enable source citations', desc: 'Cite knowledge base sources in responses.' },
          { id: 'conversationMemory', name: 'Enable conversation memory', desc: 'Remember previous messages in the session.' },
          { id: 'humanEscalation', name: 'Enable human escalation', desc: 'Provide a way to speak with a support agent.' },
        ].map((f) => (
          <div key={f.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
             <div>
               <h5 className="font-semibold text-sm">{f.name}</h5>
               <p className="text-xs text-slate-500">{f.desc}</p>
             </div>
             <Switch 
               checked={features[f.id]} 
               onCheckedChange={(checked) => setFeatures({ ...features, [f.id]: checked })}
               className="data-[state=checked]:bg-[#5b13ec]" 
             />
          </div>
        ))}
      </div>

      {/* Human Escalation Settings Panel */}
      {features.humanEscalation && (
        <div className="bg-[#5b13ec]/5 border border-[#5b13ec]/10 p-6 rounded-2xl relative overflow-hidden flex flex-col transition-all">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5b13ec] uppercase tracking-wider">
              Toggle Button Visibility
              <Switch 
                checked={escalationSettings.toggleVisibility}
                onCheckedChange={(checked) => setEscalationSettings({ ...escalationSettings, toggleVisibility: checked })}
                className="data-[state=checked]:bg-[#5b13ec] ml-1" 
              />
            </div>
          </div>
          <h4 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            Human Escalation Settings
          </h4>
          
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Support Email Address</label>
              <Input 
                value={escalationSettings.supportEmail}
                onChange={(e) => setEscalationSettings({ ...escalationSettings, supportEmail: e.target.value })}
                className="bg-white border-transparent shadow-sm focus-visible:ring-[#5b13ec] h-10" 
              />
              <p className="text-[11px] text-slate-500 mt-1.5">Tickets will be automatically created and sent to this inbox.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">"Talk to Human" Button Text</label>
              <Input 
                value={escalationSettings.buttonText}
                onChange={(e) => setEscalationSettings({ ...escalationSettings, buttonText: e.target.value })}
                className="bg-white border-transparent shadow-sm focus-visible:ring-[#5b13ec] h-10" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure Settings icon is defined for Step3Behavior
import { Settings } from 'lucide-react';

function Step4Widget({
  widgetSettings, setWidgetSettings
}: {
  widgetSettings: any,
  setWidgetSettings: (val: any) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-6">Appearance & Identity</h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Agent Name</label>
              <Input 
                value={widgetSettings.agentName}
                onChange={(e) => setWidgetSettings({ ...widgetSettings, agentName: e.target.value })}
                className="h-12 rounded-xl bg-slate-50 border-slate-200" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Agent Avatar</label>
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border border-slate-200 shadow-sm bg-indigo-50 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-[#5b13ec]" style={{ color: widgetSettings.brandColor }} />
                </Avatar>
                <div className="flex-1">
                  <Button variant="outline" size="sm" className="h-9 px-6 font-semibold hover:bg-slate-50 border-slate-200 rounded-lg" style={{ color: widgetSettings.brandColor }}>Upload Image</Button>
                  <p className="text-[11px] text-slate-500 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-3">Brand Color</label>
              <div className="flex gap-3">
                {['#5b13ec', '#2563eb', '#16a34a', '#e11d48', '#0f172a'].map((c, i) => (
                  <div 
                    key={i} 
                    onClick={() => setWidgetSettings({ ...widgetSettings, brandColor: c })}
                    className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${widgetSettings.brandColor === c ? 'ring-2 ring-offset-2' : ''}`} 
                    style={{ 
                      backgroundColor: c,
                      boxShadow: widgetSettings.brandColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none'
                    }}
                  >
                    {widgetSettings.brandColor === c && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Greeting Message</label>
              <Input 
                value={widgetSettings.greetingMessage}
                onChange={(e) => setWidgetSettings({ ...widgetSettings, greetingMessage: e.target.value })}
                className="h-12 rounded-xl bg-slate-50 border-slate-200" 
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center relative">
           <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Live Preview</div>
           
           {/* Mock Widget UI */}
           <div className="w-[320px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mt-6 relative z-10 transition-colors">
             <div className="p-4 text-white flex items-center justify-between transition-colors" style={{ backgroundColor: widgetSettings.brandColor }}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center pb-0.5">
                   <Bot className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm leading-none">{widgetSettings.agentName}</h4>
                   <span className="text-[10px] text-white/70 flex items-center gap-1 mt-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                   </span>
                 </div>
               </div>
               <X className="w-4 h-4 text-white/80 cursor-pointer" />
             </div>
             
             <div className="h-[280px] p-4 flex flex-col gap-4 bg-slate-50/50">
               <div className="flex gap-2 items-end">
                 <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 pb-0.5" style={{ backgroundColor: `${widgetSettings.brandColor}1a` }}>
                   <Bot className="w-3 h-3" style={{ color: widgetSettings.brandColor }} />
                 </div>
                 <div className="text-white text-sm py-2 px-3 rounded-2xl rounded-bl-sm max-w-[85%] shadow-sm transition-colors" style={{ backgroundColor: widgetSettings.brandColor }}>
                   {widgetSettings.greetingMessage}
                 </div>
               </div>
               <div className="flex justify-end">
                 <div className="bg-slate-100 text-slate-700 text-sm py-2 px-3 rounded-2xl rounded-br-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                   How do I reset my password?
                 </div>
               </div>
               <div className="flex gap-2 items-end">
                 <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1" style={{ backgroundColor: `${widgetSettings.brandColor}1a` }}>
                   <Bot className="w-3 h-3" style={{ color: widgetSettings.brandColor }} />
                 </div>
                 <div className="bg-white text-slate-300 text-xl py-1 mt-1 px-4 rounded-full shadow-sm border border-slate-100">
                   <span className="animate-pulse">...</span>
                 </div>
               </div>
             </div>
             
             <div className="p-3 bg-white border-t border-slate-100 relative">
               <Input placeholder="Type a message..." className="bg-slate-50 border-none rounded-full pr-10 shadow-inner h-10" />
               <div className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: widgetSettings.brandColor }}>
                 <ArrowRight className="w-4 h-4 text-white" />
               </div>
             </div>
           </div>
           
           <p className="text-[10px] text-slate-400 mt-6 max-w-[250px] text-center">Changes are reflected in real-time. This is how your users will see the widget on your site.</p>
        </div>
      </div>
    </div>
  );
}
