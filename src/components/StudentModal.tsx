import React, { useState } from 'react';
import { X, UserPlus, Heart, Sparkles, Check } from 'lucide-react';
import { Student, Ling6Phoneme } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  editingStudent?: Student | null;
}

const ALL_LING6: Ling6Phoneme[] = ['m', 'ah', 'oo', 'ee', 'sh', 's'];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
}) => {
  const [name, setName] = useState(editingStudent?.name || '');
  const [age, setAge] = useState<number>(editingStudent?.age || 5);
  const [diagnosis, setDiagnosis] = useState(
    editingStudent?.diagnosis || 'Cochlear Implant - Bilateral'
  );
  const [hearingDevice, setHearingDevice] = useState(
    editingStudent?.hearingDevice || 'Cochlear Nucleus 8'
  );
  const [parentName, setParentName] = useState(editingStudent?.parentName || '');
  const [parentEmail, setParentEmail] = useState(
    editingStudent?.parentEmail || ''
  );
  const [parentPhone, setParentPhone] = useState(editingStudent?.parentPhone || '+1 (555) 019-2834');
  const [assignedTherapist, setAssignedTherapist] = useState(
    editingStudent?.assignedTherapist || 'Dr. Sarah Mitchell, CCC-SLP'
  );
  const [targetSounds, setTargetSounds] = useState<Ling6Phoneme[]>(
    editingStudent?.targetSounds || ['m', 'ah', 'oo', 'ee', 'sh', 's']
  );
  const [notes, setNotes] = useState(
    editingStudent?.notes || 'Enrolled in Ling-6 acoustic calibration & Listening Forest program.'
  );

  if (!isOpen) return null;

  const toggleSound = (sound: Ling6Phoneme) => {
    if (targetSounds.includes(sound)) {
      setTargetSounds(targetSounds.filter((s) => s !== sound));
    } else {
      setTargetSounds([...targetSounds, sound]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const studentData: Student = {
      id: editingStudent?.id || `student-${Date.now()}`,
      name,
      age: Number(age),
      diagnosis,
      hearingDevice,
      parentName,
      parentEmail,
      parentPhone,
      assignedTherapist,
      targetSounds,
      notes,
      streak: editingStudent?.streak !== undefined ? editingStudent.streak : 0,
      points: editingStudent?.points !== undefined ? editingStudent.points : 0,
      lingDaysPracticed: editingStudent?.lingDaysPracticed !== undefined ? editingStudent.lingDaysPracticed : 0,
      enrolledDate: editingStudent?.enrolledDate || new Date().toISOString().slice(0, 10),
      level: editingStudent?.level || 1,
    };

    onSave(studentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {editingStudent ? 'Edit Student Profile' : 'Enroll New Child Patient'}
              </h3>
              <p className="text-xs text-emerald-100">
                Auditory-Verbal diagnostic dossier & calibration goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Child Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo Alexander"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="18"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Clinical Diagnosis
              </label>
              <select
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white"
              >
                <option value="Cochlear Implant - Bilateral">Cochlear Implant - Bilateral</option>
                <option value="Cochlear Implant - Unilateral">Cochlear Implant - Unilateral</option>
                <option value="Auditory Neuropathy Spectrum Disorder (ANSD)">ANSD (Auditory Neuropathy)</option>
                <option value="Sensorineural Hearing Loss (Moderate/Severe)">Sensorineural Hearing Loss</option>
                <option value="Conductive Hearing Loss">Conductive Hearing Loss</option>
                <option value="Developmental Speech & Language Delay">Speech & Language Delay</option>
                <option value="Phonological Articulation Disorder">Phonological Articulation Disorder</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hearing Device / Technology
              </label>
              <input
                type="text"
                value={hearingDevice}
                onChange={(e) => setHearingDevice(e.target.value)}
                placeholder="e.g. Cochlear Nucleus 8, Med-El Rondo, Hearing Aid"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Parent Contact & Automated Gmail Delivery Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Sarah Alexander"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Parent Email (Automated Reports Recipient) *
                </label>
                <input
                  type="email"
                  required
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Target Ling-6 Phonemes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Target Ling-6 Phoneme Calibration Set
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_LING6.map((sound) => {
                const isSelected = targetSounds.includes(sound);
                return (
                  <button
                    type="button"
                    key={sound}
                    onClick={() => toggleSound(sound)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 font-bold text-sm ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>/{sound}/</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Therapist Notes / Goals
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {editingStudent ? 'Save Changes' : 'Enroll Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
