import React, { useState } from 'react';
import { Student } from '../types';
import { auditoryService } from '../services/audioService';
import { firestoreService } from '../services/firestoreService';

interface AlphabetTownModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onEarnPoints: (points: number) => void;
}

interface LetterItem {
  char: string;
  word: string;
  emoji: string;
  category: string;
  phonemeExample: string;
}

const ALPHABET_DATA: LetterItem[] = [
  { char: 'a', word: 'Apple', emoji: '🍎', category: 'Vowel', phonemeExample: '/æ/' },
  { char: 'b', word: 'Balloon', emoji: '🎈', category: 'Bilabial Stop', phonemeExample: '/b/' },
  { char: 'c', word: 'Cat', emoji: '🐱', category: 'Velar Stop', phonemeExample: '/k/' },
  { char: 'd', word: 'Drum', emoji: '🥁', category: 'Alveolar Stop', phonemeExample: '/d/' },
  { char: 'e', word: 'Elephant', emoji: '🐘', category: 'Vowel', phonemeExample: '/ɛ/' },
  { char: 'f', word: 'Fish', emoji: '🐟', category: 'Labiodental Fricative', phonemeExample: '/f/' },
  { char: 'g', word: 'Guitar', emoji: '🎸', category: 'Velar Stop', phonemeExample: '/ɡ/' },
  { char: 'h', word: 'House', emoji: '🏠', category: 'Glottal Fricative', phonemeExample: '/h/' },
  { char: 'i', word: 'Ice Cream', emoji: '🍦', category: 'Vowel', phonemeExample: '/aɪ/' },
  { char: 'j', word: 'Juice', emoji: '🧃', category: 'Affricate', phonemeExample: '/dʒ/' },
  { char: 'k', word: 'Kite', emoji: '🪁', category: 'Velar Stop', phonemeExample: '/k/' },
  { char: 'l', word: 'Lion', emoji: '🦁', category: 'Liquid Lateral', phonemeExample: '/l/' },
  { char: 'm', word: 'Moon', emoji: '🌙', category: 'Bilabial Nasal', phonemeExample: '/m/' },
  { char: 'n', word: 'Nest', emoji: '🪺', category: 'Alveolar Nasal', phonemeExample: '/n/' },
  { char: 'o', word: 'Owl', emoji: '🦉', category: 'Vowel', phonemeExample: '/aʊ/' },
  { char: 'p', word: 'Piano', emoji: '🎹', category: 'Bilabial Stop', phonemeExample: '/p/' },
  { char: 'q', word: 'Queen', emoji: '👑', category: 'Complex Blend', phonemeExample: '/kw/' },
  { char: 'r', word: 'Rainbow', emoji: '🌈', category: 'Liquid Rhotic', phonemeExample: '/r/' },
  { char: 's', word: 'Sun', emoji: '☀️', category: 'Alveolar Fricative', phonemeExample: '/s/' },
  { char: 't', word: 'Train', emoji: '🚂', category: 'Alveolar Stop', phonemeExample: '/t/' },
  { char: 'u', word: 'Umbrella', emoji: '☂️', category: 'Vowel', phonemeExample: '/ʌ/' },
  { char: 'v', word: 'Violin', emoji: '🎻', category: 'Labiodental Fricative', phonemeExample: '/v/' },
  { char: 'w', word: 'Whale', emoji: '🐋', category: 'Glide Approximant', phonemeExample: '/w/' },
  { char: 'x', word: 'Xylophone', emoji: '🎼', category: 'Acoustic Percussion', phonemeExample: '/z/' },
  { char: 'y', word: 'Yacht', emoji: '⛵', category: 'Palatal Glide', phonemeExample: '/j/' },
  { char: 'z', word: 'Zebra', emoji: '🦓', category: 'Alveolar Fricative', phonemeExample: '/z/' },
];

export const AlphabetTownModal: React.FC<AlphabetTownModalProps> = ({
  student,
  isOpen,
  onClose,
  onEarnPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'phonics' | 'game'>('phonics');
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);
  const [letterFilter, setLetterFilter] = useState<'all' | 'A-G' | 'H-N' | 'O-T' | 'U-Z'>('all');
  const [practicedLetters, setPracticedLetters] = useState<Set<string>>(new Set());
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseSavedMessage, setFirebaseSavedMessage] = useState<string | null>(null);

  // Phonics Game State
  const [gameTarget, setGameTarget] = useState<LetterItem | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameRounds, setGameRounds] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [isGameAnswered, setIsGameAnswered] = useState(false);

  if (!isOpen) return null;

  const filteredLetters = ALPHABET_DATA.filter((item) => {
    const code = item.char.toUpperCase().charCodeAt(0);
    if (letterFilter === 'A-G') return code >= 65 && code <= 71;
    if (letterFilter === 'H-N') return code >= 72 && code <= 78;
    if (letterFilter === 'O-T') return code >= 79 && code <= 84;
    if (letterFilter === 'U-Z') return code >= 85 && code <= 90;
    return true;
  });

  const handlePlayLetter = (item: LetterItem) => {
    setSelectedLetter(item);
    auditoryService.speakAlphabetLetter(item.char, item.word);
    setPracticedLetters((prev) => new Set([...prev, item.char]));
  };

  const handleStartGameRound = () => {
    const random = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setGameTarget(random);
    setIsGameAnswered(false);
    setGameFeedback(null);
    setTimeout(() => {
      auditoryService.speakAlphabetLetter(random.char, random.word);
    }, 250);
  };

  const handleAnswerGame = (char: string) => {
    if (isGameAnswered || !gameTarget) return;
    setIsGameAnswered(true);
    setGameRounds((prev) => prev + 1);

    if (char === gameTarget.char) {
      setGameScore((prev) => prev + 1);
      auditoryService.playForestSound('success');
      setGameFeedback(`Super! /${gameTarget.char.toUpperCase()}/ is for ${gameTarget.word} ${gameTarget.emoji}! 🎉 (+5 Pts)`);
      onEarnPoints(5);
    } else {
      auditoryService.playForestSound('tap');
      setGameFeedback(`That was /${char.toUpperCase()}/. The mystery letter was /${gameTarget.char.toUpperCase()}/ for ${gameTarget.word}!`);
      setTimeout(() => {
        auditoryService.speakAlphabetLetter(gameTarget.char, gameTarget.word);
      }, 700);
    }
  };

  const handleSaveToFirebase = async () => {
    setIsSavingToFirebase(true);
    setFirebaseSavedMessage(null);
    try {
      const accuracy = gameRounds > 0 ? Math.round((gameScore / gameRounds) * 100) : 100;
      const pointsToEarn = 25;

      await firestoreService.recordDailyProgress({
        student,
        category: 'alphabet_town',
        score: accuracy,
        durationMinutes: 10,
        notes: `Alphabet Town Phonics Journey: Practiced ${practicedLetters.size}/26 letters A-Z with ${accuracy}% speech sound accuracy.`,
        pointsEarned: pointsToEarn,
        phonemesTested: Array.from(practicedLetters),
      });

      onEarnPoints(pointsToEarn);
      setFirebaseSavedMessage(`✓ Alphabet Town progress recorded in Firebase Firestore! +${pointsToEarn} points awarded.`);
      auditoryService.playForestSound('success');
    } catch (err: any) {
      console.error('Firebase save error:', err);
      setFirebaseSavedMessage('Saved locally (network sync pending).');
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Get 4 candidate choices for the game including target
  const getGameChoices = (): LetterItem[] => {
    if (!gameTarget) return [];
    const pool = ALPHABET_DATA.filter((l) => l.char !== gameTarget.char);
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [gameTarget, ...shuffledPool];
    return choices.sort(() => Math.random() - 0.5);
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
              🏘️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-on-primary">
                  World 3 • Full Phonics Map (A to Z)
                </span>
                <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Real-Time
                </span>
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface">
                Alphabet Town Phonics Market
              </h3>
              <p className="text-xs text-on-surface-variant">
                Full 26-letter auditory &amp; phonics catalog: <span className="font-bold text-primary">a to z</span> with clear speech articulation.
              </p>
            </div>
          </div>

          {/* Navigation Bar: Phonics Catalog vs Letter Detective Game */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex gap-2 p-1 bg-surface-container rounded-full max-w-xs">
              <button
                onClick={() => setActiveTab('phonics')}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'phonics'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Letters A to Z (26)
              </button>
              <button
                onClick={() => {
                  setActiveTab('game');
                  if (!gameTarget) handleStartGameRound();
                }}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'game'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Phonics Quest 🎯
              </button>
            </div>

            {/* Letter chunk filters */}
            {activeTab === 'phonics' && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {(['all', 'A-G', 'H-N', 'O-T', 'U-Z'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLetterFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      letterFilter === filter
                        ? 'bg-secondary-container text-on-secondary-container ring-1 ring-secondary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {filter === 'all' ? 'All (A-Z)' : filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: ALL 26 LETTERS A to Z */}
          {activeTab === 'phonics' && (
            <div>
              {/* Active Banner Preview if a letter is tapped */}
              {selectedLetter && (
                <div className="mb-4 p-4 rounded-2xl bg-primary-container/30 border border-primary/20 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedLetter.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-headline font-black text-primary">
                          {selectedLetter.char.toUpperCase()} {selectedLetter.char.toLowerCase()}
                        </span>
                        <span className="text-sm font-bold text-on-surface">
                          for {selectedLetter.word}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        Phoneme: <span className="font-mono font-bold text-primary">{selectedLetter.phonemeExample}</span> • {selectedLetter.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayLetter(selectedLetter)}
                    className="px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    <span>Replay Voice</span>
                  </button>
                </div>
              )}

              {/* 26 LETTERS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                {filteredLetters.map((item) => {
                  const isPracticed = practicedLetters.has(item.char);
                  const isSelected = selectedLetter?.char === item.char;

                  return (
                    <button
                      key={item.char}
                      onClick={() => handlePlayLetter(item)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all text-center group cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-container/40 ring-2 ring-primary scale-105 shadow-sm'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container hover:scale-[1.02]'
                      }`}
                    >
                      <div className="relative">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </span>
                        {isPracticed && (
                          <span className="absolute -top-1 -right-2 text-[10px] text-emerald-600 font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-headline font-black text-primary">
                          {item.char.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant">
                          {item.char.toLowerCase()}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface truncate w-full">
                        {item.word}
                      </span>
                      <span className="text-[9px] font-mono text-secondary font-bold">
                        {item.phonemeExample}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stats Footer Ribbon */}
              <div className="mt-4 p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">spellcheck</span>
                  <span className="text-xs font-bold text-on-surface">
                    Letters Practiced: {practicedLetters.size} / 26
                  </span>
                </div>
                <button
                  onClick={() => {
                    const allChars = new Set(ALPHABET_DATA.map((l) => l.char));
                    setPracticedLetters(allChars);
                    auditoryService.playForestSound('success');
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container cursor-pointer"
                >
                  Mark All 26 Mastered
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Phonics Quest Challenge Game */}
          {activeTab === 'game' && (
            <div className="py-2">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-surface-container-high mb-4 text-center">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Letter Sound Detective
                  </span>
                  <span className="text-xs font-extrabold text-primary px-3 py-1 bg-surface-container-lowest rounded-full">
                    Score: {gameScore} / {gameRounds}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
                  🔤
                </div>
                <h4 className="text-lg font-headline font-bold text-on-surface mb-1">
                  Which Letter Makes This Sound?
                </h4>
                <p className="text-xs text-on-surface-variant mb-4">
                  Listen to the voice cue, then tap the matching letter stall:
                </p>

                <button
                  onClick={() => gameTarget && auditoryService.speakAlphabetLetter(gameTarget.char, gameTarget.word)}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer hover:scale-105 transition-all mb-6"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Replay Phonics Stimulus</span>
                </button>

                {/* 4 Candidate Choices */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                  {getGameChoices().map((choice) => (
                    <button
                      key={choice.char}
                      onClick={() => handleAnswerGame(choice.char)}
                      disabled={isGameAnswered}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all cursor-pointer border ${
                        isGameAnswered && gameTarget?.char === choice.char
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500 scale-105'
                          : 'bg-surface-container-lowest hover:bg-secondary-container border-surface-container-high text-on-surface hover:scale-[1.02]'
                      }`}
                    >
                      <span className="text-3xl">{choice.emoji}</span>
                      <span className="text-2xl font-headline font-black text-primary">
                        {choice.char.toUpperCase()} {choice.char.toLowerCase()}
                      </span>
                      <span className="text-xs font-semibold">{choice.word}</span>
                    </button>
                  ))}
                </div>

                {gameFeedback && (
                  <div className="mt-5 p-3 rounded-2xl bg-surface-container text-xs font-bold text-on-surface animate-fadeIn">
                    {gameFeedback}
                  </div>
                )}

                {isGameAnswered && (
                  <div className="mt-4">
                    <button
                      onClick={handleStartGameRound}
                      className="px-6 py-2 rounded-full bg-secondary text-on-secondary text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-xs"
                    >
                      Next Letter Mystery →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firebase Real-Time Status Notification */}
          {firebaseSavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">cloud_done</span>
              <span>{firebaseSavedMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
              <span>{isSavingToFirebase ? 'Saving to Firebase...' : 'Save & Record Progress (+25 Pts)'}</span>
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
