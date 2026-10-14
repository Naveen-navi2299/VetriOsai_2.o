import React, { useState, useEffect } from 'react';
import { Student, LimitedTimeReward } from '../types';
import { auditoryService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface RewardsViewProps {
  student: Student;
  points: number;
  streakDays: number;
  onDeductPoints: (amount: number) => boolean;
  onAddPoints: (amount: number) => void;
  onOpenPointCalculator?: () => void;
}

const INITIAL_REWARDS: LimitedTimeReward[] = [
  {
    id: 'rew-1',
    name: 'Golden Lion Voice Synthesizer',
    icon: '🦁',
    costPoints: 50,
    durationHours: 24,
    description: 'Empowers Leo the Lion with majestic golden audio formants during practice.',
    rarity: 'Epic',
  },
  {
    id: 'rew-2',
    name: 'Train Choo-Choo Soundboard Pass',
    icon: '🚂',
    costPoints: 40,
    durationHours: 48,
    description: 'Unlocks train whistle effects on every correct /oo/ vowel match.',
    rarity: 'Rare',
  },
  {
    id: 'rew-3',
    name: 'Space Rocket Audio Booster',
    icon: '🚀',
    costPoints: 60,
    durationHours: 12,
    description: 'Cosmic frequency booster for high-pitch Number Mountain challenges.',
    rarity: 'Epic',
  },
  {
    id: 'rew-4',
    name: 'Royal Speech Champion Crown',
    icon: '👑',
    costPoints: 100,
    durationHours: 168, // 7 days
    description: 'Golden crown avatar badge displayed across all clinical reports and screens.',
    rarity: 'Legendary',
  },
  {
    id: 'rew-5',
    name: 'Dolphin Syllable Bubble Pack',
    icon: '🐬',
    costPoints: 45,
    durationHours: 24,
    description: 'Adds playful bubble chime sound effects on consonant-vowel transitions.',
    rarity: 'Rare',
  },
  {
    id: 'rew-6',
    name: 'Night Owl Formant Ear-Badge',
    icon: '🦉',
    costPoints: 35,
    durationHours: 48,
    description: 'Soft dusk lighting theme and quiet-room calibration filter.',
    rarity: 'Common',
  },
];

export const RewardsView: React.FC<RewardsViewProps> = ({
  student,
  points,
  streakDays,
  onDeductPoints,
  onAddPoints,
  onOpenPointCalculator,
}) => {
  const [storeRewards, setStoreRewards] = useState<LimitedTimeReward[]>(() => {
    // Load local storage or default
    try {
      const saved = localStorage.getItem('vetri_osai_purchased_rewards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REWARDS;
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [now, setNow] = useState(Date.now());

  // Update timer every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleBuyReward = (reward: LimitedTimeReward) => {
    if (points < reward.costPoints) {
      setFeedbackMsg({
        text: `You need ${reward.costPoints - points} more points to buy ${reward.name}! Complete today's Ling practice or card games to earn points.`,
        type: 'error',
      });
      auditoryService.playForestSound('tap');
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    const success = onDeductPoints(reward.costPoints);
    if (!success) return;

    const expiresAt = Date.now() + reward.durationHours * 3600 * 1000;
    const updated = storeRewards.map((r) =>
      r.id === reward.id ? { ...r, purchasedAt: Date.now(), expiresAt } : r
    );
    setStoreRewards(updated);
    try {
      localStorage.setItem('vetri_osai_purchased_rewards', JSON.stringify(updated));
    } catch {}

    auditoryService.playForestSound('success');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setFeedbackMsg({
      text: `🎉 Purchased ${reward.name}! Active for the next ${reward.durationHours} hours.`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const formatRemainingTime = (expiresAt: number | null | undefined): string => {
    if (!expiresAt) return '';
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return 'Expired';
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-r from-secondary-container via-surface-container-high to-surface-container-lowest p-6 md:p-8 rounded-3xl md:rounded-full border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-sm text-3xl shrink-0">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-on-primary">
                Limited-Time Reward Store
              </span>
              <span className="text-xs font-semibold text-secondary">
                {student.name}'s Token Vault
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface">
              Points &amp; Time-Limited Rewards
            </h1>
            <p className="text-xs text-on-surface-variant max-w-xl">
              Use points earned from Ling-6 sound calibrations and Listening Forest games to rent and equip limited-time auditory power-ups!
            </p>
          </div>
        </div>

        {/* Live Points Counter Pill */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container-high shadow-xs text-center shrink-0 min-w-[210px] space-y-2">
          <div>
            <div className="text-xs font-bold uppercase text-on-surface-variant mb-1">
              Available Points Balance
            </div>
            <div className="text-4xl font-black font-headline text-tertiary flex items-center justify-center gap-1.5">
              <span>{points}</span>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-[11px] font-semibold text-secondary mt-1">
              Active Streak: 🔥 {streakDays} Days
            </div>
          </div>
        </div>
      </section>

      {/* Floating Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-secondary-container text-on-secondary-container border border-secondary-fixed'
              : 'bg-error-container text-on-error-container border border-error'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {feedbackMsg.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Earn Points Explainer Banner */}
      <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">savings</span>
          <div className="text-xs text-on-surface">
            <span className="font-bold text-primary">How to Earn Points: </span>
            Complete Daily Ling-6 Practice (<strong>+25 pts</strong>) • Play Card Matching (<strong>+10 pts</strong>) • Solve Sound Detective Clue (<strong>+15 pts</strong>)
          </div>
        </div>
        <button
          onClick={() => onAddPoints(50)}
          className="px-4 py-2 rounded-full bg-surface-container-highest hover:bg-surface-variant text-on-surface text-xs font-bold cursor-pointer shrink-0"
        >
          Bonus +50 Pts (Daily Milestone)
        </button>
      </div>

      {/* LIMITED-TIME REWARD CATALOG */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">timer</span>
              <span>Available Limited-Time Rewards (Buy with Points)</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Each reward remains equipped for a set duration after purchase.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-surface-container-high rounded-full text-secondary">
            {storeRewards.filter((r) => r.expiresAt && r.expiresAt > now).length} Active Rewards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {storeRewards.map((reward) => {
            const isCurrentlyActive = reward.expiresAt && reward.expiresAt > now;
            const remainingLabel = isCurrentlyActive ? formatRemainingTime(reward.expiresAt) : null;
            const canAfford = points >= reward.costPoints;

            return (
              <div
                key={reward.id}
                className={`p-6 rounded-3xl md:rounded-[2.5rem] border transition-all flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'bg-secondary-container/50 border-primary shadow-md ring-2 ring-primary-container'
                    : 'bg-surface-container-lowest border-surface-container-high shadow-xs hover:border-primary/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-3xl shadow-xs">
                      {reward.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          reward.rarity === 'Legendary'
                            ? 'bg-tertiary-fixed text-tertiary font-extrabold'
                            : reward.rarity === 'Epic'
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {reward.rarity}
                      </span>
                      <span className="text-[11px] font-bold text-secondary flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>{reward.durationHours}h Pass</span>
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-headline text-on-surface">{reward.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-container-high flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Cost:</span>
                    <span className="font-extrabold font-headline text-tertiary text-sm flex items-center gap-1">
                      <span>{reward.costPoints} Points</span>
                      <span>⭐</span>
                    </span>
                  </div>

                  {isCurrentlyActive ? (
                    <div className="py-2.5 px-4 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Equipped ({remainingLabel})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyReward(reward)}
                      className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-primary hover:bg-primary-container text-on-primary shadow-xs hover:scale-102 active:scale-95'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      <span>{canAfford ? `Buy for ${reward.costPoints} Pts` : `Need ${reward.costPoints} Pts`}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
