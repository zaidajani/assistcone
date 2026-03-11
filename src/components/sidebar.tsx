'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Plug, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5b13ec] to-[#8b5cf6] flex items-center justify-center text-white font-bold">
          A
        </div>
        <span className="font-bold text-xl tracking-tight">Assistcone</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-[#5b13ec]/10 text-[#5b13ec]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-[#5b13ec]" : "text-slate-400")} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <div className="bg-[#5b13ec]/5 rounded-xl p-4 text-center">
          <h4 className="font-semibold text-sm mb-1">PRO PLAN</h4>
          <p className="text-xs text-slate-500 mb-3">2,456 / 5,000 credits used</p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5b13ec] h-full w-[49%]" />
          </div>
          <Button className="w-full mt-4 bg-[#5b13ec] hover:bg-[#4a0fd6] text-white text-xs h-8">
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
