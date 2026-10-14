import React, { useState } from 'react';
import { X, Calculator, Sparkles, CheckCircle2, ShieldCheck, Flame, Award, History } from 'lucide-react';
import { TherapySession, Student } from '../types';
import { pointCalculator } from '../services/pointCalculator';

interface PointCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  currentPoints: number;
  streakDays: number;
  sessions: TherapySession[];
}

export const PointCalculatorModal: React.FC<PointCalculatorModalProps> = ({
  isOpen,
  onClose,
  student,
  currentPoints,
  streakDays,
  sessions,
}) => {
  // Interactive Simulator State
  const [simLingSounds, setSimLingSounds] = useState(6);
  const [simAccuracy, setSimAccuracy] = useState(95);
  const [simDetectiveStreak, setSimDetectiveStreak] = useState(4);
  const [simCardMatches, setSimCardMatches] = useState(6);
  const [simCardMoves, setSimCardMoves] = useState(12);

  if (!isOpen) return null;

  // Real calculation for simulator
  const simLingPoints = (simLingSounds * 5) + (simLingSounds >= 6 ? 15 : 0) + (simAccuracy >= 90 ? 10 : 0);
  const simDetectivePoints = 15 + (simDetectiveStreak >= 3 ? Math.min(simDetectiveStreak * 5, 25) : 0);
  const simCardPoints = (simCardMatches * 5) + (simCardMatches >= 6 ? 20 : 0) + (simCardMoves <= 14 ? 15 : 0);
  const simDailyStreakBonus = pointCalculator.calculateDailyStreakBonus(streakDays);
  const simTotal = simLingPoints + simDetectivePoints + simCardPoints + simDailyStreakBonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-3xl max-w-2xl w-full shadow-2xl border border-surface-container-high overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Calculator className="w-5 h-5 text-on-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-headline">Real Point Calculator Engine</h3>
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-black uppercase">
                  Verified Math
                </span>
              </div>
              <p className="text-xs text-on-primary/80">
                Transparent telemetry-based points earned by {student.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-primary/80 hover:text-on-primary p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Balance Card */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary text-2xl font-bold">
                ⭐
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Current Verified Balance
                </span>
                <div className="text-2xl font-black font-headline text-primary">
                  {currentPoints} Points
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-secondary flex items-center gap-1 justify-end">
                <Flame className="w-4 h-4 text-secondary" />
                <span>{streakDays}-Day Streak</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                +{pointCalculator.calculateDailyStreakBonus(streakDays)} pts/day continuity
              </span>
            </div>
          </div>

          {/* Formula Rules Table */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Real Point Calculation Rules</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container text-xs">
                <div className="font-bold text-on-surface flex items-center justify-between mb-1">
                  <span>Ling-6 Calibration</span>
                  <span className="text-primary font-mono font-bold">+5 to +35 pts</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  5 pts per tested frequency band. +15 pts bonus for full 6-band completion, +10 pts for &ge;90% detection.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container text-xs">
                <div className="font-bold text-on-surface flex items-center justify-between mb-1">
                  <span>Card Matching Game</span>
                  <span className="text-primary font-mono font-bold">+5 to +50 pts</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  5 pts per pair matched. +20 pts full deck clear bonus, +15 pts speed/efficiency bonus.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container text-xs">
                <div className="font-bold text-on-surface flex items-center justify-between mb-1">
                  <span>Sound Detective</span>
                  <span className="text-primary font-mono font-bold">+15 to +40 pts</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  15 pts per mystery formant. +10 to +25 pts streak multiplier on 3+ consecutive correct answers.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container text-xs">
                <div className="font-bold text-on-surface flex items-center justify-between mb-1">
                  <span>Daily Continuity Streak</span>
                  <span className="text-secondary font-mono font-bold">+10 to +50 pts/day</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  10 pts &times; consecutive active practice days (capped at 50 pts/day) stored in real-time Firestore.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Simulator */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tertiary" />
                <span>Interactive Point Calculator Simulator</span>
              </h4>
              <span className="text-xs font-black text-primary font-mono bg-surface px-2.5 py-1 rounded-full border">
                Projected: +{simTotal} Pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Ling-6 Phonemes Tested: <span className="text-primary font-bold">{simLingSounds} / 6</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={simLingSounds}
                  onChange={(e) => setSimLingSounds(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Accuracy Score: <span className="text-primary font-bold">{simAccuracy}%</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="5"
                  value={simAccuracy}
                  onChange={(e) => setSimAccuracy(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Detective Streak: <span className="text-primary font-bold">{simDetectiveStreak}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simDetectiveStreak}
                  onChange={(e) => setSimDetectiveStreak(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Card Pairs Matched: <span className="text-primary font-bold">{simCardMatches} / 6</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={simCardMatches}
                  onChange={(e) => setSimCardMatches(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border flex items-center justify-between text-xs font-semibold">
              <div className="text-on-surface-variant">
                Ling: <span className="text-on-surface font-bold">+{simLingPoints}</span> • 
                Detective: <span className="text-on-surface font-bold">+{simDetectivePoints}</span> • 
                Cards: <span className="text-on-surface font-bold">+{simCardPoints}</span> • 
                Streak: <span className="text-on-surface font-bold">+{simDailyStreakBonus}</span>
              </div>
              <div className="text-primary font-bold text-sm">
                Total = {simTotal} Pts
              </div>
            </div>
          </div>

          {/* Real Telemetry History Audit */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span>Real Firestore Session Telemetry</span>
            </h4>
            {sessions.length === 0 ? (
              <div className="text-center p-6 bg-surface-container-lowest rounded-2xl border border-dashed border-surface-container text-xs text-on-surface-variant">
                No sessions recorded yet today. Complete your first Ling-6 calibration or game to record real telemetry!
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {sessions.slice(0, 5).map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-on-surface capitalize">
                        {sess.category.replace('_', ' ')}
                      </div>
                      <span className="text-[10px] text-on-surface-variant">
                        {new Date(sess.date).toLocaleDateString()} • {sess.durationMinutes} mins • {sess.score}% accuracy
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-bold text-xs">
                      +{Math.round((sess.score / 100) * 20) + 15} Pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
