import React, { useState } from 'react';
import { Student } from '../types';
import { Mail, Phone, Video, Clock, Send, CheckCircle, Heart, Activity } from 'lucide-react';

interface ContactViewProps {
  student?: Student;
}

export const ContactView: React.FC<ContactViewProps> = ({ student }) => {
  const [formData, setFormData] = useState({
    parentName: student?.parentName || '',
    childName: student?.name || '',
    email: student?.parentEmail || '',
    phone: student?.parentPhone || '',
    topic: 'telehealth',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-14 space-y-8 animate-fadeIn max-w-5xl mx-auto font-sans">
      {/* Hero Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs text-3xl shrink-0 font-bold">
            <span className="material-symbols-outlined text-[32px]">support_agent</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Care &amp; Telehealth Desk
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Pediatric Speech &amp; Audiology Support
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2958] tracking-tight">
              Contact Care Team
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mt-1 leading-relaxed">
              Connect directly with our pediatric speech-language pathologists, auditory-verbal therapists, and cochlear implant technical specialists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+18005556724"
            className="btn-try-gradient px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Emergency Care Hotline</span>
          </a>
        </div>
      </section>

      {/* Main Grid: Channels & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Direct Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-50/60">
            <h3 className="font-bold text-[#1E2958] text-base mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <span>Direct Clinical Channels</span>
            </h3>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Clinical Inquiries</div>
                  <div className="text-sm font-bold text-[#1E2958]">care@vetriosai.org</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Response within 2 hours on business days</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Toll-Free Phone Line</div>
                  <div className="text-sm font-bold text-[#1E2958]">+1 (800) 555-OSAI (6724)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Mon–Sat, 8:00 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Telehealth Rooms</div>
                  <div className="text-sm font-bold text-[#1E2958]">HIPAA Video Consult</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Encrypted 1-on-1 parent coaching sessions</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Audiology Clinic Hours</div>
                  <div className="text-sm font-bold text-[#1E2958]">Walk-In Device Verification</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tue &amp; Thu mornings by appointment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Message Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-50/60">
            <h3 className="font-bold text-[#1E2958] text-base mb-1.5 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Send a Message to Therapist</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Have questions regarding Ling sound calibration, speech sound milestones, or home practice tips? Fill out the care form below.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-900">Care Request Received!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.parentName || 'Parent'}</strong>. Your clinical request regarding{' '}
                  <strong>{formData.childName || 'your child'}</strong> has been routed to our pediatric speech team. We will respond to{' '}
                  <strong>{formData.email || 'your email'}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 cursor-pointer"
                >
                  Submit Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Parent / Guardian Name</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Child's Name</label>
                    <input
                      type="text"
                      required
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      placeholder="e.g. Aarav"
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject / Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="telehealth">Telehealth / Online Video Consultation</option>
                    <option value="ling_troubleshooting">Ling-6 Sound Practice Troubleshooting</option>
                    <option value="device_calibration">Cochlear Implant / Hearing Aid Mapping Access</option>
                    <option value="general_advice">General Pediatric Speech Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Observation Details</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your child's recent responses to sounds or any questions for the speech team..."
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-try-gradient px-7 py-3 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
  );
};
