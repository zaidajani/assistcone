import { UserButton } from '@clerk/nextjs';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Topbar() {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6 justify-between shrink-0">
      <div className="w-full max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input 
          placeholder="Search for conversations or docs..." 
          className="w-full pl-9 bg-slate-50 border-none rounded-full h-10 focus-visible:ring-[#5b13ec]"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">Alex Rivera</p>
            <p className="text-xs text-slate-500 mt-1">Admin</p>
          </div>
          <UserButton appearance={{
            elements: {
              avatarBox: "w-9 h-9"
            }
          }}/>
        </div>
      </div>
    </header>
  );
}
