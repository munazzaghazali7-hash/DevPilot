import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ListTodo, 
  Network, 
  FileCode, 
  Bug, 
  GitPullRequest,
  GitMerge,
  CircleDot,
  X
} from 'lucide-react';
import { ROUTES } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
      ? 'bg-brand-600 text-white' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 md:h-screen md:sticky md:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-brand-500">Dev</span>
              <span>Pilot</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">AI-Powered Dev Assistant</p>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem to={ROUTES.DASHBOARD} icon={LayoutDashboard} label="Dashboard" active={location.pathname === ROUTES.DASHBOARD} onClick={onClose} />
          <NavItem to={ROUTES.ANALYZER} icon={Search} label="Repo Analyzer" active={location.pathname === ROUTES.ANALYZER} onClick={onClose} />
          <NavItem to={ROUTES.TASKS} icon={ListTodo} label="Tasks" active={location.pathname === ROUTES.TASKS} onClick={onClose} />
          <NavItem to={ROUTES.ARCHITECTURE} icon={Network} label="Architecture" active={location.pathname === ROUTES.ARCHITECTURE} onClick={onClose} />
          <NavItem to={ROUTES.CODE} icon={FileCode} label="Code Explorer" active={location.pathname === ROUTES.CODE} onClick={onClose} />
          <NavItem to={ROUTES.BUGS} icon={Bug} label="Bug Scan" active={location.pathname === ROUTES.BUGS} onClick={onClose} />
          <NavItem to={ROUTES.ISSUES} icon={CircleDot} label="Issues" active={location.pathname === ROUTES.ISSUES} onClick={onClose} />
          <NavItem to={ROUTES.PR} icon={GitPullRequest} label="PR Generator" active={location.pathname === ROUTES.PR} onClick={onClose} />
          <NavItem to={ROUTES.MERGE_DOCTOR} icon={GitMerge} label="AutoPacify" active={location.pathname === ROUTES.MERGE_DOCTOR} onClick={onClose} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">
             Powered by Gemini 2.5
          </div>
        </div>
      </div>
    </>
  );
};