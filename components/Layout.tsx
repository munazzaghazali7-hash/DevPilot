import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-30 px-4 flex items-center justify-between border-b border-slate-800 shadow-md">
         <div className="flex items-center space-x-2">
           <span className="text-xl font-bold text-brand-500">Dev</span>
           <span className="text-xl font-bold text-white">Pilot</span>
         </div>
         <button 
           onClick={() => setIsSidebarOpen(true)}
           className="text-white p-2 rounded hover:bg-slate-800"
         >
           <Menu size={24} />
         </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};