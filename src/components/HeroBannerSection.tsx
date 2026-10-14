import React from 'react';

interface HeroBannerSectionProps {
  studentName: string;
  points: number;
  streakDays: number;
}

export const HeroBannerSection: React.FC<HeroBannerSectionProps> = ({
  studentName,
  points,
  streakDays,
}) => {
  const displayNameFormatted = studentName && studentName.trim()
    ? studentName
    : 'Little Champion';

  return (
    <section
      className="relative bg-white/85 backdrop-blur-sm rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-white/80 shadow-sm gap-6 overflow-hidden"
      data-purpose="hero-overview"
    >
      {/* Decorative Doodle SVGs */}
      {/* Top Left Floating Bubbles */}
      <div className="absolute left-6 top-3 pointer-events-none select-none">
        <svg fill="none" height="35" viewBox="0 0 45 35" width="45">
          <ellipse
            cx="6"
            cy="28"
            fill="#BAE6FD"
            rx="3.5"
            ry="5.5"
            stroke="#38BDF8"
            strokeWidth="2"
            transform="rotate(-25 6 28)"
          />
          <ellipse
            cx="16"
            cy="18"
            fill="#BAE6FD"
            rx="4"
            ry="6.5"
            stroke="#38BDF8"
            strokeWidth="2"
            transform="rotate(-20 16 18)"
          />
          <ellipse
            cx="29"
            cy="10"
            fill="#BAE6FD"
            rx="4.5"
            ry="7"
            stroke="#38BDF8"
            strokeWidth="2"
            transform="rotate(-15 29 10)"
          />
          <ellipse
            cx="40"
            cy="5"
            fill="#BAE6FD"
            rx="3"
            ry="4"
            stroke="#38BDF8"
            strokeWidth="1.8"
            transform="rotate(-10 40 5)"
          />
        </svg>
      </div>

      {/* Bottom Left Pink Swirl Doodle */}
      <div className="absolute left-6 bottom-3 pointer-events-none select-none">
        <svg fill="none" height="32" viewBox="0 0 26 32" width="26">
          <path
            d="M4 14C3 8 7 3 13 3C18 3 22 7 21 14C20 21 13 22 8 20C4 18 4 12 8 9C12 7 17 9 17 14C17 21 7 26 5 29"
            stroke="#E11D48"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </svg>
      </div>

      {/* Top Right Floating Heart and Stars */}
      <div className="absolute right-12 top-4 pointer-events-none select-none flex items-center gap-2">
        <svg fill="#F43F5E" height="18" stroke="#BE123C" strokeWidth="1.5" viewBox="0 0 24 24" width="18">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <svg fill="#D8B4FE" height="18" stroke="#9333EA" strokeWidth="1.5" viewBox="0 0 24 24" width="18">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          className="-rotate-12"
          fill="#FDE047"
          height="24"
          stroke="#CA8A04"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width="24"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      {/* Bottom Right Green Squiggle */}
      <div className="absolute right-8 bottom-3 pointer-events-none select-none">
        <svg fill="none" height="26" viewBox="0 0 34 26" width="34">
          <path
            d="M2 18C5 20 8 16 11 10C14 4 17 4 19 9C21 14 24 16 26 11C28 6 31 7 32 10"
            stroke="#059669"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* Left Side: Avatar & Greeting */}
      <div className="flex items-center gap-5 z-10 max-w-2xl">
        {/* Prominent Illustrated Boy Avatar */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#c8eedd] border-4 border-white shadow-md shrink-0 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full transform translate-y-1 scale-110" fill="none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#FCEBD9" />
            <path
              d="M22 42C20 22 34 16 50 16C66 16 80 22 78 42C76 46 72 45 68 39C62 33 54 34 50 34C45 34 38 32 32 39C28 45 24 46 22 42Z"
              fill="#5D3A1A"
            />
            <circle cx="21" cy="52" r="6" fill="#F5CBA7" />
            <circle cx="79" cy="52" r="6" fill="#F5CBA7" />
            <ellipse cx="50" cy="55" rx="27" ry="26" fill="#F8C8A0" />
            <circle cx="40" cy="53" r="3.5" fill="#332211" />
            <circle cx="60" cy="53" r="3.5" fill="#332211" />
            <path
              d="M44 64C46 67 54 67 56 64"
              stroke="#85461E"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="34" cy="58" r="4" fill="#FFAAA6" />
            <circle cx="66" cy="58" r="4" fill="#FFAAA6" />
          </svg>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#bfe7fc] text-slate-800 text-[11px] font-extrabold uppercase tracking-wide mb-1 shadow-inner">
            <span>Student Progress Ledger</span>
            <span>•</span>
            <span>{streakDays} Day Active Streak</span>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-rounded">
            Hello, {displayNameFormatted}!
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-semibold max-w-xl mt-0.5 leading-relaxed">
            {streakDays > 0 ? (
              <>
                You've collected <span className="text-amber-600 font-extrabold">{points} stars</span> and maintained a{' '}
                <span className="text-orange-600 font-extrabold">{streakDays}-day practice streak</span>. Ready for your next auditory adventure?
              </>
            ) : (
              <>
                You have <span className="text-amber-600 font-extrabold">{points} stars</span> and a{' '}
                <span className="text-orange-600 font-extrabold">0-day streak</span>. Complete your first practice drill to earn your Day 1 badge!
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
