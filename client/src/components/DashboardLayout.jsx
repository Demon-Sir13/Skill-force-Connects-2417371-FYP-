import { useState } from 'react';
import { Menu } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-11 border-b border-surface-border/40 bg-surface-bg shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="btn-icon" aria-label="Open sidebar">
            <Menu size={16} />
          </button>
          <span className="text-sm font-medium text-gray-600">Menu</span>
        </div>

        <main className="flex-1 overflow-y-auto bg-surface-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
