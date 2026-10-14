import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  Video,
  Clock,
  Send,
  CheckCircle,
  Activity,
  Heart,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onSignIn: () => void;
  user: User | null;
  isSigningIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onSignIn,
  user,
  isSigningIn,
}) => {
  // Navigation outside the home page: 'home' | 'about' | 'contact'
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'contact'>('home');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    parentName: '',
    childName: '',
    email: '',
    phone: '',
    topic: 'telehealth',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSending, setContactSending] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    setTimeout(() => {
      setContactSending(false);
      setContactSubmitted(true);
    }, 600);
  };

  return (
    <div className="relative font-sans antialiased text-white min-h-screen bg-gradient-to-br from-[#0c163b] via-[#101c47] to-[#122456] overflow-x-hidden flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* BEGIN: HeroBackgroundChevrons */}
      {/* Layered chevron shapes cascading across the right portion of viewport */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="chevron-layer chevron-1"></div>
        <div className="chevron-layer chevron-2"></div>
        <div className="chevron-layer chevron-3"></div>
        <div className="chevron-layer chevron-4"></div>
        <div className="chevron-layer chevron-5"></div>
        <div className="chevron-layer chevron-6"></div>
        <div className="chevron-layer chevron-7"></div>
        {/* Ambient cyan and teal background highlights */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -top-32 right-1/4 w-[32rem] h-[32rem] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
      </div>
      {/* END: HeroBackgroundChevrons */}

      {/* BEGIN: NavigationBar */}
      <header className="relative z-50 w-full px-8 md:px-16 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg p-1 text-left cursor-pointer"
            data-purpose="brand-logo"
          >
            {/* Isometric 3D Cube Icon */}
            <div className="w-8 h-8 relative text-slate-200 transition-transform duration-300 group-hover:scale-105">
              <svg className="w-full h-full drop-shadow-sm" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                {/* Top Face */}
                <polygon fill="#E2E8F0" fillOpacity="0.95" points="16,2 30,10 16,18 2,10"></polygon>
                {/* Left Face */}
                <polygon fill="#94A3B8" fillOpacity="0.75" points="2,10 16,18 16,30 2,22"></polygon>
                {/* Right Face */}
                <polygon fill="#CBD5E1" fillOpacity="0.85" points="30,10 16,18 16,30 30,22"></polygon>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base md:text-lg font-bold tracking-wider uppercase">
                VETRI OSAI
              </span>
              <span className="text-[10px] text-teal-300/80 font-medium tracking-normal -mt-0.5">
                Pediatric Speech Care
              </span>
            </div>
          </button>

          {/* Navigation Links & Sign In Button */}
          <nav className="flex items-center gap-6 md:gap-10 text-sm md:text-base font-normal" data-purpose="main-navigation">
            {/* Home Bar */}
            <button
              onClick={() => setCurrentTab('home')}
              className={`relative transition-all duration-200 cursor-pointer py-1 ${
                currentTab === 'home'
                  ? 'text-white font-bold'
                  : 'text-slate-200/90 hover:text-white'
              }`}
              title="Landing Home"
            >
              <span>Home</span>
              {currentTab === 'home' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-fadeIn" />
              )}
            </button>

            {/* About Bar */}
            <button
              onClick={() => setCurrentTab('about')}
              className={`relative transition-all duration-200 cursor-pointer py-1 ${
                currentTab === 'about'
                  ? 'text-white font-bold'
                  : 'text-slate-200/90 hover:text-white'
              }`}
              title="About Vetri Osai"
            >
              <span>About</span>
              {currentTab === 'about' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-fadeIn" />
              )}
            </button>

            {/* Contact Bar */}
            <button
              onClick={() => setCurrentTab('contact')}
              className={`relative transition-all duration-200 cursor-pointer py-1 ${
                currentTab === 'contact'
                  ? 'text-white font-bold'
                  : 'text-slate-200/90 hover:text-white'
              }`}
              title="Contact Care Team"
            >
              <span>Contact</span>
              {currentTab === 'contact' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-fadeIn" />
              )}
            </button>

            {user ? (
              <button
                onClick={onEnterApp}
                className="btn-glass px-5 py-2 rounded-lg text-emerald-300 hover:text-white text-sm font-semibold ml-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center gap-2 cursor-pointer"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isSigningIn}
                className="btn-glass px-6 py-2 rounded-lg text-slate-100 hover:text-white text-sm font-medium ml-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? 'Signing in...' : 'Sign in'}
              </button>
            )}
          </nav>
        </div>
      </header>
      {/* END: NavigationBar */}

      {/* ============================================================ */}
      {/* TAB 1: HOME PAGE (Outside home page with landing background)  */}
      {/* ============================================================ */}
      {currentTab === 'home' && (
        <main className="relative z-40 flex-1 flex items-center px-8 md:px-16 lg:px-20 py-12 md:py-20 animate-fadeIn">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-xl xl:max-w-2xl">
              {/* Main Typography Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-white leading-[1.08] mb-1">
                Landing Page
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold text-slate-200/90 tracking-tight mb-8">
                Creative Design
              </p>
              {/* Descriptive Subheading Body */}
              <p className="text-sm md:text-base text-slate-300/80 leading-relaxed max-w-lg mb-10 font-normal">
                Innovative pediatric speech therapy &amp; auditory calibration system with Ling-6 formant acoustic testing, interactive Listening Forest quests, automated Google Workspace tracking, and real-time clinical telemetry.
              </p>
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5" data-purpose="hero-actions">
                <button
                  onClick={onEnterApp}
                  className="btn-glass px-8 py-2.5 rounded-lg text-sm md:text-base font-semibold text-white tracking-wide inline-flex items-center justify-center min-w-[128px] focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-lg hover:shadow-teal-500/20"
                >
                  Try Now
                </button>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="btn-glass px-8 py-2.5 rounded-lg text-sm md:text-base font-semibold text-white tracking-wide inline-flex items-center justify-center min-w-[128px] focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  Contact us
                </button>
              </div>

              {/* Feature Highlights Pill Bar */}
              <div className="mt-12 flex flex-wrap gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ling-6 Sound Calibration</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Workspace Sync</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2 backdrop-blur-sm">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Firestore Patient Vault</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ABOUT PAGE (Outside home page with landing background) */}
      {/* ============================================================ */}
      {currentTab === 'about' && (
        <main className="relative z-40 flex-1 px-8 md:px-16 lg:px-20 py-10 animate-fadeIn">
          <div className="max-w-7xl mx-auto w-full space-y-10">
            {/* About Hero Banner */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Pediatric Audiology &amp; Speech Habilitation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                About Vetri Osai
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Vetri Osai is an evidence-based pediatric speech therapy and auditory habilitation architecture engineered specifically for children with cochlear implants, hearing aids, and auditory processing challenges.
              </p>
            </div>

            {/* The Science of the Ling-6 Sound Test */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                    <span>The Science of the 6 Ling Sounds</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300/80 mt-1">
                    Developed by Dr. Daniel Ling, testing these 6 speech sounds verifies access across the essential human speech spectrum (250 Hz to 8000 Hz).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    phoneme: '/m/',
                    mascot: 'Busy Bee',
                    hz: '250 Hz',
                    type: 'Low Frequency Nasal Formant',
                    desc: 'Tests low-pitch voicing fundamental; confirms device is receiving baseline vocal cord vibration.',
                    accent: 'from-amber-500/20 to-amber-600/5 border-amber-400/30 text-amber-300',
                  },
                  {
                    phoneme: '/oo/',
                    mascot: 'Playful Monkey',
                    hz: '300 & 870 Hz',
                    type: 'Low-Mid Back Vowel',
                    desc: 'Tests rounded low vowels and lower first formants essential for speech understanding.',
                    accent: 'from-blue-500/20 to-blue-600/5 border-blue-400/30 text-blue-300',
                  },
                  {
                    phoneme: '/ah/',
                    mascot: 'Brave Lion',
                    hz: '800 & 1200 Hz',
                    type: 'Mid Open Vowel Formant',
                    desc: 'Evaluates broad open vocal tract resonance, critical for core vowel contrast.',
                    accent: 'from-emerald-500/20 to-emerald-600/5 border-emerald-400/30 text-emerald-300',
                  },
                  {
                    phoneme: '/ee/',
                    mascot: 'Quick Mouse',
                    hz: '270 & 2300 Hz',
                    type: 'Extreme Two-Formant Split',
                    desc: 'Requires perception of both deep and high frequency formants across a wide auditory gap.',
                    accent: 'from-purple-500/20 to-purple-600/5 border-purple-400/30 text-purple-300',
                  },
                  {
                    phoneme: '/sh/',
                    mascot: 'Quiet Tiger',
                    hz: '2000 - 4000 Hz',
                    type: 'High Frequency Bandpass',
                    desc: 'Crucial for consonant recognition, word endings, and grammatical understanding.',
                    accent: 'from-rose-500/20 to-rose-600/5 border-rose-400/30 text-rose-300',
                  },
                  {
                    phoneme: '/s/',
                    mascot: 'Gentle Snake',
                    hz: '4000 - 8000 Hz',
                    type: 'Highest Sibilant Spectrum',
                    desc: 'The highest frequency speech consonant; essential for plurals, possessives, and clarity.',
                    accent: 'from-teal-500/20 to-teal-600/5 border-teal-400/30 text-teal-300',
                  },
                ].map((item) => (
                  <div
                    key={item.phoneme}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-teal-400/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl font-black text-white group-hover:text-teal-300 transition-colors">
                          {item.phoneme}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r border ${item.accent}`}>
                          {item.hz}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-100">{item.mascot}</div>
                      <div className="text-xs text-teal-300/80 font-medium mt-0.5">{item.type}</div>
                      <p className="text-xs text-slate-300/80 mt-2.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Principles & Google Workspace Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Clinical Auditory-Verbal Methodology</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Our routines follow evidence-backed Auditory-Verbal Therapy (AVT) principles, promoting parent-guided home practice in natural acoustic environments. Daily practice reinforces auditory pathways, boosting spoken language acquisition.
                </p>
                <div className="text-xs text-slate-400 border-t border-white/10 pt-3">
                  Lead Clinical Advisor: <span className="text-slate-200 font-semibold">Dr. Meera Vasudevan, CCC-SLP</span>
                </div>
              </div>

              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Google Workspace Privacy Compliance</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Engineered with strict HIPAA/FERPA standards. Parent-authorized Google Drive folders maintain encrypted diagnostic dossiers, while automated Google Calendar sync guarantees therapy schedule compliance.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onEnterApp}
                    className="btn-glass px-6 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Launch Clinical App</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CONTACT PAGE (Outside home page with landing background)*/}
      {/* ============================================================ */}
      {currentTab === 'contact' && (
        <main className="relative z-40 flex-1 px-8 md:px-16 lg:px-20 py-10 animate-fadeIn">
          <div className="max-w-7xl mx-auto w-full space-y-10">
            {/* Contact Hero Banner */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Pediatric Care &amp; Telehealth Support Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Contact Care Team
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Connect directly with our pediatric speech-language pathologists, certified auditory-verbal therapists, and cochlear implant technical specialists.
              </p>
            </div>

            {/* Contact Grid: Direct Channels & Interactive Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Direct Clinical Channels (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                    <span>Clinical Communication Desks</span>
                  </h3>

                  <div className="space-y-3.5">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Clinical Support Email</div>
                        <div className="text-sm font-semibold text-white">care@vetriosai.org</div>
                        <div className="text-[11px] text-slate-300/80 mt-0.5">
                          Direct inquiry routing to assigned AVT therapists within 4 hours.
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Toll-Free &amp; Urgent Helpline</div>
                        <div className="text-sm font-semibold text-white">+1 (800) 555-OSAI (6724)</div>
                        <div className="text-[11px] text-slate-300/80 mt-0.5">
                          Toll-free parent hotline for hearing aid &amp; processor questions.
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Virtual Telehealth Room</div>
                        <div className="text-sm font-semibold text-white">Google Meet Video Consultations</div>
                        <div className="text-[11px] text-slate-300/80 mt-0.5">
                          Live remote review of Ling-6 calibration logs with parents.
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Clinical Center Hours</div>
                        <div className="text-sm font-semibold text-white">Mon – Sat: 8:00 AM – 6:30 PM EST</div>
                        <div className="text-[11px] text-slate-300/80 mt-0.5">
                          Weekend emergency processor mapping on-call available.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
                  <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0" />
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">HIPAA Encrypted:</strong> All inquiries and therapy logs are strictly confidential.
                  </div>
                </div>
              </div>

              {/* Right Column: Direct Message Form (7 cols) */}
              <div className="lg:col-span-7">
                <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-teal-400" />
                      <span>Send a Message to the Care Team</span>
                    </h3>
                    <p className="text-xs text-slate-300/80 mt-1">
                      Our pediatric speech pathologists will respond with personalized clinical recommendations.
                    </p>
                  </div>

                  {contactSubmitted ? (
                    <div className="p-8 rounded-2xl bg-teal-500/10 border border-teal-400/30 text-center space-y-4 animate-fadeIn">
                      <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Message Transmitted Successfully</h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out. A certified clinical speech-language pathologist will reply to <strong>{contactForm.email}</strong> shortly.
                      </p>
                      <button
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactForm((prev) => ({ ...prev, message: '' }));
                        }}
                        className="btn-glass px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1">
                            Parent / Guardian Name
                          </label>
                          <input
                            type="text"
                            required
                            value={contactForm.parentName}
                            onChange={(e) => setContactForm({ ...contactForm, parentName: e.target.value })}
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1">
                            Child's Name
                          </label>
                          <input
                            type="text"
                            required
                            value={contactForm.childName}
                            onChange={(e) => setContactForm({ ...contactForm, childName: e.target.value })}
                            placeholder="e.g. Aarav"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="parent@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="+1 (555) 012-3456"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">
                          Inquiry Type
                        </label>
                        <select
                          value={contactForm.topic}
                          onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#111e47] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                        >
                          <option value="telehealth">Schedule Virtual Telehealth Consultation</option>
                          <option value="ling6">Ling-6 Sound Detection &amp; Frequency Calibration</option>
                          <option value="ci-troubleshoot">Cochlear Implant &amp; Hearing Aid Troubleshooting</option>
                          <option value="workspace">Google Workspace Progress Dossiers</option>
                          <option value="general">General Enrollment Questions</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">
                          Clinical Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Describe your child's auditory progress or questions regarding the 6 Ling sounds..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-teal-400" />
                          <span>Dedicated Pediatric Care</span>
                        </div>

                        <button
                          type="submit"
                          disabled={contactSending}
                          className="btn-glass px-7 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg hover:shadow-teal-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {contactSending ? (
                            <span>Transmitting...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-teal-400" />
                              <span>Submit Care Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* BEGIN: MinimalFooter */}
      <footer className="relative z-40 px-8 md:px-16 lg:px-20 py-6 text-xs text-slate-400/60 text-left border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>© 2026 Vetri Osai Care. All rights reserved.</div>
            <div className="flex items-center gap-3 text-slate-300">
              <button
                onClick={() => setCurrentTab('home')}
                className={`hover:text-white transition-colors cursor-pointer ${
                  currentTab === 'home' ? 'text-teal-300 font-semibold underline' : ''
                }`}
              >
                Home
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('about')}
                className={`hover:text-white transition-colors cursor-pointer ${
                  currentTab === 'about' ? 'text-teal-300 font-semibold underline' : ''
                }`}
              >
                About Clinic
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('contact')}
                className={`hover:text-white transition-colors cursor-pointer ${
                  currentTab === 'contact' ? 'text-teal-300 font-semibold underline' : ''
                }`}
              >
                Contact Care Team
              </button>
            </div>
          </div>
          <div className="text-slate-400/40 text-[11px]">
            Designed with Layered Cascading Chevrons &amp; Glass Architecture
          </div>
        </div>
      </footer>
      {/* END: MinimalFooter */}
    </div>
  );
};
