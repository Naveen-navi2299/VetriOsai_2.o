import React, { useState, useRef, useEffect } from 'react';
import { Student, Ling6Phoneme } from '../types';
import { auditoryService } from '../services/audioService';
import { LingCardCustomizerModal } from './LingCardCustomizerModal';
import confetti from 'canvas-confetti';

interface ListeningForestWorldProps {
  student: Student;
  lingDaysPracticed: number;
  initialGame?: 'overview' | 'card_matching' | 'sound_detective';
  onAdvancePracticeDay: () => void;
  onUnlockAllDays?: () => void;
  onEarnPoints: (points: number) => void;
  onBackToHome: () => void;
}

interface MatchCard {
  id: number;
  pairId: string;
  type: 'sound' | 'animal';
  label: string;
  sub: string;
  sound: Ling6Phoneme;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const INITIAL_PAIRS: { pairId: string; sound: Ling6Phoneme; label: string; animalLabel: string; emoji: string }[] = [
  { pairId: 'p-m', sound: 'm', label: 'mmm', animalLabel: 'Ice Cream Boy', emoji: '🍦' },
  { pairId: 'p-oo', sound: 'oo', label: 'Ooo', animalLabel: 'Ghost Friend', emoji: '👻' },
  { pairId: 'p-ah', sound: 'ah', label: 'Aaa', animalLabel: 'Joyful Shout', emoji: '🗣️' },
  { pairId: 'p-ee', sound: 'ee', label: 'Eee', animalLabel: 'Toothbrushing', emoji: '🪥' },
  { pairId: 'p-sh', sound: 'sh', label: 'Shh', animalLabel: 'Sleepy Bear', emoji: '🧸' },
  { pairId: 'p-s', sound: 's', label: 'Sss', animalLabel: 'Friendly Snake', emoji: '🐍' },
];

const DEFAULT_LING_IMAGES: Record<Ling6Phoneme, string> = {
  m: '/images/ling/ling_m.svg',
  oo: '/images/ling/ling_oo.svg',
  ah: '/images/ling/ling_ah.svg',
  ee: '/images/ling/ling_ee.svg',
  sh: '/images/ling/ling_sh.svg',
  s: '/images/ling/ling_s.svg',
};

export const ListeningForestWorld: React.FC<ListeningForestWorldProps> = ({
  student,
  lingDaysPracticed,
  initialGame,
  onAdvancePracticeDay,
  onUnlockAllDays,
  onEarnPoints,
  onBackToHome,
}) => {
  const isUnlocked = lingDaysPracticed >= 5;

  const [activeView, setActiveView] = useState<'overview' | 'card_matching' | 'sound_detective'>(() => {
    if (initialGame && lingDaysPracticed >= 5) {
      return initialGame;
    }
    return 'overview';
  });
  const [testedSounds, setTestedSounds] = useState<Set<Ling6Phoneme>>(new Set());
  const [activePlayingSound, setActivePlayingSound] = useState<Ling6Phoneme | null>(null);

  // Six Ling Sound asset management state
  const [selectedManagerPhoneme, setSelectedManagerPhoneme] = useState<Ling6Phoneme>('m');
  const [customizerModalPhoneme, setCustomizerModalPhoneme] = useState<Ling6Phoneme | null>(null);
  const [, setAssetUpdateCounter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioSuccessToast, setAudioSuccessToast] = useState<string | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Hidden file input refs for asset uploads
  const audioManagerFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageManagerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time audio and image changes from Firestore & localStorage
  useEffect(() => {
    const unsubscribe = auditoryService.subscribe(() => {
      setAssetUpdateCounter((c) => c + 1);
    });
    return () => unsubscribe();
  }, []);

  // CARD MATCHING GAME STATE
  const [cards, setCards] = useState<MatchCard[]>(() => generateDeck());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [movesCount, setMovesCount] = useState(0);

  // SOUND DETECTIVE GAME STATE
  const [detectiveTarget, setDetectiveTarget] = useState<Ling6Phoneme>('ah');
  const [detectiveOptions, setDetectiveOptions] = useState<Ling6Phoneme[]>(['m', 'ah', 's']);
  const [detectiveStreak, setDetectiveStreak] = useState(0);
  const [detectiveAnswerStatus, setDetectiveAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  function generateDeck(): MatchCard[] {
    const rawList: MatchCard[] = [];
    let idCounter = 1;

    INITIAL_PAIRS.forEach((item) => {
      // Sound card
      rawList.push({
        id: idCounter++,
        pairId: item.pairId,
        type: 'sound',
        label: item.label,
        sub: 'Ling Sound',
        sound: item.sound,
        emoji: '🎵',
        isFlipped: false,
        isMatched: false,
      });
      // Animal card
      rawList.push({
        id: idCounter++,
        pairId: item.pairId,
        type: 'animal',
        label: item.animalLabel,
        sub: `Matches ${item.label}`,
        sound: item.sound,
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    return rawList.sort(() => Math.random() - 0.5);
  }

  const handleTestLingSound = (sound: Ling6Phoneme) => {
    setActivePlayingSound(sound);
    auditoryService.playLing6Acoustic(sound);
    setTestedSounds((prev) => new Set(prev).add(sound));
    setTimeout(() => {
      setActivePlayingSound((current) => (current === sound ? null : current));
    }, 1200);
  };

  // Generalized Audio File Upload
  const handleAudioFileUploadForPhoneme = async (phoneme: Ling6Phoneme, file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await auditoryService.setCustomAudio(phoneme, dataUrl, file.name, true);
        setAssetUpdateCounter((c) => c + 1);
        auditoryService.playLing6Acoustic(phoneme);
        setAudioSuccessToast(`Saved "${file.name}" to Firebase database & updated /${phoneme}/ sound!`);
        setTimeout(() => setAudioSuccessToast(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generalized Image File Upload
  const handleImageFileUploadForPhoneme = async (phoneme: Ling6Phoneme, file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await auditoryService.setCustomImage(phoneme, dataUrl, file.name, true);
        setAssetUpdateCounter((c) => c + 1);
        setAudioSuccessToast(`Uploaded custom card illustration for /${phoneme}/!`);
        setTimeout(() => setAudioSuccessToast(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Live Mic Recording for chosen phoneme
  const handleStartRecording = async (phoneme: Ling6Phoneme = selectedManagerPhoneme) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const recordingName = `Voice_Recording_${phoneme.toUpperCase()}_${Date.now().toString().slice(-4)}.webm`;
          await auditoryService.setCustomAudio(phoneme, dataUrl, recordingName, true);
          setAssetUpdateCounter((c) => c + 1);
          auditoryService.playLing6Acoustic(phoneme);
          setAudioSuccessToast(`Voice recording saved to Firebase database for /${phoneme}/!`);
          setTimeout(() => setAudioSuccessToast(null), 5000);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      setAudioSuccessToast('Microphone access was denied or not available.');
      setTimeout(() => setAudioSuccessToast(null), 4000);
    }
  };

  const handleStopRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleResetPhonemeAudio = async (phoneme: Ling6Phoneme) => {
    await auditoryService.removeCustomAudio(phoneme);
    setAssetUpdateCounter((c) => c + 1);
    auditoryService.playLing6Acoustic(phoneme);
    setAudioSuccessToast(`Reset /${phoneme}/ to default authentic sound stimulus.`);
    setTimeout(() => setAudioSuccessToast(null), 4500);
  };

  const handleResetPhonemeImage = async (phoneme: Ling6Phoneme) => {
    await auditoryService.removeCustomImage(phoneme);
    setAssetUpdateCounter((c) => c + 1);
    setAudioSuccessToast(`Reset /${phoneme}/ card image to default illustration.`);
    setTimeout(() => setAudioSuccessToast(null), 4500);
  };

  const handleCompleteDailyPractice = () => {
    if (lingDaysPracticed < 5) {
      onAdvancePracticeDay();
      onEarnPoints(25);
      auditoryService.playForestSound('success');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  // CARD MATCHING HANDLERS
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Play card acoustic sound
    auditoryService.playLing6Acoustic(card.sound);

    const newCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          const nextCount = matchesCount + 1;
          setMatchesCount(nextCount);

          if (nextCount === INITIAL_PAIRS.length) {
            // ALL MATCHED!
            onEarnPoints(50);
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            auditoryService.playForestSound('success');
          } else {
            auditoryService.playForestSound('chime');
            onEarnPoints(10);
          }
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  const handleResetCardGame = () => {
    setCards(generateDeck());
    setFlippedCards([]);
    setMatchesCount(0);
    setMovesCount(0);
  };

  // SOUND DETECTIVE HANDLERS
  const startNewDetectiveRound = () => {
    const allSounds: Ling6Phoneme[] = ['m', 'oo', 'ah', 'ee', 'sh', 's'];
    const target = allSounds[Math.floor(Math.random() * allSounds.length)];
    const others = allSounds.filter((s) => s !== target).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [target, ...others].sort(() => Math.random() - 0.5);

    setDetectiveTarget(target);
    setDetectiveOptions(options);
    setDetectiveAnswerStatus('idle');
  };

  const playDetectiveMysterySound = () => {
    setIsPlayingTarget(true);
    auditoryService.playLing6Acoustic(detectiveTarget);
    setTimeout(() => setIsPlayingTarget(false), 900);
  };

  const handleSelectDetectiveOption = (sound: Ling6Phoneme) => {
    if (detectiveAnswerStatus !== 'idle') return;

    if (sound === detectiveTarget) {
      setDetectiveAnswerStatus('correct');
      setDetectiveStreak((s) => s + 1);
      onEarnPoints(15);
      auditoryService.playForestSound('success');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => {
        startNewDetectiveRound();
      }, 1600);
    } else {
      setDetectiveAnswerStatus('wrong');
      auditoryService.playForestSound('tap');
      setTimeout(() => {
        setDetectiveAnswerStatus('idle');
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Hero */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home Exploration</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-secondary">World 01:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-on-primary">
            Ling-6 Protocol
          </span>
        </div>
      </div>

      {/* Hero Banner for Listening Forest */}
      <section className="bg-gradient-to-r from-secondary-container via-surface-container-high to-surface-container-lowest p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-3xl shadow-sm shrink-0">
            🌲
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-on-primary">
                Acoustic Habilitation
              </span>
              <span className="text-xs font-semibold text-secondary">
                {student.name}'s Forest Trail
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface">
              The Listening Forest
            </h1>
            <p className="text-xs text-on-surface-variant max-w-xl">
              First, practice the 6 fundamental Ling sounds across 5 days to tune the auditory processor. Once calibrated, unlock the interactive Forest Games!
            </p>
          </div>
        </div>

        {/* 5-Day Unlock Meter Badge */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container-high shadow-xs text-center shrink-0 min-w-[200px]">
          <div className="text-xs font-bold uppercase text-on-surface-variant mb-1">
            5-Day Practice Tracker
          </div>
          <div className="text-3xl font-black font-headline text-primary">
            {lingDaysPracticed} / 5 Days
          </div>
          <div className="text-[11px] font-semibold text-secondary mt-1">
            {isUnlocked ? '🎉 Games Unlocked!' : `${5 - lingDaysPracticed} more practice day${5 - lingDaysPracticed > 1 ? 's' : ''} needed`}
          </div>
        </div>
      </section>

      {/* 5-DAY PROGRESS BAR & DAILY PRACTICE STATION */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-surface-container-high/60 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
              <span>5-Day Ling Sound Calibration Requirement</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Consistent daily practice ensures child's cochlear implant or hearing device detects all acoustic formants.
            </p>
          </div>

          {!isUnlocked && (
            <button
              onClick={handleCompleteDailyPractice}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Complete Day {lingDaysPracticed + 1} Practice (+25 Pts)</span>
            </button>
          )}
        </div>

        {/* 5 Day Progress Steps */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5].map((dayNum) => {
            const isCompleted = dayNum <= lingDaysPracticed;
            const isCurrent = dayNum === lingDaysPracticed + 1;

            return (
              <div
                key={dayNum}
                className={`p-3 sm:p-4 rounded-2xl text-center border transition-all ${
                  isCompleted
                    ? 'bg-secondary-container text-on-secondary-container border-secondary-fixed shadow-2xs'
                    : isCurrent
                    ? 'bg-primary-fixed/50 text-primary border-primary ring-2 ring-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant border-surface-container opacity-50'
                }`}
              >
                <div className="text-base sm:text-xl font-black font-headline">Day {dayNum}</div>
                <div className="text-[10px] font-bold mt-1">
                  {isCompleted ? 'Completed ✓' : isCurrent ? 'Next Up' : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Ling Sound Buttons to Test Right Now */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Acoustic Sound Testing Panel
            </span>
            <span className="text-xs text-secondary font-semibold">
              Tested: {testedSounds.size} of 6 sounds
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {(['m', 'oo', 'ah', 'ee', 'sh', 's'] as Ling6Phoneme[]).map((phoneme) => {
              const isTested = testedSounds.has(phoneme);
              const isPlaying = activePlayingSound === phoneme;
              const customImg = auditoryService.getCustomImage(phoneme);
              const imgSrc = customImg || DEFAULT_LING_IMAGES[phoneme];

              return (
                <div key={phoneme} className="group flex flex-col items-center w-full">
                  {/* Large Ling Sound Box Card - Clean Visuals without Badges or Overlay Buttons */}
                  <button
                    type="button"
                    onClick={() => handleTestLingSound(phoneme)}
                    className={`w-full aspect-[3/4] min-h-[320px] sm:min-h-[380px] md:min-h-[440px] rounded-3xl md:rounded-[2.5rem] overflow-hidden border-4 shadow-lg hover:shadow-2xl transition-all duration-300 relative cursor-pointer transform hover:-translate-y-2 active:translate-y-0.5 active:scale-95 flex flex-col items-center justify-center p-0 bg-surface-container-lowest ${
                      isPlaying
                        ? 'ring-4 ring-[#ff622d] ring-offset-4 scale-102 border-[#ff622d] shadow-2xl'
                        : isTested
                        ? 'border-emerald-400 dark:border-emerald-500 shadow-md'
                        : 'border-surface-container-high hover:border-[#ff622d]/70'
                    }`}
                    title={`Tap to play /${phoneme}/ sound`}
                  >
                    {/* Exact Illustration: Uploaded Custom Image or Default */}
                    <img
                      src={imgSrc}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isPlaying ? 'scale-108' : 'group-hover:scale-104'
                      }`}
                    />

                    {/* Tested Status Indicator Badge */}
                    {isTested && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white rounded-full p-2 shadow-lg flex items-center justify-center z-10 animate-bounce">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </div>
                    )}

                    {/* Playing Acoustic Ripple Animation */}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-[#ff622d]/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-fadeIn z-20">
                        <div className="w-24 h-24 rounded-full bg-[#ff622d] text-white flex items-center justify-center shadow-xl animate-ping absolute opacity-40"></div>
                        <div className="w-16 h-16 rounded-full bg-[#ff622d] text-white flex items-center justify-center shadow-xl relative z-10">
                          <span className="material-symbols-outlined text-[32px]">volume_up</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* COMPREHENSIVE 6 LING SOUNDS ASSET & AUDIO MANAGER */}
          <div className="mt-6 p-5 rounded-3xl bg-white border-2 border-slate-100 shadow-sm flex flex-col gap-4">
            {/* Top Bar: Selector Tabs for All 6 Sounds */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff622d] flex items-center justify-center text-base">
                    🎛️
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-800">
                    Six Ling Sounds Manual Audio &amp; Image Manager
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any sound below to replace its audio, record microphone voice, or upload custom card artwork.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCustomizerModalPhoneme(selectedManagerPhoneme)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff622d] to-[#ff4d6d] hover:opacity-95 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-transform active:scale-95"
              >
                <span>🎨 Open Full Card Customizer</span>
              </button>
            </div>

            {/* Phoneme selector pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['m', 'oo', 'ah', 'ee', 'sh', 's'] as Ling6Phoneme[]).map((p) => {
                const isSelected = selectedManagerPhoneme === p;
                const hasAud = auditoryService.hasCustomAudio(p);
                const hasImg = auditoryService.hasCustomImage(p);

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedManagerPhoneme(p)}
                    className={`py-2 px-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#ff622d] bg-[#fff3ec] text-[#ff622d] font-black shadow-sm scale-102'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">/{p}/</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {hasAud && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Custom Audio Active" />}
                      {hasImg && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Custom Image Active" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Sound Details & Action Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Thumbnail Preview */}
                <div className="w-14 h-18 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src={auditoryService.getCustomImage(selectedManagerPhoneme) || DEFAULT_LING_IMAGES[selectedManagerPhoneme]}
                    alt={`/${selectedManagerPhoneme}/ thumbnail`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-800">
                      /{selectedManagerPhoneme}/ Sound
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <span>🎵</span>
                      <span className="max-w-[200px] truncate">
                        {auditoryService.getCustomAudioName(selectedManagerPhoneme) || 'Default Authentic Stimulus'}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Firestore Cloud Synced</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Custom files are saved to Firestore database collections (<code className="text-[#ff622d] font-mono text-[10px]">custom_audio/{selectedManagerPhoneme}</code> &amp; <code className="text-purple-600 font-mono text-[10px]">custom_images/{selectedManagerPhoneme}</code>).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Play Preview */}
                <button
                  type="button"
                  onClick={() => handleTestLingSound(selectedManagerPhoneme)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title={`Play /${selectedManagerPhoneme}/ sound`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ff622d]">volume_up</span>
                  <span>Play /${selectedManagerPhoneme}/</span>
                </button>

                {/* Upload Audio File */}
                <input
                  ref={audioManagerFileInputRef}
                  type="file"
                  accept="audio/*,video/mpeg,video/mp4"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAudioFileUploadForPhoneme(selectedManagerPhoneme, f);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioManagerFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#ff622d] hover:bg-[#f0531c] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Upload audio file"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  <span>Upload Audio</span>
                </button>

                {/* Record Mic */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={() => handleStartRecording(selectedManagerPhoneme)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Record voice with mic"
                  >
                    <span className="material-symbols-outlined text-[16px] text-red-600">mic</span>
                    <span>Record Voice</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-pulse shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">stop</span>
                    <span>Stop ({recordingSeconds}s)</span>
                  </button>
                )}

                {/* Upload Image File */}
                <input
                  ref={imageManagerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFileUploadForPhoneme(selectedManagerPhoneme, f);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageManagerFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Upload card illustration"
                >
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  <span>Upload Image</span>
                </button>

                {/* Reset Audio */}
                {auditoryService.hasCustomAudio(selectedManagerPhoneme) && (
                  <button
                    type="button"
                    onClick={() => handleResetPhonemeAudio(selectedManagerPhoneme)}
                    className="px-2 py-1.5 rounded-xl text-slate-500 hover:text-red-600 text-[11px] font-bold cursor-pointer transition-colors"
                    title="Reset to default audio"
                  >
                    Reset Audio
                  </button>
                )}

                {/* Reset Image */}
                {auditoryService.hasCustomImage(selectedManagerPhoneme) && (
                  <button
                    type="button"
                    onClick={() => handleResetPhonemeImage(selectedManagerPhoneme)}
                    className="px-2 py-1.5 rounded-xl text-slate-500 hover:text-red-600 text-[11px] font-bold cursor-pointer transition-colors"
                    title="Reset to default illustration"
                  >
                    Reset Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {audioSuccessToast && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{audioSuccessToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* TWO INTERACTIVE GAMES ZONE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">sports_esports</span>
              <span>Listening Forest Interactive Games</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              {isUnlocked
                ? 'Games unlocked after 5 days of Ling sound calibration!'
                : `Locked: Complete 5 days of Ling practice to open both games (Current: ${lingDaysPracticed}/5 Days)`}
            </p>
          </div>

          {/* Quick unlock helper if testing */}
          {!isUnlocked && (
            <button
              onClick={() => {
                if (onUnlockAllDays) {
                  onUnlockAllDays();
                } else {
                  onAdvancePracticeDay();
                }
              }}
              className="text-[11px] font-bold text-secondary hover:text-primary underline cursor-pointer"
            >
              Instant Unlock for Testing
            </button>
          )}
        </div>

        {/* Game Navigation Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => isUnlocked && setActiveView('card_matching')}
            className={`p-6 rounded-3xl md:rounded-[2.5rem] border transition-all flex items-center justify-between cursor-pointer ${
              !isUnlocked
                ? 'bg-surface-container-low border-surface-container opacity-60 cursor-not-allowed'
                : activeView === 'card_matching'
                ? 'bg-secondary-container/80 border-primary ring-2 ring-primary-container shadow-md'
                : 'bg-surface-container-lowest border-surface-container-high hover:border-primary shadow-xs'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-2xl shadow-xs shrink-0">
                🃏
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Game 01 • Memory &amp; Formants
                </span>
                <h3 className="text-lg font-bold font-headline text-on-surface">
                  Play Card Matching
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Match the 6 Ling sounds with their animal partners!
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[28px]">
              {isUnlocked ? 'play_circle' : 'lock'}
            </span>
          </div>

          <div
            onClick={() => isUnlocked && setActiveView('sound_detective')}
            className={`p-6 rounded-3xl md:rounded-[2.5rem] border transition-all flex items-center justify-between cursor-pointer ${
              !isUnlocked
                ? 'bg-surface-container-low border-surface-container opacity-60 cursor-not-allowed'
                : activeView === 'sound_detective'
                ? 'bg-secondary-container/80 border-primary ring-2 ring-primary-container shadow-md'
                : 'bg-surface-container-lowest border-surface-container-high hover:border-primary shadow-xs'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary text-2xl shadow-xs shrink-0">
                🔍
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                  Game 02 • Auditory Discrimination
                </span>
                <h3 className="text-lg font-bold font-headline text-on-surface">
                  Play Sound Detective
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Listen to mystery frequency bursts and catch the hidden sound!
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary text-[28px]">
              {isUnlocked ? 'play_circle' : 'lock'}
            </span>
          </div>
        </div>

        {/* ACTIVE GAME 1: CARD MATCHING */}
        {isUnlocked && activeView === 'card_matching' && (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-surface-container-high/60 shadow-md space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container-high">
              <div>
                <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
                  <span>🃏 Ling-6 Card Matching Arena</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Flip cards to hear speech formants. Pair each phonetic sound with its animal mascot!
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-on-surface">
                  Matches: <span className="text-primary font-mono text-sm">{matchesCount} / {INITIAL_PAIRS.length}</span>
                </div>
                <div className="text-xs font-bold text-on-surface">
                  Moves: <span className="text-secondary font-mono text-sm">{movesCount}</span>
                </div>
                <button
                  onClick={handleResetCardGame}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold cursor-pointer"
                >
                  Restart
                </button>
              </div>
            </div>

            {/* Cards Grid (12 cards) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {cards.map((card) => {
                const showFace = card.isFlipped || card.isMatched;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`h-32 sm:h-36 rounded-2xl p-3 border-2 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer select-none shadow-xs hover:scale-105 active:scale-95 ${
                      card.isMatched
                        ? 'bg-secondary-container/90 border-primary opacity-80'
                        : showFace
                        ? 'bg-surface-container-lowest border-primary shadow-md'
                        : 'bg-primary hover:bg-primary-container border-primary-container text-on-primary'
                    }`}
                  >
                    {showFace ? (
                      <div className="flex flex-col items-center gap-1 animate-fadeIn">
                        <span className="text-3xl sm:text-4xl">{card.emoji}</span>
                        <span className="text-sm font-black font-headline text-primary">
                          {card.label}
                        </span>
                        <span className="text-[10px] font-semibold text-on-surface-variant">
                          {card.sub}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-[32px] text-on-primary/80">
                          hearing
                        </span>
                        <span className="text-[10px] font-bold text-on-primary tracking-wider uppercase">
                          Tap to Hear
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTIVE GAME 2: SOUND DETECTIVE */}
        {isUnlocked && activeView === 'sound_detective' && (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-surface-container-high/60 shadow-md space-y-6 text-center max-w-2xl mx-auto animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary bg-tertiary-fixed px-3 py-1 rounded-full">
                Sound Detective Challenge
              </span>
              <h3 className="text-2xl font-black font-headline text-on-surface mt-2">
                Listen Closely! What Sound Did the Forest Play?
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Tap the big speaker button to listen to the mystery frequency acoustic cue.
              </p>
            </div>

            {/* Big Audio Trigger */}
            <div className="py-4 flex flex-col items-center">
              <button
                onClick={playDetectiveMysterySound}
                className={`w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex flex-col items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isPlayingTarget ? 'ring-8 ring-secondary-container animate-pulse' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[44px]">volume_up</span>
                <span className="text-[10px] font-bold tracking-wider uppercase mt-1">Play Clue</span>
              </button>
              <span className="text-xs text-secondary font-semibold mt-3">
                Current Detective Streak: 🔥 {detectiveStreak}
              </span>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-3 gap-3">
              {detectiveOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectDetectiveOption(opt)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary hover:bg-secondary-container/40 ${
                    detectiveAnswerStatus === 'correct' && opt === detectiveTarget
                      ? 'bg-secondary-container border-primary ring-2 ring-primary text-on-secondary-container shadow-md'
                      : 'bg-surface-container-low border-surface-container text-on-surface'
                  }`}
                >
                  <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-sm border border-surface-container-high bg-white">
                    <img
                      src={auditoryService.getCustomImage(opt) || DEFAULT_LING_IMAGES[opt]}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>

            {detectiveAnswerStatus === 'correct' && (
              <div className="text-sm font-bold text-primary bg-secondary-container p-3 rounded-full animate-fadeIn">
                🎉 Correct! You identified the /{detectiveTarget}/ frequency! (+15 Points)
              </div>
            )}

            {detectiveAnswerStatus === 'wrong' && (
              <div className="text-sm font-bold text-error bg-error-container p-3 rounded-full animate-fadeIn">
                Try again! Tap the speaker to re-listen to the formant pitch.
              </div>
            )}
          </div>
        )}
      </div>

      {/* LING CARD CUSTOMIZER MODAL */}
      <LingCardCustomizerModal
        isOpen={!!customizerModalPhoneme}
        initialPhoneme={customizerModalPhoneme || 'm'}
        onClose={() => setCustomizerModalPhoneme(null)}
        onAssetsUpdated={() => setAssetUpdateCounter((c) => c + 1)}
      />
    </div>
  );
};
