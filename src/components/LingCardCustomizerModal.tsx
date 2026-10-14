import React, { useState, useRef, useEffect } from 'react';
import { Ling6Phoneme } from '../types';
import { auditoryService } from '../services/audioService';

interface LingCardCustomizerModalProps {
  initialPhoneme?: Ling6Phoneme;
  isOpen: boolean;
  onClose: () => void;
  onAssetsUpdated?: () => void;
}

interface PhonemeMeta {
  phoneme: Ling6Phoneme;
  name: string;
  animalLabel: string;
  emoji: string;
  frequencyHint: string;
  defaultImage: string;
}

const PHONEME_METAS: PhonemeMeta[] = [
  {
    phoneme: 'm',
    name: 'Mmmmmm',
    animalLabel: 'Busy Bee',
    emoji: '🐝',
    frequencyHint: 'Low Nasal Formant (250 Hz)',
    defaultImage: '/images/ling/ling_m.svg',
  },
  {
    phoneme: 'oo',
    name: 'Oooooo',
    animalLabel: 'Ghost Friend',
    emoji: '👻',
    frequencyHint: 'Low-Mid Vowel (300 - 870 Hz)',
    defaultImage: '/images/ling/ling_oo.svg',
  },
  {
    phoneme: 'ah',
    name: 'Aaaahh',
    animalLabel: 'Joyful Shout',
    emoji: '🗣️',
    frequencyHint: 'Mid Vowel (800 - 1200 Hz)',
    defaultImage: '/images/ling/ling_ah.svg',
  },
  {
    phoneme: 'ee',
    name: 'Eeeeeee',
    animalLabel: 'Toothbrushing',
    emoji: '🪥',
    frequencyHint: 'Mid-High Formant (270 & 2300 Hz)',
    defaultImage: '/images/ling/ling_ee.svg',
  },
  {
    phoneme: 'sh',
    name: 'Shhhhhh',
    animalLabel: 'Sleepy Bear',
    emoji: '🧸',
    frequencyHint: 'High Broadband Friction (2000 - 4000 Hz)',
    defaultImage: '/images/ling/ling_sh.svg',
  },
  {
    phoneme: 's',
    name: 'Sssssss',
    animalLabel: 'Friendly Snake',
    emoji: '🐍',
    frequencyHint: 'Highest Sibilant (4000 - 8000 Hz)',
    defaultImage: '/images/ling/ling_s.svg',
  },
];

export const LingCardCustomizerModal: React.FC<LingCardCustomizerModalProps> = ({
  initialPhoneme = 'm',
  isOpen,
  onClose,
  onAssetsUpdated,
}) => {
  const [selectedPhoneme, setSelectedPhoneme] = useState<Ling6Phoneme>(initialPhoneme);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, setRerenderKey] = useState(0);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialPhoneme) {
      setSelectedPhoneme(initialPhoneme);
    }
  }, [initialPhoneme, isOpen]);

  useEffect(() => {
    const unsub = auditoryService.subscribe(() => {
      setRerenderKey((k) => k + 1);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const currentMeta = PHONEME_METAS.find((p) => p.phoneme === selectedPhoneme) || PHONEME_METAS[0];
  const customAudioName = auditoryService.getCustomAudioName(selectedPhoneme);
  const hasCustomAudio = auditoryService.hasCustomAudio(selectedPhoneme);
  const customImageUrl = auditoryService.getCustomImage(selectedPhoneme);
  const activeImage = customImageUrl || currentMeta.defaultImage;

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    auditoryService.playLing6Acoustic(selectedPhoneme);
    setTimeout(() => setIsPlaying(false), 1300);
  };

  // Upload Audio
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await auditoryService.setCustomAudio(selectedPhoneme, dataUrl, file.name, true);
        auditoryService.playLing6Acoustic(selectedPhoneme);
        showNotification(`✓ Uploaded custom audio "${file.name}" for /${selectedPhoneme}/!`);
        if (onAssetsUpdated) onAssetsUpdated();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start Mic Recording
  const handleStartRecording = async () => {
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
          const recordingName = `Voice_Recording_${selectedPhoneme.toUpperCase()}_${Date.now().toString().slice(-4)}.webm`;
          await auditoryService.setCustomAudio(selectedPhoneme, dataUrl, recordingName, true);
          auditoryService.playLing6Acoustic(selectedPhoneme);
          showNotification(`✓ Voice recording saved & calibrated for /${selectedPhoneme}/!`);
          if (onAssetsUpdated) onAssetsUpdated();
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      showNotification('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Reset Audio
  const handleResetAudio = async () => {
    await auditoryService.removeCustomAudio(selectedPhoneme);
    showNotification(`✓ Reset /${selectedPhoneme}/ audio to authentic default stimulus.`);
    if (onAssetsUpdated) onAssetsUpdated();
  };

  // Upload Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await auditoryService.setCustomImage(selectedPhoneme, dataUrl, file.name, true);
        showNotification(`✓ Uploaded custom card image "${file.name}" for /${selectedPhoneme}/!`);
        if (onAssetsUpdated) onAssetsUpdated();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset Image
  const handleResetImage = async () => {
    await auditoryService.removeCustomImage(selectedPhoneme);
    showNotification(`✓ Reset /${selectedPhoneme}/ card image to default illustration.`);
    if (onAssetsUpdated) onAssetsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-white/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                🎨
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Customize Ling-6 Sound Cards
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manually upload custom images and audio recordings for each of the 6 Ling sounds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Phoneme selector pills */}
        <div className="my-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Ling Sound Card:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PHONEME_METAS.map((item) => {
              const isSel = item.phoneme === selectedPhoneme;
              const hasAudio = auditoryService.hasCustomAudio(item.phoneme);
              const hasImg = auditoryService.hasCustomImage(item.phoneme);

              return (
                <button
                  key={item.phoneme}
                  type="button"
                  onClick={() => setSelectedPhoneme(item.phoneme)}
                  className={`py-2 px-3 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer relative ${
                    isSel
                      ? 'border-[#ff622d] bg-[#fff3ec] text-[#ff622d] font-black shadow-md scale-105'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-sm font-extrabold">/{item.phoneme}/</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasAudio && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Custom Audio Active" />
                    )}
                    {hasImg && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Custom Image Active" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sound Details Box */}
        <div className="bg-[#f8fbfe] border border-blue-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentMeta.emoji}</div>
            <div>
              <div className="text-base font-black text-slate-800">
                /{currentMeta.phoneme}/ • {currentMeta.name} ({currentMeta.animalLabel})
              </div>
              <div className="text-xs font-semibold text-teal-700">
                Acoustic Formant: {currentMeta.frequencyHint}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Synced</span>
          </span>
        </div>

        {/* Two-Column Editor: 1. Audio Stimulus | 2. Card Illustration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Audio Stimulus */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>Audio Stimulus</span>
                </span>
              </div>

              {/* Current audio info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-base">🎵</span>
                <span className="truncate">
                  {customAudioName || `Default /${selectedPhoneme}/ acoustic stimulus`}
                </span>
              </div>

              {/* Play Button */}
              <button
                type="button"
                onClick={handlePlayAudio}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 mb-3"
              >
                <span>{isPlaying ? '🔊 Playing Audio...' : `▶ Play /${selectedPhoneme}/ Sound`}</span>
              </button>
            </div>

            {/* Audio Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* File upload hidden input */}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,video/mpeg,video/mp4"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-[#ff622d] hover:bg-[#f0531c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>📁 Upload Audio File</span>
              </button>

              {/* Live Mic Recorder */}
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>🎤 Record Voice with Mic</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center gap-2 animate-pulse cursor-pointer shadow-md"
                >
                  <span>⏹ Stop & Save ({recordingSeconds}s)</span>
                </button>
              )}

              {/* Reset to Default */}
              {hasCustomAudio && (
                <button
                  type="button"
                  onClick={handleResetAudio}
                  className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                >
                  Reset to Default Audio
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Card Illustration */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>Card Illustration</span>
                </span>
              </div>

              {/* Image Preview Box */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center relative mb-4">
                <img
                  src={activeImage}
                  alt={currentMeta.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>

            {/* Image Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* File upload hidden input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>📷 Upload New Image</span>
              </button>

              {/* Reset to Default */}
              {customImageUrl && (
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                >
                  Reset to Default Illustration
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Saved to Firestore &amp; localStorage
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
