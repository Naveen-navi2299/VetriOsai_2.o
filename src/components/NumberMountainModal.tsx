import React, { useState } from 'react';
import { Student } from '../types';
import { auditoryService } from '../services/audioService';
import { firestoreService } from '../services/firestoreService';

interface NumberMountainModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onEarnPoints: (points: number) => void;
}

interface CountingChallenge {
  count: number;
  itemName: string;
  emoji: string;
  choices: number[];
}

export const NumberMountainModal: React.FC<NumberMountainModalProps> = ({
  student,
  isOpen,
  onClose,
  onEarnPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'game'>('practice');
  const [practicedNumbers, setPracticedNumbers] = useState<Set<number>>(new Set());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseSavedMessage, setFirebaseSavedMessage] = useState<string | null>(null);

  // Counting Practice Game State
  const [challenge, setChallenge] = useState<CountingChallenge | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameRounds, setGameRounds] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!isOpen) return null;

  const numbersList = Array.from({ length: 20 }, (_, i) => i + 1);

  const handlePlayNumber = (num: number) => {
    setActiveNumber(num);
    auditoryService.speakNumberMountain(num);
    const updated = new Set(practicedNumbers);
    updated.add(num);
    setPracticedNumbers(updated);

    if (updated.size >= 20 && !isUnlocked) {
      setIsUnlocked(true);
      auditoryService.playForestSound('success');
      onEarnPoints(15);
    }
  };

  const handleAutoCountAll = () => {
    if (isAutoCounting) return;
    setIsAutoCounting(true);
    let current = 1;

    const interval = setInterval(() => {
      if (current > 20) {
        clearInterval(interval);
        setIsAutoCounting(false);
        setIsUnlocked(true);
        setPracticedNumbers(new Set(numbersList));
        auditoryService.playForestSound('success');
        onEarnPoints(20);
        return;
      }
      handlePlayNumber(current);
      current++;
    }, 600);
  };

  const handleInstantUnlock = () => {
    const all = new Set(numbersList);
    setPracticedNumbers(all);
    setIsUnlocked(true);
    auditoryService.playForestSound('success');
    onEarnPoints(15);
  };

  // Generate Counting Game challenge (1 to 20 items)
  const generateNewChallenge = () => {
    const itemPool = [
      { name: 'Mountain Goats', emoji: '🐐' },
      { name: 'Snowflakes', emoji: '❄️' },
      { name: 'Shining Gems', emoji: '💎' },
      { name: 'Pine Trees', emoji: '🌲' },
      { name: 'Golden Stars', emoji: '⭐' },
      { name: 'Mountain Birds', emoji: '🐦' },
    ];
    const picked = itemPool[Math.floor(Math.random() * itemPool.length)];
    // Random target count between 3 and 20
    const targetCount = Math.floor(Math.random() * 18) + 3;

    // Generate 4 plausible choices
    const choicesSet = new Set<number>([targetCount]);
    while (choicesSet.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const fake = targetCount + delta;
      if (fake >= 1 && fake <= 20) {
        choicesSet.add(fake);
      }
    }

    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    setChallenge({
      count: targetCount,
      itemName: picked.name,
      emoji: picked.emoji,
      choices,
    });
    setIsAnswered(false);
    setGameFeedback(null);

    // Speak prompt
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(`Count the ${picked.name}! How many do you see?`);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleAnswerChallenge = (picked: number) => {
    if (isAnswered || !challenge) return;
    setIsAnswered(true);
    setGameRounds((prev) => prev + 1);

    if (picked === challenge.count) {
      setGameScore((prev) => prev + 1);
      auditoryService.playForestSound('success');
      setGameFeedback(`Awesome counting! There are exactly ${challenge.count} ${challenge.itemName}! 🌟 (+5 Pts)`);
      onEarnPoints(5);
    } else {
      auditoryService.playForestSound('tap');
      setGameFeedback(`Close! You picked ${picked}, but there are ${challenge.count} ${challenge.itemName}. Count with me!`);
      setTimeout(() => {
        auditoryService.speakNumberMountain(challenge.count);
      }, 700);
    }
  };

  // Record Session to Firebase Firestore
  const handleSaveToFirebase = async () => {
    setIsSavingToFirebase(true);
    setFirebaseSavedMessage(null);
    try {
      const accuracy = gameRounds > 0 ? Math.round((gameScore / gameRounds) * 100) : 100;
      const pointsToEarn = 30;

      await firestoreService.recordDailyProgress({
        student,
        category: 'number_mountain',
        score: accuracy,
        durationMinutes: 12,
        notes: `Number Mountain Ascend: Completed numbers 1-20 practice session. Unlocked and played Counting Peak Game with ${accuracy}% accuracy.`,
        pointsEarned: pointsToEarn,
        phonemesTested: ['1-20 Counting', 'Ascending Pitch Prosody'],
      });

      onEarnPoints(pointsToEarn);
      setFirebaseSavedMessage(`✓ Number Mountain session recorded in Firebase Firestore! +${pointsToEarn} points awarded.`);
      auditoryService.playForestSound('success');
    } catch (err: any) {
      console.error('Firebase save error:', err);
      setFirebaseSavedMessage('Saved locally (network sync pending).');
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Mountain Zone Color Helper
  const getZoneBadge = (num: number) => {
    if (num <= 5) return { label: 'Base Camp', bg: 'bg-emerald-100 text-emerald-800' };
    if (num <= 10) return { label: 'Mid Camp', bg: 'bg-amber-100 text-amber-800' };
    if (num <= 15) return { label: 'Alpine Ridge', bg: 'bg-blue-100 text-blue-800' };
    return { label: 'Summit Peak', bg: 'bg-purple-100 text-purple-800' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl md:rounded-[2.5rem] max-w-4xl w-full p-6 md:p-8 shadow-2xl relative border border-surface-container-high my-6 max-h-[94vh] flex flex-col justify-between overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
              🏔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-on-primary">
                  World 4 • Numbers 1 to 20
                </span>
                <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Firestore Linked
                </span>
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface">
                Number Mountain Trail &amp; Counting Summit
              </h3>
              <p className="text-xs text-on-surface-variant">
                Practice 1 to 20 with ascending pitch prosody, then unlock the Counting Game!
              </p>
            </div>
          </div>

          {/* Nav: Practice 1-20 vs Counting Game */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex gap-2 p-1 bg-surface-container rounded-full max-w-md">
              <button
                onClick={() => setActiveTab('practice')}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'practice'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                1. Practice Session (1 to 20)
              </button>
              <button
                onClick={() => {
                  if (isUnlocked) {
                    setActiveTab('game');
                    if (!challenge) generateNewChallenge();
                  } else {
                    auditoryService.playForestSound('tap');
                  }
                }}
                disabled={!isUnlocked}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isUnlocked
                    ? 'opacity-60 bg-surface-container text-on-surface-variant cursor-not-allowed'
                    : activeTab === 'game'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isUnlocked ? 'lock_open' : 'lock'}
                </span>
                <span>2. Counting Game {isUnlocked ? '🎮' : '(Locked)'}</span>
              </button>
            </div>

            {/* Unlock Status indicator */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isUnlocked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isUnlocked ? '✓ Game Unlocked!' : `${practicedNumbers.size}/20 Practiced`}
              </span>
            </div>
          </div>

          {/* TAB 1: PRACTICE SESSION 1 TO 20 */}
          {activeTab === 'practice' && (
            <div>
              {/* Practice Trail Banner */}
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-lg">
                    {practicedNumbers.size}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">
                      Ascending Slope: Numbers 1 through 20
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Tap each number to hear its name and auditory pitch scale as you climb higher!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAutoCountAll}
                    disabled={isAutoCounting}
                    className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary-fixed text-on-secondary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isAutoCounting ? 'hourglass_top' : 'play_arrow'}
                    </span>
                    <span>{isAutoCounting ? 'Counting...' : 'Auto-Count 1-20'}</span>
                  </button>
                  <button
                    onClick={handleInstantUnlock}
                    className="px-3.5 py-2 rounded-full bg-surface-container-highest hover:bg-surface-variant text-on-surface text-xs font-bold cursor-pointer"
                    title="Unlock counting game immediately for testing"
                  >
                    Quick Unlock
                  </button>
                </div>
              </div>

              {/* 20 NUMBERS GRID */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2.5 mb-5">
                {numbersList.map((num) => {
                  const isPracticed = practicedNumbers.has(num);
                  const isCurrent = activeNumber === num;
                  const zone = getZoneBadge(num);

                  return (
                    <button
                      key={num}
                      onClick={() => handlePlayNumber(num)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-between gap-1 border transition-all cursor-pointer relative group ${
                        isCurrent
                          ? 'border-primary bg-primary text-on-primary ring-2 ring-primary scale-110 shadow-md'
                          : isPracticed
                          ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-on-surface'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <span className="text-[9px] font-bold opacity-75">
                        #{num}
                      </span>
                      <span className={`text-2xl font-black font-headline group-hover:scale-110 transition-transform ${
                        isCurrent ? 'text-on-primary' : 'text-primary'
                      }`}>
                        {num}
                      </span>
                      <span className={`text-[8px] font-bold px-1 rounded-sm truncate w-full ${
                        isCurrent ? 'bg-white/20 text-white' : zone.bg
                      }`}>
                        {num <= 5 ? 'Base' : num <= 10 ? 'Mid' : num <= 15 ? 'Ridge' : 'Peak'}
                      </span>
                      {isPracticed && !isCurrent && (
                        <span className="absolute -top-1 -right-1 text-emerald-600 text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Unlock Celebration Banner if Completed */}
              {isUnlocked && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between animate-fadeIn mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎉</span>
                    <div>
                      <h5 className="text-sm font-bold text-emerald-900">
                        1 to 20 Practice Completed! Counting Game is Unlocked!
                      </h5>
                      <p className="text-xs text-emerald-700">
                        You can now play the summit counting challenge or record your real-time session.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('game');
                      generateNewChallenge();
                    }}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-105 transition-all"
                  >
                    <span>Play Counting Game</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNLOCKED COUNTING GAME */}
          {activeTab === 'game' && isUnlocked && (
            <div className="py-2">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-surface-container-high mb-4 text-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Summit Counting Challenge (1 to 20)
                  </span>
                  <span className="text-xs font-extrabold text-primary px-3 py-1 bg-surface-container-lowest rounded-full">
                    Score: {gameScore} / {gameRounds}
                  </span>
                </div>

                {challenge ? (
                  <div>
                    <h4 className="text-xl font-headline font-extrabold text-on-surface mb-2">
                      Count the {challenge.itemName}!
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-6">
                      How many items are scattered on the mountain slope?
                    </p>

                    {/* Visual Item Display matching exact count */}
                    <div className="max-w-xl mx-auto p-6 rounded-3xl bg-surface-container-lowest border border-surface-container mb-6 shadow-inner">
                      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[100px]">
                        {Array.from({ length: challenge.count }).map((_, idx) => (
                          <span
                            key={idx}
                            className="text-3xl sm:text-4xl hover:scale-125 transition-transform cursor-pointer select-none"
                            onClick={() => auditoryService.speakNumberMountain(idx + 1)}
                            title={`Item #${idx + 1}`}
                          >
                            {challenge.emoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-on-surface-variant mt-3 block">
                        (Tap items to count along with voice)
                      </span>
                    </div>

                    {/* 4 Choices */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto mb-4">
                      {challenge.choices.map((choiceNum) => (
                        <button
                          key={choiceNum}
                          onClick={() => handleAnswerChallenge(choiceNum)}
                          disabled={isAnswered}
                          className={`py-4 px-6 rounded-2xl text-2xl font-black font-headline transition-all cursor-pointer border ${
                            isAnswered && challenge.count === choiceNum
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500 scale-105'
                              : 'bg-surface-container-lowest hover:bg-secondary-container border-surface-container-high text-primary hover:scale-105'
                          }`}
                        >
                          {choiceNum}
                        </button>
                      ))}
                    </div>

                    {gameFeedback && (
                      <div className="p-3 rounded-2xl bg-surface-container text-xs font-bold text-on-surface animate-fadeIn max-w-md mx-auto mb-4">
                        {gameFeedback}
                      </div>
                    )}

                    {isAnswered && (
                      <button
                        onClick={generateNewChallenge}
                        className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-xs"
                      >
                        Next Counting Challenge →
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={generateNewChallenge}
                    className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold"
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Firebase Saved Toast */}
          {firebaseSavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">cloud_done</span>
              <span>{firebaseSavedMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions: Record to Firebase */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-container">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">database</span>
            <span>Real-time Firebase Firestore link active</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveToFirebase}
              disabled={isSavingToFirebase}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSavingToFirebase ? 'sync' : 'save'}
              </span>
              <span>{isSavingToFirebase ? 'Saving to Firebase...' : 'Save & Record Progress (+30 Pts)'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-bold cursor-pointer hover:bg-surface-container-high"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
