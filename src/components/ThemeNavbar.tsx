import React from 'react';
import { User } from 'firebase/auth';

export type NavTab = 'home' | 'progress' | 'rewards' | 'settings' | 'about' | 'contact';

interface ThemeNavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  studentName: string;
  streakDays: number;
  starsCount?: number;
  points?: number;
  onReturnToLanding: () => void;
  onOpenPointCalculator?: () => void;
  isFirebaseActive?: boolean;
}

export const ThemeNavbar: React.FC<ThemeNavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
  studentName,
  streakDays,
  points = 25,
  onReturnToLanding,
  onOpenPointCalculator,
}) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'progress', label: 'Progress' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'settings', label: 'Settings' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ] as const;

  const getInitials = () => {
    if (!user) return 'GT';
    if (user.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return 'GT';
  };

  const displayNameFormatted = studentName
    ? studentName.toLowerCase().includes('child')
      ? studentName
      : `${studentName}'s child`
    : "Naveen's child";

  return (
    <header
      className="bg-white rounded-[26px] px-6 py-3.5 flex flex-wrap md:flex-nowrap items-center justify-between shadow-sm relative z-20 gap-3"
      data-purpose="site-navigation"
    >
      {/* Left side: Brand and Nav Links */}
      <div className="flex items-center gap-5 lg:gap-7">
        <button
          onClick={() => setActiveTab('home')}
          className="text-2xl font-black tracking-tight text-slate-800 flex items-center hover:opacity-90 transition-opacity cursor-pointer font-rounded"
        >
          Vetri<span className="text-slate-900 font-extrabold">Osai</span>
        </button>

        <nav className="hidden md:flex items-center gap-1.5 font-bold text-slate-600 text-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-all cursor-pointer ${
                  isActive
                    ? 'px-4 py-1.5 bg-[#bfe7fc] text-slate-800 rounded-full font-extrabold shadow-inner'
                    : 'px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-50 rounded-full'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right side: User Profile, Gamification Stats Pill, & Avatar */}
      <div className="flex items-center gap-3">
        {/* Profile text and child avatar */}
        <div
          onClick={onOpenPointCalculator}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
          title="Click to view points & progress breakdown"
        >
          {/* Child Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 text-amber-800" fill="currentColor" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="#F8C8A0" r="16"></circle>
              {/* Hair */}
              <path
                d="M9 16C9 9 13 7 18 7C23 7 27 9 27 16C27 17 26 18 24 16C22 14 19 14 18 14C16 14 14 15 12 16C10 17 9 17 9 16Z"
                fill="#5D3A1A"
              ></path>
              {/* Eyes */}
              <circle cx="14" cy="19" fill="#332211" r="1.5"></circle>
              <circle cx="22" cy="19" fill="#332211" r="1.5"></circle>
              {/* Smile */}
              <path
                d="M15.5 23C16.5 24.2 19.5 24.2 20.5 23"
                fill="none"
                stroke="#85461E"
                strokeLinecap="round"
                strokeWidth="1.2"
              ></path>
              {/* Cheeks */}
              <circle cx="12.5" cy="21" fill="#FFAAA6" r="1.5"></circle>
              <circle cx="23.5" cy="21" fill="#FFAAA6" r="1.5"></circle>
            </svg>
          </div>

          {/* Profile Text Details */}
          <div className="text-xs leading-tight">
            <div className="font-extrabold text-slate-800 text-[13px]">{displayNameFormatted}</div>
            <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px] mt-0.5">
              <span className="flex items-center gap-1">
                <span className="text-amber-400 text-xs">⭐</span> {points} stars
              </span>
              <span className="flex items-center gap-1">
                <span className="text-orange-500 text-xs">🔥</span> {streakDays} Day streak
              </span>
            </div>
          </div>
        </div>

        {/* User Initial Avatar Circle / Sign-In Button */}
        {user ? (
          <div
            title={`Signed in as ${user.displayName || user.email}`}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300 ml-1 shrink-0 overflow-hidden"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
          </div>
        ) : (
          <button
            onClick={onSignIn}
            disabled={isSigningIn}
            title="Click to sign in with Google"
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300 ml-1 cursor-pointer hover:bg-slate-300 transition-colors shrink-0"
          >
            {isSigningIn ? '...' : 'GT'}
          </button>
        )}

        {/* Once logged in, remove track back to landing page; show logout option */}
        {user ? (
          <button
            onClick={onSignOut}
            title="Log out of account"
            className="text-xs text-rose-600 hover:text-white font-extrabold px-3.5 py-1.5 rounded-full hover:bg-rose-500 border border-rose-200 hover:border-rose-500 transition-all cursor-pointer shadow-xs ml-1 flex items-center gap-1"
          >
            <span>Log out</span>
          </button>
        ) : (
          <button
            onClick={onSignIn}
            disabled={isSigningIn}
            title="Sign in with Google"
            className="text-xs text-sky-700 hover:text-white font-extrabold px-3.5 py-1.5 rounded-full hover:bg-sky-500 border border-sky-200 hover:border-sky-500 transition-all cursor-pointer shadow-xs ml-1"
          >
            {isSigningIn ? '...' : 'Sign in'}
          </button>
        )}
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden w-full flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'px-3 py-1 bg-[#bfe7fc] text-slate-800 rounded-full font-extrabold shadow-inner'
                  : 'px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
