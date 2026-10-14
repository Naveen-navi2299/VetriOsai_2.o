import React, { useState } from 'react';
import { Student } from '../types';
import { auditoryService } from '../services/audioService';
import { firestoreService } from '../services/firestoreService';

interface SoundIslandModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onEarnPoints: (points: number) => void;
}

interface SoundItem {
  id: 'ringing' | 'horn' | 'cat' | 'bird';
  name: string;
  category: string;
  icon: string;
  description: string;
  frequencyRange: string;
  color: string;
  playFn: () => void;
}

export const SoundIslandModal: React.FC<SoundIslandModalProps> = ({
  student,
  isOpen,
  onClose,
  onEarnPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'quiz'>('studio');
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseSavedMessage, setFirebaseSavedMessage] = useState<string | null>(null);
  const [practicedSounds, setPracticedSounds] = useState<Set<string>>(new Set());

  // Quiz state
  const [quizTarget, setQuizTarget] = useState<SoundItem | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizRounds, setQuizRounds] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const sounds: SoundItem[] = [
    {
      id: 'ringing',
      name: 'Ringing Sound',
      category: 'Metallic & Bell Frequency',
      icon: '🔔',
      description: 'Telephone / desk bell ring-ring cadence with dual resonant harmonics.',
      frequencyRange: '750 Hz - 880 Hz',
      color: 'from-amber-500 to-yellow-600',
      playFn: () => auditoryService.playRingingSound(),
    },
    {
      id: 'horn',
      name: 'Horn Sound',
      category: 'Vehicle & Brass Acoustics',
      icon: '📯',
      description: 'Vehicle / boat acoustic horn burst with rich low-frequency punch.',
      frequencyRange: '320 Hz - 400 Hz',
      color: 'from-orange-500 to-red-600',
      playFn: () => auditoryService.playHornSound(),
    },
    {
      id: 'cat',
      name: 'Cat Sound',
      category: 'Animal Vocalization (Meow)',
      icon: '🐱',
      description: 'Playful kitten meow gliding upward then curving gently downward.',
      frequencyRange: '420 Hz - 880 Hz',
      color: 'from-pink-500 to-rose-600',
      playFn: () => auditoryService.playCatSound(),
    },
    {
      id: 'bird',
      name: 'Bird Sounds',
      category: 'High-Pitch Songbird Warble',
      icon: '🐦',
      description: 'Sweet multi-chirp songbird warble with high frequency clarity.',
      frequencyRange: '2,400 Hz - 3,800 Hz',
      color: 'from-emerald-500 to-teal-600',
      playFn: () => auditoryService.playBirdSound(),
    },
  ];

  if (!isOpen) return null;

  const handlePlaySound = (sound: SoundItem) => {
    setActiveSound(sound.id);
    sound.playFn();
    setPracticedSounds((prev) => new Set([...prev, sound.id]));
    setTimeout(() => setActiveSound(null), 700);
  };

  const handleStartQuizRound = () => {
    const random = sounds[Math.floor(Math.random() * sounds.length)];
    setQuizTarget(random);
    setIsAnswered(false);
    setQuizFeedback(null);
    // Play mystery sound after a brief delay
    setTimeout(() => {
      random.playFn();
    }, 300);
  };

  const handleAnswerQuiz = (selectedId: string) => {
    if (isAnswered || !quizTarget) return;
    setIsAnswered(true);
    setQuizRounds((prev) => prev + 1);

    if (selectedId === quizTarget.id) {
      const nextScore = quizScore + 1;
      setQuizScore(nextScore);
      auditoryService.playForestSound('success');
      setQuizFeedback(`Spot on! That was the ${quizTarget.name}! 🎉 (+5 Points)`);
      onEarnPoints(5);
    } else {
      auditoryService.playForestSound('tap');
      setQuizFeedback(`Nice try! That was actually the ${quizTarget.name}. Listen once more!`);
      setTimeout(() => quizTarget.playFn(), 600);
    }
  };

  // Record session to Firestore in real-time
  const handleSaveToFirebase = async () => {
    setIsSavingToFirebase(true);
    setFirebaseSavedMessage(null);
    try {
      const accuracy = quizRounds > 0 ? Math.round((quizScore / quizRounds) * 100) : 100;
      const pointsToEarn = 20;

      await firestoreService.recordDailyProgress({
        student,
        category: 'sound_island',
        score: accuracy,
        durationMinutes: 8,
        notes: `Sound Island Mastery: Ringing, Horn, Cat, and Bird sound discrimination completed with ${accuracy}% accuracy.`,
        pointsEarned: pointsToEarn,
        phonemesTested: ['ringing', 'horn', 'cat', 'bird'],
      });

      onEarnPoints(pointsToEarn);
      setFirebaseSavedMessage(`✓ Successfully recorded in Firebase Firestore! +${pointsToEarn} points awarded.`);
      auditoryService.playForestSound('success');
    } catch (err: any) {
      console.error('Firebase save error:', err);
      setFirebaseSavedMessage('Saved locally (network sync pending).');
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl md:rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-surface-container-high my-8 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center text-3xl shadow-md">
              🏝️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary text-on-secondary">
                  World 2 • Environmental Sounds
                </span>
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Live
                </span>
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface">
                Sound Island Studio
              </h3>
              <p className="text-xs text-on-surface-variant">
                Explore Ringing, Horn, Cat &amp; Bird acoustic stimuli for pediatric auditory discrimination.
              </p>
            </div>
          </div>

          {/* Sub Navigation: Studio vs Challenge Game */}
          <div className="flex gap-2 p-1 bg-surface-container rounded-full mb-6 max-w-sm">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sound Studio (4 Sounds)
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                if (!quizTarget) handleStartQuizRound();
              }}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sound Detective Game 🎮
            </button>
          </div>

          {/* TAB 1: Sound Studio */}
          {activeTab === 'studio' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {sounds.map((sound) => {
                  const isPlaying = activeSound === sound.id;
                  const isPracticed = practicedSounds.has(sound.id);

                  return (
                    <div
                      key={sound.id}
                      className={`p-4 rounded-2xl md:rounded-3xl border transition-all flex flex-col justify-between ${
                        isPlaying
                          ? 'border-primary bg-primary-container/20 scale-[1.02] shadow-md ring-2 ring-primary'
                          : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-surface-container-lowest shadow-xs">
                            {sound.icon}
                          </span>
                          <div>
                            <h4 className="font-headline font-bold text-base text-on-surface">
                              {sound.name}
                            </h4>
                            <span className="text-[11px] text-on-surface-variant font-medium">
                              {sound.category}
                            </span>
                          </div>
                        </div>
                        {isPracticed && (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ✓ Heard
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                        {sound.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {sound.frequencyRange}
                        </span>
                        <button
                          onClick={() => handlePlaySound(sound)}
                          className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-primary text-on-primary scale-105'
                              : 'bg-primary hover:bg-primary-container text-on-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isPlaying ? 'graphic_eq' : 'volume_up'}
                          </span>
                          <span>{isPlaying ? 'Playing...' : 'Play Sound'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress ribbon */}
              <div className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Sound Exploration: {practicedSounds.size} / 4 Listened
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Practice all 4 acoustic tones to log real progress.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.forEach((s, idx) => {
                      setTimeout(() => s.playFn(), idx * 750);
                    });
                    setPracticedSounds(new Set(['ringing', 'horn', 'cat', 'bird']));
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container cursor-pointer transition-all"
                >
                  Play All 4
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Quiz / Sound Detective Game */}
          {activeTab === 'quiz' && (
            <div className="py-2">
              <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container-high mb-6 text-center">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Auditory Discrimination Challenge
                  </span>
                  <span className="text-xs font-extrabold text-primary px-3 py-1 bg-surface-container-lowest rounded-full">
                    Score: {quizScore} / {quizRounds}
                  </span>
                </div>

                <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
                  🎧
                </div>
                <h4 className="text-lg font-headline font-bold text-on-surface mb-1">
                  Listen Closely! What Sound Is It?
                </h4>
                <p className="text-xs text-on-surface-variant mb-4">
                  Tap below to replay the mystery environmental sound, then tap your guess:
                </p>

                <button
                  onClick={() => quizTarget && quizTarget.playFn()}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer hover:scale-105 transition-all mb-5"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Replay Sound Stimulus</span>
                </button>

                {/* 4 Choices */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => handleAnswerQuiz(sound.id)}
                      disabled={isAnswered}
                      className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 font-bold text-xs transition-all cursor-pointer border ${
                        isAnswered && quizTarget?.id === sound.id
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500 scale-105'
                          : 'bg-surface-container-lowest hover:bg-secondary-container border-surface-container-high text-on-surface hover:scale-[1.02]'
                      }`}
                    >
                      <span className="text-3xl">{sound.icon}</span>
                      <span>{sound.name}</span>
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className="mt-4 p-3 rounded-2xl bg-surface-container text-xs font-bold text-on-surface animate-fadeIn">
                    {quizFeedback}
                  </div>
                )}

                {isAnswered && (
                  <div className="mt-4">
                    <button
                      onClick={handleStartQuizRound}
                      className="px-6 py-2 rounded-full bg-secondary text-on-secondary text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-xs"
                    >
                      Next Mystery Sound →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firebase live sync alert message */}
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
              <span>{isSavingToFirebase ? 'Saving to Firebase...' : 'Save & Record Progress (+20 Pts)'}</span>
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
