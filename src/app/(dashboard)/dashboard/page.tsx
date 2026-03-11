import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MessageSquare, CheckCircle2, AlertTriangle, Clock, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MOCK_RECENT_CHATS = [
  { name: 'Sarah Jenkins', message: 'How do I reset my API key?', time: '2m ago', active: true },
  { name: 'Mark Walton', message: 'Escalated to human support', time: '1h ago', active: false },
  { name: 'Elena Rodriguez', message: '"Thank you, that solved it!"', time: '14h ago', active: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#5b13ec] to-[#9156fc] rounded-[24px] p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Build and Deploy Your AI Support Agent</h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl">
            Train your AI on your docs and deploy support automation instantly. Reduce response times by up to 80%.
          </p>
          <Link href="/agents/new">
            <Button className="bg-white text-[#5b13ec] hover:bg-slate-50 font-semibold px-6 py-6 rounded-xl hover:scale-105 transition-transform">
              <PlusCircle className="mr-2 w-5 h-5" />
              Create New Agent
            </Button>
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none">
          {/* Mock abstract bot shape */}
          <div className="w-80 h-80 bg-white rounded-full translate-x-1/3 -translate-y-1/4 blur-3xl mix-blend-overlay" />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Conversations', value: '1,284', trend: '+12.5%', icon: MessageSquare, color: 'text-blue-500', trendColor: 'text-emerald-500' },
          { title: 'AI Resolved Conversations', value: '85%', trend: '+4.3%', icon: CheckCircle2, color: 'text-purple-500', trendColor: 'text-emerald-500' },
          { title: 'Human Escalations', value: '12%', trend: '-2.4%', icon: AlertTriangle, color: 'text-amber-500', trendColor: 'text-emerald-500' },
          { title: 'Average Response Time', value: '1.4s', trend: '-18%', icon: Clock, color: 'text-emerald-500', trendColor: 'text-emerald-500' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-medium text-slate-500">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  {stat.title}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className={`text-xs font-semibold ${stat.trendColor} bg-emerald-50 px-2 py-1 rounded-md`}>
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <Card className="lg:col-span-2 rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-8 py-5">
            <div>
              <CardTitle className="text-lg font-bold">Conversations Over Time</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Historical volume of support requests</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg cursor-pointer">
              Last 7 Days <ChevronDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[300px] flex items-end gap-4 relative">
            {/* Mock Chart representation using Tailwind */}
            <div className="absolute inset-0 p-8 flex items-end gap-x-2">
              {[40, 70, 20, 90, 60, 30, 80].map((h, i) => (
                <div key={i} className="relative flex-1 group">
                   <div 
                     className="w-full bg-gradient-to-t from-[#5b13ec]/20 to-transparent rounded-t-sm" 
                     style={{ height: `${h}%` }}
                   >
                     <div className="absolute top-0 w-full h-0.5 bg-[#5b13ec]" />
                   </div>
                   <div className="text-center mt-3 text-xs text-slate-400 font-medium">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white flex flex-col">
          <CardHeader className="px-8 py-6 pb-2">
            <CardTitle className="text-lg font-bold">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-4 flex flex-col pt-2">
            <div className="flex-1 space-y-1">
              {MOCK_RECENT_CHATS.map((chat, i) => (
                <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${chat.name}`} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.active && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-semibold truncate group-hover:text-[#5b13ec] transition-colors">{chat.name}</h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{chat.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{chat.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/conversations" className="mx-4 mt-2">
               <Button variant="ghost" className="w-full text-[#5b13ec] hover:bg-[#5b13ec]/5 hover:text-[#5b13ec] font-semibold text-sm h-10">
                 View All Conversations
               </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
