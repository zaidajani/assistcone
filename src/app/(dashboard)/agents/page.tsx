import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Bot, Activity, CheckCircle2, Search } from 'lucide-react';

const MOCK_AGENTS = [
  { id: '1', name: 'Customer Support Bot', model: 'GPT-5 Mini', priority: 'High Priority', conversations: '1,240', resolution: '94%', status: 'Online', iconBg: 'bg-blue-500' },
  { id: '2', name: 'Sales Assistant', model: 'GPT-5', priority: 'Lead Gen', conversations: '850', resolution: '82%', status: 'Online', iconBg: 'bg-rose-500' },
  { id: '3', name: 'Technical Docs AI', model: 'GPT-5', priority: 'Internal', conversations: '430', resolution: '89%', status: 'Offline', iconBg: 'bg-amber-500' },
  { id: '4', name: 'Research Associate', model: 'GPT-5 Mini', priority: 'Analytics', conversations: '215', resolution: '97%', status: 'Online', iconBg: 'bg-emerald-500' },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor your AI workforce performance.</p>
        </div>
        <Link href="/agents/new">
          <Button className="bg-[#5b13ec] hover:bg-[#4a0fd6] text-white">
            <PlusCircle className="mr-2 w-4 h-4" />
            Create New Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_AGENTS.map((agent) => (
          <Card key={agent.id} className="rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white hover:shadow-md transition-shadow relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center ${agent.iconBg} shadow-sm`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {agent.status}
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1 group-hover:text-[#5b13ec] transition-colors">{agent.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
                <span>{agent.model}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{agent.priority}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-50 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">Conversations</p>
                  <p className="text-xl font-bold">{agent.conversations}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">Resolution</p>
                  <p className="text-xl font-bold text-[#5b13ec]">{agent.resolution}</p>
                </div>
              </div>

              <Link href={`/agents/${agent.id}/playground`} className="block">
                <Button variant="outline" className="w-full justify-center text-[#5b13ec] border-[#5b13ec]/20 hover:bg-[#5b13ec]/5 rounded-xl h-10 font-semibold">
                  <Activity className="w-4 h-4 mr-2" />
                  Test in Playground
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty State / Add New Card */}
        <Link href="/agents/new" className="block h-full min-h-[300px]">
          <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-[#5b13ec] group cursor-pointer p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#5b13ec]/10 flex items-center justify-center mb-4 transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 group-hover:text-[#5b13ec] mb-1">Create Agent</h3>
            <p className="text-sm">Train a new AI assistant on your documentation.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
