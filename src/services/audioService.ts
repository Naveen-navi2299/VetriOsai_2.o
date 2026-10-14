// Audio service for Ling-6 sound calibration and Listening Forest auditory stimuli
import { Ling6Phoneme } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

class AuditoryService {
  private audioCtx: AudioContext | null = null;
  private customAudioMap: Map<string, string> = new Map();
  private customAudioNames: Map<string, string> = new Map();
  private customImageMap: Map<string, string> = new Map();
  private customImageNames: Map<string, string> = new Map();
  private listeners: Set<(phoneme: string, name: string | null) => void> = new Set();
  private isSyncedWithDb: boolean = false;
  private syncInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const ALL_LING6: Ling6Phoneme[] = ['m', 'oo', 'ah', 'ee', 'sh', 's'];
        for (const p of ALL_LING6) {
          const savedAudio = localStorage.getItem(`ling_custom_audio_${p}`);
          if (savedAudio) {
            this.customAudioMap.set(p, savedAudio);
          }
          const savedAudioName = localStorage.getItem(`ling_custom_audio_name_${p}`);
          if (savedAudioName) {
            this.customAudioNames.set(p, savedAudioName);
          } else if (p === 'm') {
            this.customAudioNames.set('m', 'WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg');
          }

          const savedImage = localStorage.getItem(`ling_custom_image_${p}`);
          if (savedImage) {
            this.customImageMap.set(p, savedImage);
          }
          const savedImageName = localStorage.getItem(`ling_custom_image_name_${p}`);
          if (savedImageName) {
            this.customImageNames.set(p, savedImageName);
          }
        }
      } catch (e) {
        console.warn('Could not read localStorage for custom audio & images', e);
      }
    }
  }

  public initFirestoreAudioSync() {
    if (this.syncInitialized || typeof window === 'undefined' || !db) return;
    this.syncInitialized = true;
    const ALL_LING6: Ling6Phoneme[] = ['m', 'oo', 'ah', 'ee', 'sh', 's'];

    try {
      ALL_LING6.forEach((p) => {
        // Sync audio from Firestore
        const audioDocRef = doc(db, 'custom_audio', p);
        onSnapshot(
          audioDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.audioData) {
                this.customAudioMap.set(p, data.audioData);
                const name = data.fileName || `${p}_audio.mpeg`;
                this.customAudioNames.set(p, name);
                this.isSyncedWithDb = true;
                if (typeof window !== 'undefined' && window.localStorage) {
                  try {
                    localStorage.setItem(`ling_custom_audio_${p}`, data.audioData);
                    localStorage.setItem(`ling_custom_audio_name_${p}`, name);
                  } catch {
                    // ignore
                  }
                }
                this.notifyListeners(p);
              }
            }
          },
          (error) => {
            if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('network')) {
              return;
            }
            console.warn(`Firestore custom_audio onSnapshot sync note (${p}):`, error.message);
          }
        );

        // Sync image from Firestore
        const imageDocRef = doc(db, 'custom_images', p);
        onSnapshot(
          imageDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.imageData) {
                this.customImageMap.set(p, data.imageData);
                const name = data.fileName || `${p}_image.png`;
                this.customImageNames.set(p, name);
                if (typeof window !== 'undefined' && window.localStorage) {
                  try {
                    localStorage.setItem(`ling_custom_image_${p}`, data.imageData);
                    localStorage.setItem(`ling_custom_image_name_${p}`, name);
                  } catch {
                    // ignore
                  }
                }
                this.notifyListeners(p);
              }
            }
          },
          (error) => {
            if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('network')) {
              return;
            }
            console.warn(`Firestore custom_images onSnapshot sync note (${p}):`, error.message);
          }
        );
      });
    } catch (e) {
      console.warn('Could not initialize Firestore audio & image sync listener:', e);
    }
  }

  public subscribe(callback: (phoneme: string, name: string | null) => void): () => void {
    this.initFirestoreAudioSync();
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(phoneme: string) {
    const name = this.getCustomAudioName(phoneme as Ling6Phoneme);
    this.listeners.forEach((listener) => {
      try {
        listener(phoneme, name);
      } catch (err) {
        console.error('Error in audioService subscriber callback:', err);
      }
    });
  }

  public isCloudSynced(phoneme: Ling6Phoneme = 'm'): boolean {
    return this.isSyncedWithDb;
  }

  public getCustomAudio(phoneme: Ling6Phoneme): string | null {
    if (this.customAudioMap.has(phoneme)) {
      return this.customAudioMap.get(phoneme)!;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(`ling_custom_audio_${phoneme}`);
        if (saved) {
          this.customAudioMap.set(phoneme, saved);
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public getCustomAudioName(phoneme: Ling6Phoneme): string | null {
    const memName = this.customAudioNames.get(phoneme);
    if (memName) return memName;
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`ling_custom_audio_name_${phoneme}`);
      if (stored) return stored;
    }
    if (phoneme === 'm') {
      return 'WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg';
    }
    return null;
  }

  public async setCustomAudio(
    phoneme: Ling6Phoneme,
    dataUrl: string,
    fileName?: string,
    syncToDatabase: boolean = true
  ) {
    const actualName = fileName || (phoneme === 'm' ? 'WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg' : `${phoneme}_audio.mpeg`);
    this.customAudioMap.set(phoneme, dataUrl);
    this.customAudioNames.set(phoneme, actualName);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`ling_custom_audio_${phoneme}`, dataUrl);
        localStorage.setItem(`ling_custom_audio_name_${phoneme}`, actualName);
      } catch (e) {
        console.warn('Failed to save custom audio to localStorage', e);
      }
    }

    this.notifyListeners(phoneme);

    // Sync directly to Firestore database for persistent storage across all users/sessions
    if (syncToDatabase && db) {
      try {
        const docRef = doc(db, 'custom_audio', phoneme);
        await setDoc(
          docRef,
          {
            id: phoneme,
            phoneme,
            fileName: actualName,
            originalUri: actualName,
            mimeType: actualName.endsWith('.mpeg') ? 'video/mpeg' : 'audio/mpeg',
            audioData: dataUrl,
            fileSize: dataUrl.length,
            updatedAt: new Date().toISOString(),
            isReplaced: true,
            source: 'user_uploaded_database'
          },
          { merge: true }
        );

        // Also write to sound_assets collection
        const assetRef = doc(db, 'sound_assets', `ling_${phoneme}`);
        await setDoc(
          assetRef,
          {
            id: `ling_${phoneme}`,
            phoneme,
            fileName: actualName,
            audioData: dataUrl,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );

        this.isSyncedWithDb = true;
        this.notifyListeners(phoneme);
      } catch (err) {
        console.warn('Failed to persist custom audio to Firestore database:', err);
      }
    }
  }

  public async removeCustomAudio(phoneme: Ling6Phoneme) {
    this.customAudioMap.delete(phoneme);
    this.customAudioNames.delete(phoneme);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`ling_custom_audio_${phoneme}`);
        localStorage.removeItem(`ling_custom_audio_name_${phoneme}`);
      } catch {
        // ignore
      }
    }
    this.notifyListeners(phoneme);

    if (db) {
      try {
        await deleteDoc(doc(db, 'custom_audio', phoneme));
        this.isSyncedWithDb = false;
      } catch (err) {
        console.warn('Failed to delete custom audio from Firestore:', err);
      }
    }
  }

  public hasCustomAudio(phoneme: Ling6Phoneme): boolean {
    if (this.customAudioMap.has(phoneme)) return true;
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem(`ling_custom_audio_${phoneme}`);
    }
    return phoneme === 'm';
  }

  public getCustomImage(phoneme: Ling6Phoneme): string | null {
    if (this.customImageMap.has(phoneme)) {
      return this.customImageMap.get(phoneme)!;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(`ling_custom_image_${phoneme}`);
        if (saved) {
          this.customImageMap.set(phoneme, saved);
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public getCustomImageName(phoneme: Ling6Phoneme): string | null {
    const memName = this.customImageNames.get(phoneme);
    if (memName) return memName;
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`ling_custom_image_name_${phoneme}`);
      if (stored) return stored;
    }
    return null;
  }

  public hasCustomImage(phoneme: Ling6Phoneme): boolean {
    return !!this.getCustomImage(phoneme);
  }

  public async setCustomImage(
    phoneme: Ling6Phoneme,
    dataUrl: string,
    fileName?: string,
    syncToDatabase: boolean = true
  ) {
    const actualName = fileName || `${phoneme}_card_image.png`;
    this.customImageMap.set(phoneme, dataUrl);
    this.customImageNames.set(phoneme, actualName);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`ling_custom_image_${phoneme}`, dataUrl);
        localStorage.setItem(`ling_custom_image_name_${phoneme}`, actualName);
      } catch (e) {
        console.warn('Failed to save custom image to localStorage', e);
      }
    }

    this.notifyListeners(phoneme);

    if (syncToDatabase && db) {
      try {
        const docRef = doc(db, 'custom_images', phoneme);
        await setDoc(
          docRef,
          {
            id: phoneme,
            phoneme,
            fileName: actualName,
            imageData: dataUrl,
            fileSize: dataUrl.length,
            updatedAt: new Date().toISOString(),
            isReplaced: true,
            source: 'user_uploaded_database'
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Failed to persist custom image to Firestore database:', err);
      }
    }
  }

  public async removeCustomImage(phoneme: Ling6Phoneme) {
    this.customImageMap.delete(phoneme);
    this.customImageNames.delete(phoneme);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`ling_custom_image_${phoneme}`);
        localStorage.removeItem(`ling_custom_image_name_${phoneme}`);
      } catch {
        // ignore
      }
    }
    this.notifyListeners(phoneme);

    if (db) {
      try {
        await deleteDoc(doc(db, 'custom_images', phoneme));
      } catch (err) {
        console.warn('Failed to delete custom image from Firestore:', err);
      }
    }
  }

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play natural speech phoneme using speech synthesis
  public speakPhoneme(phoneme: Ling6Phoneme, rate: number = 0.85, pitch: number = 1.1) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const soundMap: Record<Ling6Phoneme, string> = {
        m: 'Mmmmmm',
        ah: 'Aaaahh',
        oo: 'Ooooo',
        ee: 'Eeeee',
        sh: 'Shhhhh',
        s: 'Ssssss',
      };

      const utterance = new SpeechSynthesisUtterance(soundMap[phoneme] || phoneme);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Play authentic audio recording or calibrated formant for Ling-6 testing
  public playLing6Acoustic(phoneme: Ling6Phoneme, duration: number = 1.2) {
    // 1. Check if user configured custom audio for this phoneme
    const customAudio = this.getCustomAudio(phoneme);
    if (customAudio) {
      try {
        const audio = new Audio(customAudio);
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Custom audio playback failed, falling back to synthesis', err);
            this.playSynthesizedPhoneme(phoneme, duration);
          });
        }
        return;
      } catch (err) {
        console.warn('Error playing custom audio', err);
      }
    }

    // 2. Dedicated authentic audio file for the /m/ sound in Listening Forest
    if (phoneme === 'm') {
      try {
        const audio = new Audio('/audio/WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg');
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const fallbackAudio = new Audio('/audio/ling_m.mp3');
            fallbackAudio.volume = 1.0;
            fallbackAudio.play().catch((err) => {
              console.warn('Audio file play error, falling back to synthesis', err);
              this.playSynthesizedPhoneme('m', duration);
            });
          });
        }
        return;
      } catch (err) {
        console.warn('Error initiating /m/ playback', err);
      }
    }

    // 3. Fallback / default formant synthesis for other phonemes
    this.playSynthesizedPhoneme(phoneme, duration);
  }

  // Synthesize calibrated pure formant acoustic frequency for Ling-6 calibration testing
  public playSynthesizedPhoneme(phoneme: Ling6Phoneme, duration: number = 1.2) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (phoneme) {
      case 'm': {
        // ~250 Hz fundamental low nasal resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.6, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
        break;
      }

      case 'oo': {
        // Formants: F1 ~ 300Hz, F2 ~ 870Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(300, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(870, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
        break;
      }

      case 'ah': {
        // Formants: F1 ~ 750-800Hz, F2 ~ 1200-1300Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(780, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1250, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
        break;
      }

      case 'ee': {
        // Formants: F1 ~ 270Hz, F2 ~ 2300Hz (high contrast)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(270, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2350, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.4, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
        break;
      }

      case 'sh': {
        // Band-limited noise: 2000Hz - 4000Hz
        this.playFilteredNoise(2000, 4000, duration, 0.4);
        break;
      }

      case 's': {
        // High frequency sibilance: 4500Hz - 8000Hz
        this.playFilteredNoise(4500, 8000, duration, 0.35);
        break;
      }
    }

    // Also trigger vocal articulation for complete pediatric calibration clarity
    this.speakPhoneme(phoneme);
  }

  private playFilteredNoise(lowCut: number, highCut: number, duration: number, volume: number) {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(Math.sqrt(lowCut * highCut), ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Forest ambient and animal stimuli for "Listening Forest" Game
  public playForestSound(type: 'bird' | 'water' | 'leaves' | 'chime' | 'success' | 'tap') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'bird': {
        // 2-tone melodic bird chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.3);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'success': {
        // Triumphant arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.01, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });
        break;
      }

      case 'water': {
        this.playFilteredNoise(400, 1500, 0.8, 0.2);
        break;
      }

      case 'leaves': {
        this.playFilteredNoise(1200, 3500, 0.6, 0.15);
        break;
      }

      case 'tap': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'chime': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
    }
  }

  // ==========================================
  // SOUND ISLAND ACOUSTIC ENVIRONMENTAL STIMULI
  // ==========================================

  // 1. Ringing Sound: Classic bell / phone ring cadence with metallic resonance
  public playRingingSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Dual ringing frequencies (e.g. 700Hz + 850Hz) repeating in two bursts (ring-ring)
    const bursts = [0, 0.35];
    bursts.forEach((burstOffset) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(750, now + burstOffset);
      osc2.frequency.setValueAtTime(880, now + burstOffset);

      gain.gain.setValueAtTime(0.001, now + burstOffset);
      gain.gain.exponentialRampToValueAtTime(0.4, now + burstOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + burstOffset + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + burstOffset);
      osc2.start(now + burstOffset);
      osc1.stop(now + burstOffset + 0.3);
      osc2.stop(now + burstOffset + 0.3);
    });
  }

  // 2. Horn Sound: Realistic vehicle / boat brass horn tone (e.g. 320Hz + 400Hz rich saw/square burst)
  public playHornSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(320, now);
    osc2.frequency.setValueAtTime(400, now);

    // Warm low-pass filter to sound like an authentic car horn
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain.gain.setValueAtTime(0.35, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  }

  // 3. Cat Sound: Vocalized kitten / cat meow with pitch glide + speech synthesis support
  public playCatSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3, now);

    // Pitch contour: starts at 580Hz, glides up to 880Hz, then slides down to 420Hz
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.65);

    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.65);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);

    // Voice accentuation
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance('Meow!');
        u.pitch = 1.4;
        u.rate = 1.1;
        window.speechSynthesis.speak(u);
      }, 50);
    }
  }

  // 4. Bird Sounds: Melodic multi-chirp warble
  public playBirdSound() {
    this.playForestSound('bird');
    // Follow-up second trill for an authentic songbird warble
    setTimeout(() => {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(3600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    }, 200);
  }

  // ==========================================
  // ALPHABET TOWN PHONICS & WORDS
  // ==========================================
  public speakAlphabetLetter(letter: string, word: string) {
    this.playForestSound('tap');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${letter.toUpperCase()}! ${letter.toUpperCase()} for ${word}.`);
      u.rate = 0.9;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    }
  }

  // ==========================================
  // NUMBER MOUNTAIN COUNTING & PITCH PROSODY
  // ==========================================
  public speakNumberMountain(num: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Harmonized chime ascending in frequency as number climbs (1 to 20: 220Hz to 880Hz)
    const baseFreq = 220 + (num / 20) * 660;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(num.toString());
      // Elevation pitch shift
      u.pitch = 0.8 + (num / 20) * 0.7;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }
}

export const auditoryService = new AuditoryService();
