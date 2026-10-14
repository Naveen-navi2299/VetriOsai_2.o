import React, { useState } from 'react';
import { Student } from '../types';
import { SoundIslandModal } from './SoundIslandModal';
import { AlphabetTownModal } from './AlphabetTownModal';
import { NumberMountainModal } from './NumberMountainModal';

interface HomePageViewProps {
  student: Student;
  points: number;
  streakDays: number;
  lingDaysPracticed: number;
  onNavigateToTab: (tab: 'home' | 'progress' | 'rewards' | 'settings' | 'about') => void;
  onNavigateToForest: (initialGame?: 'overview' | 'card_matching' | 'sound_detective') => void;
  onQuickStartAdventure: () => void;
  onOpenPointCalculator?: () => void;
  onEarnPoints?: (points: number) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  student,
  points,
  streakDays,
  lingDaysPracticed,
  onNavigateToTab,
  onNavigateToForest,
  onQuickStartAdventure,
  onOpenPointCalculator,
  onEarnPoints,
}) => {
  const [activeModal, setActiveModal] = useState<
    'calibration' | 'sound_island' | 'alphabet_town' | 'number_mountain' | null
  >(null);

  const practiceDaysString = `${lingDaysPracticed || 0}/30 days`;

  return (
    <div className="w-full font-sans antialiased">
      <div className="max-w-6xl mx-auto px-1 py-4">
        {/* Intro Title Section */}
        <section className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E2958] tracking-tight leading-tight mb-2 font-rounded">
            A small adventure,
            <br className="hidden sm:inline" />
            {' '}one sound at a time
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed max-w-xl mx-auto">
            Each world has short practice and a game the child plays with their own voice. Pick a world to try it.
          </p>
        </section>

        {/* Cards Grid (2x2 Desktop Layout) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {/* Card 1: Listening Forest */}
          <article className="adventure-card bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-blue-50/60 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Illustration Container */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden relative shadow-inner">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk6PyPlQDxunCDqLJd7EM9MRJ1q0Itld84XEbUy6L3i6kkcxtk3xwM4S5nFxQqt-YU09KK1ATFkr5tYyncrTVtvAPOXXB3NzHW2cJFYmo2QYhgtoHb2LDB9ZrLb-rX-VjmjUJmIe-he-mmNTudlrlq3BD2CPu2ryOZTaABKu7w_TReMDLSS5x8eYnR8355SZ3OrzIt5cHWz6wjKbZNgpAmcODNJuBXqoIERNDdobK2dLKMkkj8rZ4fQev-ZmCnfPi3dnQ"
                  alt="Listening Forest"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Body */}
              <div className="pt-5 pb-3 px-1">
                <h2 className="text-xl sm:text-[22px] font-bold text-[#1E2958] mb-1.5 tracking-tight font-sans">
                  1. Listening Forest
                </h2>
                <p className="text-slate-600 text-[14px] sm:text-[15px] font-medium leading-relaxed">
                  Learn to notice each long sound, then repeat it.
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 pb-1 px-1 flex items-center justify-between">
              {/* Practice Days Badge */}
              <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-100/60 rounded-full px-3 py-1.5">
                <svg
                  className="w-5 h-5 text-amber-400 fill-current drop-shadow-sm flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">{practiceDaysString}</span>
                  <span className="text-[10px] font-semibold text-slate-500">Practice</span>
                </div>
              </div>

              {/* Try It Action Button */}
              <button
                onClick={() => onNavigateToForest()}
                className="btn-try-gradient inline-flex items-center text-white text-[15px] font-bold px-5 py-2.5 rounded-full shadow-md cursor-pointer"
              >
                <span>Try It</span>
                <svg
                  className="w-4 h-4 ml-1.5 -mr-0.5 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </article>

          {/* Card 2: Sound Island */}
          <article className="adventure-card bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-blue-50/60 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Illustration Container */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden relative bg-gradient-to-b from-[#A5E1FD] via-[#6EC6F3] to-[#39A2DB] flex items-center justify-center select-none shadow-inner">
                {/* Stylized Tropical Island & Audio Waves (SVG) */}
                <svg className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 260">
                  <defs>
                    <linearGradient id="islandSky" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#C2EDFF" />
                      <stop offset="65%" stopColor="#80D0F5" />
                      <stop offset="100%" stopColor="#4DB7E8" />
                    </linearGradient>
                    <linearGradient id="sandGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#FFE89E" />
                      <stop offset="100%" stopColor="#ECC66D" />
                    </linearGradient>
                  </defs>
                  <rect fill="url(#islandSky)" height="260" width="400" />
                  {/* Soft Clouds */}
                  <ellipse cx="340" cy="50" fill="#FFFFFF" opacity="0.8" rx="35" ry="14" />
                  <ellipse cx="360" cy="45" fill="#FFFFFF" opacity="0.8" rx="25" ry="12" />
                  <ellipse cx="80" cy="70" fill="#FFFFFF" opacity="0.7" rx="40" ry="14" />
                  {/* Ocean Waves */}
                  <rect fill="#3096D1" height="100" width="400" y="160" />
                  <path d="M 0 170 Q 50 162 100 170 T 200 170 T 300 170 T 400 170 L 400 260 L 0 260 Z" fill="#2487C0" />
                  <path d="M 0 190 Q 60 185 120 190 T 240 190 T 360 190 L 400 260 L 0 260 Z" fill="#1C7AB0" />
                  {/* Island Sand Dunes */}
                  <ellipse cx="205" cy="180" fill="#E6BE61" rx="140" ry="32" />
                  <ellipse cx="205" cy="176" fill="url(#sandGrad)" rx="135" ry="28" />
                  {/* Island Grassy Patch */}
                  <ellipse cx="205" cy="168" fill="#48B365" rx="85" ry="15" />
                  {/* Left Palm Tree */}
                  <path d="M 175 168 Q 160 120 140 75" fill="none" stroke="#A07246" strokeLinecap="round" strokeWidth="8" />
                  <g transform="translate(140, 75)">
                    <path d="M 0 0 C -25 -20 -50 0 -55 20" fill="none" stroke="#2B9448" strokeLinecap="round" strokeWidth="7" />
                    <path d="M 0 0 C -15 -35 15 -35 25 -10" fill="none" stroke="#37A855" strokeLinecap="round" strokeWidth="7" />
                    <path d="M 0 0 C 10 -30 45 -20 45 10" fill="none" stroke="#329D4E" strokeLinecap="round" strokeWidth="7" />
                    <path d="M 0 0 C -35 -15 -25 -40 0 -40" fill="none" stroke="#48B866" strokeLinecap="round" strokeWidth="7" />
                  </g>
                  {/* Center/Tall Palm Tree */}
                  <path d="M 205 168 Q 208 115 212 55" fill="none" stroke="#8F6237" strokeLinecap="round" strokeWidth="9" />
                  <g transform="translate(212, 55)">
                    <path d="M 0 0 C -30 -30 -60 0 -65 25" fill="none" stroke="#2B9448" strokeLinecap="round" strokeWidth="8" />
                    <path d="M 0 0 C -20 -40 20 -45 35 -15" fill="none" stroke="#3DB35C" strokeLinecap="round" strokeWidth="8" />
                    <path d="M 0 0 C 20 -35 60 -15 55 20" fill="none" stroke="#309C4C" strokeLinecap="round" strokeWidth="8" />
                    <path d="M 0 0 C -40 -15 -30 -50 0 -50" fill="none" stroke="#48B866" strokeLinecap="round" strokeWidth="8" />
                  </g>
                  {/* Right Palm Tree */}
                  <path d="M 235 168 Q 255 125 270 85" fill="none" stroke="#9C6B3E" strokeLinecap="round" strokeWidth="7.5" />
                  <g transform="translate(270, 85)">
                    <path d="M 0 0 C -20 -25 -45 -5 -45 15" fill="none" stroke="#2D984B" strokeLinecap="round" strokeWidth="6.5" />
                    <path d="M 0 0 C 15 -30 45 -15 45 15" fill="none" stroke="#38A556" strokeLinecap="round" strokeWidth="6.5" />
                    <path d="M 0 0 C -10 -35 25 -35 30 -10" fill="none" stroke="#48B866" strokeLinecap="round" strokeWidth="6.5" />
                  </g>
                  {/* Audio Radiating Waves around Palm */}
                  <path d="M 185 105 A 25 25 0 0 0 185 135" fill="none" opacity="0.9" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3" />
                  <path d="M 175 97 A 38 38 0 0 0 175 143" fill="none" opacity="0.7" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3" />
                  <path d="M 230 105 A 25 25 0 0 1 230 135" fill="none" opacity="0.9" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3" />
                  <path d="M 240 97 A 38 38 0 0 1 240 143" fill="none" opacity="0.7" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3" />
                  {/* Left: Microphone with Voice Wave Graphic */}
                  <g transform="translate(45, 115) scale(0.9)">
                    <rect fill="#5865F2" height="24" rx="8" width="16" x="10" y="5" />
                    <path d="M 5 18 C 5 30 31 30 31 18" fill="none" stroke="#5865F2" strokeLinecap="round" strokeWidth="3.5" />
                    <line stroke="#5865F2" strokeWidth="3.5" x1="18" x2="18" y1="30" y2="40" />
                    <line stroke="#5865F2" strokeLinecap="round" strokeWidth="3.5" x1="11" x2="25" y1="40" y2="40" />
                    <path d="M 38 25 L 43 15 L 49 33 L 55 20 L 61 28" fill="none" stroke="#22D3EE" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  </g>
                  {/* Right: Colorful Audio Equalizer Waveform */}
                  <g strokeLinecap="round" transform="translate(310, 115)">
                    <line stroke="#EF4444" strokeWidth="3.5" x1="0" x2="0" y1="20" y2="30" />
                    <line stroke="#F43F5E" strokeWidth="3.5" x1="8" x2="8" y1="12" y2="38" />
                    <line stroke="#A855F7" strokeWidth="3.5" x1="16" x2="16" y1="5" y2="45" />
                    <line stroke="#6366F1" strokeWidth="3.5" x1="24" x2="24" y1="16" y2="34" />
                    <line stroke="#3B82F6" strokeWidth="3.5" x1="32" x2="32" y1="8" y2="42" />
                    <line stroke="#06B6D4" strokeWidth="3.5" x1="40" x2="40" y1="18" y2="32" />
                  </g>
                  {/* Musical Notes Floating in Sky */}
                  <g transform="translate(68, 65) scale(0.9)">
                    <ellipse cx="4" cy="14" fill="#F43F5E" rx="4.5" ry="3.5" transform="rotate(-20 4 14)" />
                    <line stroke="#F43F5E" strokeWidth="2" x1="7" x2="7" y1="13" y2="2" />
                    <path d="M 7 2 Q 13 4 12 10" fill="none" stroke="#F43F5E" strokeWidth="2" />
                  </g>
                  <g transform="translate(295, 58) scale(0.9)">
                    <ellipse cx="4" cy="14" fill="#3B82F6" rx="4.5" ry="3.5" transform="rotate(-20 4 14)" />
                    <line stroke="#3B82F6" strokeWidth="2" x1="7" x2="7" y1="13" y2="2" />
                  </g>
                </svg>
              </div>

              {/* Card Body */}
              <div className="pt-5 pb-3 px-1">
                <h2 className="text-xl sm:text-[22px] font-bold text-[#1E2958] mb-1.5 tracking-tight font-sans">
                  2. Sound Island
                </h2>
                <p className="text-slate-600 text-[14px] sm:text-[15px] font-medium leading-relaxed">
                  Vocals, lip sounds, tongue movement and breath control.
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 pb-1 px-1 flex items-center justify-between">
              {/* Practice Days Badge */}
              <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-100/60 rounded-full px-3 py-1.5">
                <svg
                  className="w-5 h-5 text-amber-400 fill-current drop-shadow-sm flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">0/30 days</span>
                  <span className="text-[10px] font-semibold text-slate-500">Practice</span>
                </div>
              </div>

              {/* Try It Action Button */}
              <button
                onClick={() => setActiveModal('sound_island')}
                className="btn-try-gradient inline-flex items-center text-white text-[15px] font-bold px-5 py-2.5 rounded-full shadow-md cursor-pointer"
              >
                <span>Try It</span>
                <svg
                  className="w-4 h-4 ml-1.5 -mr-0.5 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </article>

          {/* Card 3: Alphabet Town */}
          <article className="adventure-card bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-blue-50/60 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Illustration Container */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden relative bg-gradient-to-b from-[#C3E8FD] via-[#DFEFFB] to-[#71C582] flex items-center justify-center select-none shadow-inner">
                {/* Stylized Alphabet Town (SVG) */}
                <svg className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 260">
                  <defs>
                    <linearGradient id="skyTown" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#C5E8FE" />
                      <stop offset="70%" stopColor="#EDF7FC" />
                      <stop offset="100%" stopColor="#CEEED9" />
                    </linearGradient>
                  </defs>
                  <rect fill="url(#skyTown)" height="260" width="400" />
                  {/* Fluffy Clouds in Sky */}
                  <ellipse cx="140" cy="40" fill="#FFFFFF" opacity="0.9" rx="35" ry="14" />
                  <ellipse cx="160" cy="35" fill="#FFFFFF" opacity="0.9" rx="25" ry="12" />
                  <ellipse cx="370" cy="50" fill="#FFFFFF" opacity="0.8" rx="30" ry="12" />
                  {/* Large Bold ABC Letters floating above buildings */}
                  <text fill="#F05252" fontFamily="'Quicksand', sans-serif" fontSize="70" fontWeight="900" paintOrder="stroke fill" stroke="#FFFFFF" strokeLinejoin="round" strokeWidth="4" x="80" y="88">
                    A
                  </text>
                  <text fill="#38BDF8" fontFamily="'Quicksand', sans-serif" fontSize="70" fontWeight="900" paintOrder="stroke fill" stroke="#FFFFFF" strokeLinejoin="round" strokeWidth="4" x="175" y="88">
                    B
                  </text>
                  <text fill="#FBBF24" fontFamily="'Quicksand', sans-serif" fontSize="70" fontWeight="900" paintOrder="stroke fill" stroke="#FFFFFF" strokeLinejoin="round" strokeWidth="4" x="270" y="88">
                    C
                  </text>
                  {/* Rolling Green Grass Mound / Ground */}
                  <ellipse cx="200" cy="275" fill="#69BF7B" rx="240" ry="70" />
                  <ellipse cx="70" cy="250" fill="#58AB6A" rx="100" ry="40" />
                  <ellipse cx="330" cy="250" fill="#58AB6A" rx="100" ry="40" />
                  {/* Left Tree */}
                  <rect fill="#8C5E35" height="35" rx="3" width="10" x="58" y="165" />
                  <ellipse cx="63" cy="155" fill="#439A57" rx="24" ry="28" />
                  <ellipse cx="63" cy="150" fill="#56B26C" rx="18" ry="20" />
                  {/* Yellow Apartment Building */}
                  <rect fill="#F8BC44" height="75" rx="4" stroke="#E09F25" strokeWidth="2" width="65" x="95" y="125" />
                  <rect fill="#DE8B1D" height="6" rx="2" width="73" x="91" y="121" />
                  {/* Windows Grid */}
                  <g fill="#77C8E8" stroke="#3D8FA9" strokeWidth="1.5">
                    <rect height="12" rx="1" width="12" x="103" y="132" />
                    <rect height="12" rx="1" width="12" x="121" y="132" />
                    <rect height="12" rx="1" width="12" x="139" y="132" />
                    <rect height="12" rx="1" width="12" x="103" y="150" />
                    <rect height="12" rx="1" width="12" x="121" y="150" />
                    <rect height="12" rx="1" width="12" x="139" y="150" />
                    <rect height="12" rx="1" width="12" x="103" y="168" />
                    <rect height="12" rx="1" width="12" x="121" y="168" />
                    <rect height="12" rx="1" width="12" x="139" y="168" />
                  </g>
                  {/* Peach/Pink Town House with Peaked Roof */}
                  <polygon fill="#F47264" points="212,120 170,150 254,150" stroke="#DC4D3E" strokeWidth="2" />
                  <rect fill="#F8A79B" height="50" stroke="#E3897B" strokeWidth="2" width="74" x="175" y="150" />
                  <circle cx="212" cy="138" fill="#FFFFFF" r="6" stroke="#DC4D3E" strokeWidth="1.5" />
                  <rect fill="#77C8E8" height="14" rx="2" stroke="#3D8FA9" strokeWidth="1.5" width="14" x="187" y="160" />
                  <rect fill="#77C8E8" height="14" rx="2" stroke="#3D8FA9" strokeWidth="1.5" width="14" x="223" y="160" />
                  <rect fill="#D9695C" height="24" rx="3" width="16" x="204" y="176" />
                  {/* Blue/Teal Tower House on Right */}
                  <polygon fill="#E86C50" points="280,105 260,135 300,135" stroke="#C95136" strokeWidth="1.5" />
                  <rect fill="#44B9BE" height="65" stroke="#2D9297" strokeWidth="2" width="32" x="264" y="135" />
                  <rect fill="#FFFFFF" height="12" rx="2" width="16" x="272" y="145" />
                  <rect fill="#FFFFFF" height="12" rx="2" width="16" x="272" y="165" />
                  {/* Red Apple in Foreground */}
                  <g transform="translate(160, 185) scale(1.1)">
                    <path d="M 24 5 C 26 0 32 -3 36 -2" fill="none" stroke="#684725" strokeLinecap="round" strokeWidth="3" />
                    <ellipse cx="32" cy="1" fill="#48BB78" rx="7" ry="3.5" transform="rotate(-30 32 1)" />
                    <path d="M 23 8 C 12 3 0 14 2 30 C 4 45 16 52 24 48 C 32 52 44 45 46 30 C 48 14 36 3 25 8 Z" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
                    <ellipse cx="12" cy="20" fill="#FCA5A5" opacity="0.75" rx="3.5" ry="7" transform="rotate(-20 12 20)" />
                  </g>
                  {/* Purple Plum on Right */}
                  <g transform="translate(255, 205) scale(0.75)">
                    <path d="M 18 5 C 20 0 24 -3 27 -2" fill="none" stroke="#4B331A" strokeLinecap="round" strokeWidth="3" />
                    <ellipse cx="24" cy="1" fill="#48BB78" rx="6" ry="3" transform="rotate(-25 24 1)" />
                    <circle cx="18" cy="24" fill="#9333EA" r="18" stroke="#7E22CE" strokeWidth="1.5" />
                    <ellipse cx="12" cy="18" fill="#D8B4FE" opacity="0.8" rx="2.5" ry="5" transform="rotate(-20 12 18)" />
                  </g>
                  {/* Wooden Block 'A' */}
                  <g transform="translate(68, 192)">
                    <rect fill="#F6C944" height="34" rx="6" stroke="#DE9F22" strokeWidth="2" width="34" x="0" y="6" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="26" fontWeight="900" x="8" y="32">
                      A
                    </text>
                  </g>
                </svg>
              </div>

              {/* Card Body */}
              <div className="pt-5 pb-3 px-1">
                <h2 className="text-xl sm:text-[22px] font-bold text-[#1E2958] mb-1.5 tracking-tight font-sans">
                  3. Alphabet Town
                </h2>
                <p className="text-slate-600 text-[14px] sm:text-[15px] font-medium leading-relaxed">
                  A to Z with picture, like A for apple.
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 pb-1 px-1 flex items-center justify-between">
              {/* Practice Days Badge */}
              <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-100/60 rounded-full px-3 py-1.5">
                <svg
                  className="w-5 h-5 text-amber-400 fill-current drop-shadow-sm flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">0/30 days</span>
                  <span className="text-[10px] font-semibold text-slate-500">Practice</span>
                </div>
              </div>

              {/* Try It Action Button */}
              <button
                onClick={() => setActiveModal('alphabet_town')}
                className="btn-try-gradient inline-flex items-center text-white text-[15px] font-bold px-5 py-2.5 rounded-full shadow-md cursor-pointer"
              >
                <span>Try It</span>
                <svg
                  className="w-4 h-4 ml-1.5 -mr-0.5 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </article>

          {/* Card 4: Number Mountain */}
          <article className="adventure-card bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-blue-50/60 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Illustration Container */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden relative bg-gradient-to-b from-[#BEE3FA] via-[#DBEFFB] to-[#51B367] flex items-center justify-center select-none shadow-inner">
                {/* Stylized Number Mountain with Trail and Flags (SVG) */}
                <svg className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 260">
                  <defs>
                    <linearGradient id="mtnSky" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#B2E0FB" />
                      <stop offset="60%" stopColor="#E1F2FB" />
                      <stop offset="100%" stopColor="#A6DCB8" />
                    </linearGradient>
                    <linearGradient id="peakGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7B8CA3" />
                      <stop offset="100%" stopColor="#4F5D73" />
                    </linearGradient>
                  </defs>
                  <rect fill="url(#mtnSky)" height="260" width="400" />
                  {/* Soft Clouds around peaks */}
                  <ellipse cx="280" cy="55" fill="#FFFFFF" opacity="0.9" rx="35" ry="14" />
                  <ellipse cx="300" cy="50" fill="#FFFFFF" opacity="0.9" rx="25" ry="12" />
                  <ellipse cx="120" cy="80" fill="#FFFFFF" opacity="0.8" rx="30" ry="12" />
                  {/* Rocky High Mountain Center Peak */}
                  <polygon fill="url(#peakGrad)" points="230,80 160,220 300,220" />
                  {/* Snow Cap on Mountain Peak */}
                  <polygon fill="#FFFFFF" points="230,80 205,130 220,122 235,132 250,120 255,130" />
                  {/* Foreground Lush Rolling Green Hills */}
                  <ellipse cx="200" cy="285" fill="#4DA861" rx="240" ry="95" />
                  <ellipse cx="60" cy="235" fill="#5BB970" rx="120" ry="60" />
                  <ellipse cx="340" cy="235" fill="#449B57" rx="120" ry="60" />
                  {/* Winding Wavy Path */}
                  <path
                    d="M 228 120 Q 205 150 235 170 T 190 205 T 230 260"
                    fill="none"
                    stroke="#E4C491"
                    strokeLinecap="round"
                    strokeWidth="26"
                  />
                  <path
                    d="M 228 120 Q 205 150 235 170 T 190 205 T 230 260"
                    fill="none"
                    stroke="#F4DBAD"
                    strokeLinecap="round"
                    strokeWidth="20"
                  />
                  {/* Trail Footstep Details */}
                  <ellipse cx="218" cy="245" fill="#D3A766" opacity="0.7" rx="3" ry="1.5" />
                  <ellipse cx="225" cy="235" fill="#D3A766" opacity="0.7" rx="3" ry="1.5" />
                  <ellipse cx="205" cy="210" fill="#D3A766" opacity="0.7" rx="3" ry="1.5" />
                  {/* Numbered Trail Flags */}
                  {/* Flag 1 (Summit Red) */}
                  <g transform="translate(225, 62)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="28" />
                    <polygon fill="#EF4444" points="5,0 23,6 5,14" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="9" y="10">
                      1
                    </text>
                  </g>
                  {/* Flag 3 (Yellow Top-Left) */}
                  <g transform="translate(160, 115)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="30" />
                    <polygon fill="#F59E0B" points="5,0 25,6 5,14" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="10">
                      3
                    </text>
                  </g>
                  {/* Flag 2 (Blue Top-Right) */}
                  <g transform="translate(265, 115)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="30" />
                    <polygon fill="#2563EB" points="5,0 25,6 5,14" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="10">
                      2
                    </text>
                  </g>
                  {/* Flag 1 (Pink Mid-Left) */}
                  <g transform="translate(110, 145)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="35" />
                    <polygon fill="#EC4899" points="5,0 26,6 5,15" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="11">
                      1
                    </text>
                  </g>
                  {/* Flag 1 (Purple Lower-Left) */}
                  <g transform="translate(155, 185)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="35" />
                    <polygon fill="#8B5CF6" points="5,0 26,6 5,15" />
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="11">
                      1
                    </text>
                  </g>
                  {/* Flag 2 (Coral/Orange Lower-Right) */}
                  <g transform="translate(275, 185)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="35" />
                    <polygon fill="#F97316" points="5,0 26,6 5,15"></polygon>
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="11">
                      2
                    </text>
                  </g>
                  {/* Flag 3 (Green Far-Right) */}
                  <g transform="translate(315, 160)">
                    <line stroke="#333333" strokeLinecap="round" strokeWidth="2.5" x1="5" x2="5" y1="0" y2="35"></line>
                    <polygon fill="#10B981" points="5,0 26,6 5,15"></polygon>
                    <text fill="#FFFFFF" fontFamily="'Quicksand', sans-serif" fontSize="9" fontWeight="800" x="10" y="11">
                      3
                    </text>
                  </g>
                </svg>
              </div>

              {/* Card Body */}
              <div className="pt-5 pb-3 px-1">
                <h2 className="text-xl sm:text-[22px] font-bold text-[#1E2958] mb-1.5 tracking-tight font-sans">
                  4. Number Mountain
                </h2>
                <p className="text-slate-600 text-[14px] sm:text-[15px] font-medium leading-relaxed">
                  Count from 1 to 20 and say the number.
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 pb-1 px-1 flex items-center justify-between">
              {/* Practice Days Badge */}
              <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-100/60 rounded-full px-3 py-1.5">
                <svg
                  className="w-5 h-5 text-amber-400 fill-current drop-shadow-sm flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">0/30 days</span>
                  <span className="text-[10px] font-semibold text-slate-500">Practice</span>
                </div>
              </div>

              {/* Try It Action Button */}
              <button
                onClick={() => setActiveModal('number_mountain')}
                className="btn-try-gradient inline-flex items-center text-white text-[15px] font-bold px-5 py-2.5 rounded-full shadow-md cursor-pointer"
              >
                <span>Try It</span>
                <svg
                  className="w-4 h-4 ml-1.5 -mr-0.5 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </article>
        </section>
      </div>

      {/* Interactive Modals */}
      {activeModal === 'sound_island' && (
        <SoundIslandModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          student={student}
          onEarnPoints={(pts) => onEarnPoints?.(pts)}
        />
      )}

      {activeModal === 'alphabet_town' && (
        <AlphabetTownModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          student={student}
          onEarnPoints={(pts) => onEarnPoints?.(pts)}
        />
      )}

      {activeModal === 'number_mountain' && (
        <NumberMountainModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          student={student}
          onEarnPoints={(pts) => onEarnPoints?.(pts)}
        />
      )}
    </div>
  );
};
