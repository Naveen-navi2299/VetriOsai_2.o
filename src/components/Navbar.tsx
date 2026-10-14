import React from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  Volume2,
  Trees,
  BarChart3,
  Calendar,
  Mail,
  Database,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  hasWorkspaceToken: boolean;
  onReturnToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onSignIn,
  onSignOut,
  isSigningIn,
  hasWorkspaceToken,
  onReturnToLanding,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ling6', label: 'Ling-6 Calibration', icon: Volume2 },
    { id: 'forest', label: 'Listening Forest', icon: Trees },
    { id: 'analytics', label: 'Analytics & Streaks', icon: BarChart3 },
    { id: 'schedule', label: 'Class Schedules', icon: Calendar },
    { id: 'reports', label: 'Automated Reports', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-800">
                  Vetri<span className="text-emerald-600">Osai</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Pediatric Care
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Auditory & Speech Therapy System</p>
            </div>
          </div>

          {/* Integration Status Badges */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 font-medium">
            <span className="text-slate-400 font-semibold mr-1">Cloud Sync:</span>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firestore</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-teal-700 font-semibold">
              <Cloud className="w-3.5 h-3.5 text-teal-600" />
              <span>Drive</span>
              {hasWorkspaceToken && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-blue-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Calendar</span>
              {hasWorkspaceToken && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-rose-700 font-semibold">
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              <span>Gmail</span>
              {hasWorkspaceToken && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-amber-700 font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Sheets</span>
              {hasWorkspaceToken && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
          </div>

          {/* User Sign-In Action Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-emerald-50/80 pl-2 pr-3 py-1.5 rounded-full border border-emerald-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-emerald-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.displayName || 'Parent / Therapist'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isSigningIn}
                className="gsi-material-button shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold">
                    {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          <div className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="ml-3 px-3.5 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
              title="View Landing Page"
            >
              <span>← Landing Page</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
