import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle,
  XCircle,
  Sparkles,
  RotateCcw,
  CloudUpload,
  Save,
  Check,
  Shield,
  Award,
  Zap,
} from 'lucide-react';
import { Student, Ling6Phoneme, Ling6Result, TherapySession } from '../types';
import { auditoryService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface Ling6SoundTestProps {
  student: Student;
  onSaveSession: (session: TherapySession) => Promise<void>;
  onTriggerDriveSync: (student: Student) => void;
}

interface PhonemeCardConfig {
  phoneme: Ling6Phoneme;
  name: string;
  animal: string;
  emoji: string;
  frequency: string;
  hzRange: string;
  bgGradient: string;
  borderColor: string;
  badgeColor: string;
}

const PHONEMES: PhonemeCardConfig[] = [
  {
    phoneme: 'm',
    name: 'Mmmmmm',
    animal: 'Busy Bee',
    emoji: '🐝',
    frequency: 'Low Frequency',
    hzRange: '250 Hz',
    bgGradient: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-300',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    phoneme: 'oo',
    name: 'Oooooo',
    animal: 'Playful Monkey',
    emoji: '🐵',
    frequency: 'Low-Mid Vowel',
    hzRange: '300 - 870 Hz',
    bgGradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    phoneme: 'ah',
    name: 'Aaaahh',
    animal: 'Brave Lion',
    emoji: '🦁',
    frequency: 'Mid Frequency',
    hzRange: '800 - 1200 Hz',
    bgGradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-300',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  {
    phoneme: 'ee',
    name: 'Eeeeeee',
    animal: 'Quick Mouse',
    emoji: '🐭',
    frequency: 'Mid-High Formant',
    hzRange: '270 & 2300 Hz',
    bgGradient: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-300',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  {
    phoneme: 'sh',
    name: 'Shhhhhh',
    animal: 'Quiet Tiger',
    emoji: '🐯',
    frequency: 'High Frequency',
    hzRange: '2000 - 4000 Hz',
    bgGradient: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-300',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  {
    phoneme: 's',
    name: 'Sssssss',
    animal: 'Gentle Snake',
    emoji: '🐍',
    frequency: 'Highest Sibilant',
    hzRange: '4000 - 8000 Hz',
    bgGradient: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-300',
    badgeColor: 'bg-rose-100 text-rose-800',
  },
];

export const Ling6SoundTest: React.FC<Ling6SoundTestProps> = ({
  student,
  onSaveSession,
  onTriggerDriveSync,
}) => {
  const [distance, setDistance] = useState<number>(2); // meters
  const [results, setResults] = useState<Record<Ling6Phoneme, Ling6Result>>({
    m: { phoneme: 'm', detected: true, discriminated: true, distanceMeters: 2 },
    oo: { phoneme: 'oo', detected: true, discriminated: true, distanceMeters: 2 },
    ah: { phoneme: 'ah', detected: true, discriminated: true, distanceMeters: 2 },
    ee: { phoneme: 'ee', detected: true, discriminated: true, distanceMeters: 2 },
    sh: { phoneme: 'sh', detected: false, discriminated: false, distanceMeters: 2 },
    s: { phoneme: 's', detected: false, discriminated: false, distanceMeters: 2 },
  });

  const [activePlaying, setActivePlaying] = useState<Ling6Phoneme | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState(
    `${student.name} was calm and alert. Detected low-mid vowels promptly. High frequency sibilants (/sh/ and /s/) tested at ${distance}m distance.`
  );

  const handlePlaySound = (phoneme: Ling6Phoneme) => {
    setActivePlaying(phoneme);
    auditoryService.playLing6Acoustic(phoneme, 1.2);
    setTimeout(() => {
      setActivePlaying(null);
    }, 1300);
  };

  const toggleDetection = (phoneme: Ling6Phoneme) => {
    const current = results[phoneme];
    const newDetected = !current.detected;
    setResults({
      ...results,
      [phoneme]: {
        ...current,
        detected: newDetected,
        discriminated: newDetected ? current.discriminated : false,
      },
    });
    auditoryService.playForestSound('tap');
  };

  const toggleDiscrimination = (phoneme: Ling6Phoneme) => {
    const current = results[phoneme];
    const newDiscrim = !current.discriminated;
    setResults({
      ...results,
      [phoneme]: {
        ...current,
        detected: true, // If discriminated, it was detected
        discriminated: newDiscrim,
      },
    });
    auditoryService.playForestSound('chime');
  };

  // Calculate score percentage
  const totalSounds = 6;
  const detectedCount = Object.values(results).filter((r) => r.detected).length;
  const discriminatedCount = Object.values(results).filter((r) => r.discriminated).length;
  const overallScore = Math.round(((detectedCount * 0.5 + discriminatedCount * 0.5) / totalSounds) * 100);

  const handleCompleteSession = async () => {
    setIsSaving(true);
    const sessionData: TherapySession = {
      id: `sess-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      date: new Date().toISOString(),
      durationMinutes: 25,
      category: 'ling6_calibration',
      score: overallScore,
      ling6Results: results,
      notes: clinicalNotes,
      attended: true,
    };

    try {
      await onSaveSession(sessionData);
      setSaveSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      auditoryService.playForestSound('success');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Child Info & Calibration Setup */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ling-6 Auditory Calibration Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Acoustic Sound Check for {student.name}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Targeting cochlear implant & hearing device frequency mapping from low nasal (250Hz) to high sibilants (8000Hz).
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
              <span className="bg-white/15 px-3 py-1 rounded-lg">Device: {student.hearingDevice}</span>
              <span className="bg-white/15 px-3 py-1 rounded-lg">Diagnosis: {student.diagnosis}</span>
              <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-lg font-bold">
                🔥 Streak: {student.streak} Days
              </span>
            </div>
          </div>

          {/* Distance Calibration Pill Control */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-2">
              Testing Distance
            </span>
            <div className="flex items-center bg-black/20 p-1 rounded-xl">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setDistance(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    distance === m ? 'bg-white text-emerald-800 shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {m} Meter{m > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-emerald-200 mt-2">
              Standard clinical distance for acoustic dispersion
            </span>
          </div>
        </div>
      </div>

      {/* Real-time score & sound cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left score panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Calibration Score</h3>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <div className="text-center py-4 bg-gradient-to-b from-emerald-50 to-white rounded-2xl border border-emerald-100">
              <div className="text-5xl font-black text-emerald-700">{overallScore}%</div>
              <div className="text-xs font-bold text-emerald-900 mt-1 uppercase tracking-wider">
                Overall Accuracy
              </div>
            </div>

            <div className="space-y-3 mt-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Detection Rate</span>
                <span className="font-bold text-slate-800">
                  {detectedCount} / {totalSounds} ({Math.round((detectedCount / totalSounds) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Discrimination Rate</span>
                <span className="font-bold text-slate-800">
                  {discriminatedCount} / {totalSounds} ({Math.round((discriminatedCount / totalSounds) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Current Distance</span>
                <span className="font-bold text-emerald-700">{distance} Meters</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <button
              onClick={handleCompleteSession}
              disabled={isSaving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isSaving ? (
                <span>Saving to Firestore...</span>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Session Recorded!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Log & Save to Firestore</span>
                </>
              )}
            </button>

            <button
              onClick={() => onTriggerDriveSync(student)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <CloudUpload className="w-4 h-4 text-teal-600" />
              <span>Sync Progress to Google Drive</span>
            </button>
          </div>
        </div>

        {/* 6 Ling Phoneme Sound Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PHONEMES.map((item) => {
            const isPlaying = activePlaying === item.phoneme;
            const res = results[item.phoneme];

            return (
              <div
                key={item.phoneme}
                className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-xs flex flex-col justify-between ${
                  isPlaying ? 'border-emerald-500 scale-[1.02] shadow-lg' : item.borderColor
                }`}
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.frequency}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{item.hzRange}</span>
                  </div>

                  {/* Character Avatar & Sound Play */}
                  <div className="flex items-center gap-3 my-2">
                    {auditoryService.getCustomImage(item.phoneme) ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                        <img
                          src={auditoryService.getCustomImage(item.phoneme)!}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-3xl">{item.emoji}</div>
                    )}
                    <div>
                      <div className="text-xl font-black text-slate-800 tracking-wide">
                        /{item.phoneme}/
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{item.animal}</div>
                    </div>
                  </div>

                  {/* Sound Trigger Button */}
                  <button
                    onClick={() => handlePlaySound(item.phoneme)}
                    className={`w-full mt-3 py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${item.bgGradient} active:scale-95 shadow-sm hover:brightness-105`}
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                    <span>{isPlaying ? 'Playing Sound...' : `Play "${item.name}"`}</span>
                  </button>
                </div>

                {/* Patient response checkboxes */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Auditory Response Check
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleDetection(item.phoneme)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                        res.detected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {res.detected ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Detected</span>
                    </button>

                    <button
                      onClick={() => toggleDiscrimination(item.phoneme)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                        res.discriminated
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {res.discriminated ? (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Identified</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Notes Input */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Therapist Session Observations & Behavioral Telemetry
        </label>
        <textarea
          rows={3}
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="Document child's alertness, localization, head turns, or visual prompts used..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
        />
      </div>
    </div>
  );
};
