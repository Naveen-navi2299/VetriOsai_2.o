import React from 'react';

export const AboutView: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-14 space-y-8 animate-fadeIn max-w-5xl mx-auto font-sans">
      {/* Hero Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-sky-600 flex items-center justify-center shadow-xs text-3xl shrink-0 font-bold">
            <span className="material-symbols-outlined text-[32px]">hearing</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Pediatric Audiology
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Clinical Principles &amp; Methodology
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2958] tracking-tight">
              About Vetri Osai
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mt-1 leading-relaxed">
              An evidence-based auditory-verbal practice platform designed for pediatric hearing habilitation, cochlear implant mapping validation, and joyful speech development.
            </p>
          </div>
        </div>
      </section>

      {/* The Science of the Ling-6 Sound Test */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E2958] flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500 text-[24px]">graphic_eq</span>
            <span>The Science of the Ling-6 Sound Test</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Developed by Dr. Daniel Ling, the Ling-6 sound test is the clinical gold standard for verifying that a child's cochlear implant or hearing aids provide access to the full speech frequency spectrum (250 Hz to 8000 Hz).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              sound: '/m/',
              name: 'Busy Bee',
              hz: '250 Hz',
              role: 'Low Frequency Fundamental',
              detail: 'Ensures detection of low-frequency voicing and nasal formants.',
              badge: 'bg-amber-100 text-amber-800',
            },
            {
              sound: '/oo/',
              name: 'Playful Monkey',
              hz: '300 & 870 Hz',
              role: 'Low-Mid Vowel Formants',
              detail: 'Validates back rounded vowel perception (First & Second Formants).',
              badge: 'bg-sky-100 text-sky-800',
            },
            {
              sound: '/ah/',
              name: 'Brave Lion',
              hz: '800 & 1200 Hz',
              role: 'Mid Central Vowel',
              detail: 'Checks open vocal tract resonance, critical for vowel contrast.',
              badge: 'bg-rose-100 text-rose-800',
            },
            {
              sound: '/ee/',
              name: 'Quick Mouse',
              hz: '270 & 2300 Hz',
              role: 'High Second Formant',
              detail: 'Extreme formant separation; verifies acoustic clarity across wide gap.',
              badge: 'bg-indigo-100 text-indigo-800',
            },
            {
              sound: '/sh/',
              name: 'Quiet Tiger',
              hz: '2000 - 4000 Hz',
              role: 'High Frequency Bandpass',
              detail: 'Noise energy essential for consonant recognition and grammatical markers.',
              badge: 'bg-emerald-100 text-emerald-800',
            },
            {
              sound: '/s/',
              name: 'Gentle Snake',
              hz: '4000 - 8000 Hz',
              role: 'Highest Sibilant Noise',
              detail: 'The highest frequency speech sound; critical for plurals and verb tenses.',
              badge: 'bg-purple-100 text-purple-800',
            },
          ].map((item) => (
            <div
              key={item.sound}
              className="p-5 rounded-2xl bg-blue-50/40 border border-blue-50 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-black text-[#1E2958]">{item.sound}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${item.badge}`}>
                    {item.hz}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800">{item.name}</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">{item.role}</div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Advisory & Privacy Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Advisory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60 space-y-4">
          <h3 className="font-bold text-[#1E2958] text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[20px]">medical_services</span>
            <span>Clinical Advisory &amp; Protocols</span>
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our daily routines follow evidence-backed Auditory-Verbal Therapy (AVT) principles, promoting parent-guided home practice in natural acoustic environments.
          </p>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#5C8AE6] text-white flex items-center justify-center font-bold text-base shrink-0">
              MV
            </div>
            <div>
              <div className="font-bold text-sm text-[#1E2958]">Dr. Meera Vasudevan, CCC-SLP</div>
              <div className="text-xs text-slate-600 font-medium">
                Lead Pediatric Auditory-Verbal Specialist
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Chennai Auditory Research Center &amp; Cochlear Habilitation Clinic
              </div>
            </div>
          </div>
        </div>

        {/* Data Privacy & Google Workspace Security */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60 space-y-4">
          <h3 className="font-bold text-[#1E2958] text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">security</span>
            <span>Privacy Standards &amp; Security Compliance</span>
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We adhere to strict HIPAA and FERPA patient privacy standards. All child diagnostic dossiers, calibration logs, and telemetry are stored securely:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
              <span>Encrypted Firestore database storage with role-based access rules.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
              <span>Parent-authorized Google Drive storage scoped strictly to "Vetri Osai" folders.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
              <span>Explicit user confirmation before sending emails or creating calendar events.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
