import React, { useState } from 'react';
import {
  Trees,
  Volume2,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  RotateCcw,
  VolumeX,
  Compass,
  Smile,
  Zap,
} from 'lucide-react';
import { Student, TherapySession } from '../types';
import { auditoryService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface ListeningForestProps {
  student: Student;
  onSaveSession: (session: TherapySession) => Promise<void>;
}

interface ForestChallenge {
  id: number;
  prompt: string;
  soundType: 'bird' | 'water' | 'leaves' | 'chime';
  soundLabel: string;
  correctOptionId: string;
  options: {
    id: string;
    title: string;
    emoji: string;
    frequencyHint: string;
    phonemeEquivalent: string;
  }[];
}

const FOREST_CHALLENGES: ForestChallenge[] = [
  {
    id: 1,
    prompt: 'Listen to the treetop rustle! Who is singing in the high branches?',
    soundType: 'bird',
    soundLabel: 'Melodic Robin Chirp',
    correctOptionId: 'bird',
    options: [
      { id: 'bird', title: 'Golden Robin', emoji: '🐦', frequencyHint: 'High Freq (2800 Hz)', phonemeEquivalent: '/ee/' },
      { id: 'frog', title: 'Deep Bullfrog', emoji: '🐸', frequencyHint: 'Low Freq (200 Hz)', phonemeEquivalent: '/m/' },
      { id: 'water', title: 'River Ripple', emoji: '🌊', frequencyHint: 'Broadband', phonemeEquivalent: '/sh/' },
    ],
  },
  {
    id: 2,
    prompt: 'Hark! The gentle river whispers as it flows over smooth stones.',
    soundType: 'water',
    soundLabel: 'Whispering Stream',
    correctOptionId: 'water',
    options: [
      { id: 'leaves', title: 'Autumn Breeze', emoji: '🍂', frequencyHint: 'Mid Noise', phonemeEquivalent: '/sh/' },
      { id: 'water', title: 'Whispering Brook', emoji: '💧', frequencyHint: 'Continuous Water', phonemeEquivalent: '/sh/' },
      { id: 'owl', title: 'Night Owl Hoot', emoji: '🦉', frequencyHint: 'Low Formant', phonemeEquivalent: '/oo/' },
    ],
  },
  {
    id: 3,
    prompt: 'Listen closely to the gentle rustle across the forest floor.',
    soundType: 'leaves',
    soundLabel: 'Dry Leaves in Breeze',
    correctOptionId: 'leaves',
    options: [
      { id: 'leaves', title: 'Squirrel in the Leaves', emoji: '🐿️', frequencyHint: 'High Friction', phonemeEquivalent: '/s/' },
      { id: 'bird', title: 'Sparrow Chirp', emoji: '🐤', frequencyHint: 'High Tonal', phonemeEquivalent: '/ee/' },
      { id: 'bear', title: 'Bear Growl', emoji: '🐻', frequencyHint: 'Low Resonant', phonemeEquivalent: '/ah/' },
    ],
  },
];

export const ListeningForest: React.FC<ListeningForestProps> = ({
  student,
  onSaveSession,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stars, setStars] = useState(0);

  const currentChallenge = FOREST_CHALLENGES[currentStepIndex];

  const handlePlayPromptSound = () => {
    setIsPlaying(true);
    auditoryService.playForestSound(currentChallenge.soundType);
    setTimeout(() => setIsPlaying(false), 800);
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(optId);

    const isCorrect = optId === currentChallenge.correctOptionId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStars((prev) => prev + 1);
      auditoryService.playForestSound('success');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      auditoryService.playForestSound('tap');
    }
  };

  const handleNextChallenge = async () => {
    if (currentStepIndex + 1 < FOREST_CHALLENGES.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Game completed
      setIsCompleted(true);
      const finalScore = Math.round(((score + 1) / FOREST_CHALLENGES.length) * 100);
      const sessionData: TherapySession = {
        id: `forest-sess-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        date: new Date().toISOString(),
        durationMinutes: 20,
        category: 'listening_forest',
        score: finalScore,
        notes: `Completed Listening Forest adventure. Discriminated bird chirps, gentle stream, and rustling leaves. Score: ${finalScore}%.`,
        attended: true,
      };
      await onSaveSession(sessionData);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setScore(0);
    setStars(0);
    setSelectedOption(null);
    setIsCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Forest Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-green-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Trees className="w-3.5 h-3.5" />
              <span>Interactive Auditory Discrimination Game</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              The Listening Forest 🌲
            </h1>
            <p className="text-emerald-200/90 text-sm mt-1 max-w-xl">
              Encouraging active listening, selective attention, and acoustic sound discrimination in pediatric speech therapy.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                <span>{stars}</span>
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <span className="text-[10px] text-emerald-200 font-bold uppercase">Stars Earned</span>
            </div>
            <div className="h-8 w-px bg-white/20 mx-2" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-300">
                {currentStepIndex + 1}/{FOREST_CHALLENGES.length}
              </div>
              <span className="text-[10px] text-emerald-200 font-bold uppercase">Trail Stage</span>
            </div>
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
          {/* Prompt banner */}
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Stage {currentChallenge.id} • Auditory Sound Quest
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {currentChallenge.prompt}
            </h2>

            {/* Big Sound Play Button */}
            <div className="py-6 flex flex-col items-center">
              <button
                onClick={handlePlayPromptSound}
                className={`w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 border-4 border-white ${
                  isPlaying ? 'ring-8 ring-emerald-300 animate-pulse' : ''
                }`}
              >
                <Volume2 className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Play Sound</span>
              </button>
              <p className="text-xs text-slate-400 font-semibold mt-3">
                Tap button to hear the forest sound
              </p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            {currentChallenge.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.id === currentChallenge.correctOptionId;
              let borderStyle = 'border-slate-200 hover:border-emerald-400 bg-slate-50';

              if (selectedOption !== null) {
                if (isCorrect) {
                  borderStyle = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400';
                } else if (isSelected) {
                  borderStyle = 'border-rose-400 bg-rose-50';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={selectedOption !== null}
                  className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between ${borderStyle}`}
                >
                  <div className="text-5xl mb-3">{opt.emoji}</div>
                  <div className="text-base font-bold text-slate-800">{opt.title}</div>
                  <div className="mt-2 space-y-1">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {opt.frequencyHint}
                    </span>
                    <div className="text-xs font-semibold text-emerald-700">
                      Phoneme target: {opt.phonemeEquivalent}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="mt-8 text-center animate-fadeIn">
              <button
                onClick={handleNextChallenge}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>Continue Forest Trail</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto border border-emerald-100 shadow-xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-lg">
            <Trophy className="w-10 h-10 text-amber-900" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800">Forest Expedition Completed!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Outstanding auditory listening practice for {student.name}.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex justify-around">
            <div>
              <div className="text-2xl font-black text-emerald-800">{stars} / 3</div>
              <div className="text-xs text-emerald-600 font-semibold">Stars Earned</div>
            </div>
            <div className="h-10 w-px bg-emerald-200" />
            <div>
              <div className="text-2xl font-black text-emerald-800">
                {Math.round((score / FOREST_CHALLENGES.length) * 100)}%
              </div>
              <div className="text-xs text-emerald-600 font-semibold">Discrimination Rate</div>
            </div>
            <div className="h-10 w-px bg-emerald-200" />
            <div>
              <div className="text-2xl font-black text-amber-600">🔥 +1</div>
              <div className="text-xs text-amber-700 font-semibold">Daily Streak</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
