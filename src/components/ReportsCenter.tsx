import React, { useState } from 'react';
import {
  Mail,
  Send,
  Cloud,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Calendar,
  Flame,
  Award,
  Clock,
  Eye,
} from 'lucide-react';
import { Student, TherapySession, AttendanceRecord } from '../types';

interface ReportsCenterProps {
  students: Student[];
  sessions: TherapySession[];
  attendance: AttendanceRecord[];
  onSendGmailReport: (params: {
    student: Student;
    reportType: 'Daily' | 'Weekly' | 'Monthly';
    notes: string;
  }) => void;
  onSyncDrive: (student: Student) => void;
  onExportSheets: () => void;
  isSendingEmail: boolean;
  isSyncingDrive: boolean;
  isExportingSheets: boolean;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  students,
  sessions,
  attendance,
  onSendGmailReport,
  onSyncDrive,
  onExportSheets,
  isSendingEmail,
  isSyncingDrive,
  isExportingSheets,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'student-aarav'
  );
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [therapistNotes, setTherapistNotes] = useState(
    'Aarav demonstrated robust 100% detection on low-frequency Ling-6 vowels (/m/, /oo/, /ah/) at 3 meters. Sibilant sounds (/sh/, /s/) showed marked progress at 2 meters. Recommended home practice: 10 minutes of Listening Forest sound games.'
  );
  const [showPreview, setShowPreview] = useState(true);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentSessions = sessions.filter((s) => s.studentId === selectedStudent?.id);
  const avgScore =
    studentSessions.length > 0
      ? Math.round(studentSessions.reduce((acc, s) => acc + s.score, 0) / studentSessions.length)
      : 92;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5 text-rose-600" />
            <span>Automated Gmail & Cloud Notification Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Automated Parent & Student Milestone Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Deliver comprehensive daily, weekly, and monthly speech pathology milestones directly to parents via Gmail, backed up to Google Drive and tracked in Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-800 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Privacy Standards Compliant</span>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Recipient Student
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} (Parent: {st.parentName || st.parentEmail})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Report Cadence Type
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  reportType === type
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Target Gmail Recipient
          </label>
          <input
            type="email"
            readOnly
            value={selectedStudent?.parentEmail || ''}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-600"
          />
        </div>
      </div>

      {/* Report Customization & Live Email Template Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Action Box */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base">Therapist Clinical Addendum</h3>
            <p className="text-xs text-slate-500">
              Customize individualized recommendations that will be embedded into the automated email notification.
            </p>
            <textarea
              rows={5}
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() =>
                selectedStudent &&
                onSendGmailReport({
                  student: selectedStudent,
                  reportType,
                  notes: therapistNotes,
                })
              }
              disabled={isSendingEmail}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingEmail ? 'Sending via Gmail API...' : `Send ${reportType} Report via Gmail`}</span>
            </button>
          </div>

          {/* Quick Workspace Sync Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm">Associated Workspace Operations</h3>

            <button
              onClick={() => selectedStudent && onSyncDrive(selectedStudent)}
              disabled={isSyncingDrive}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-all flex items-center justify-center gap-2"
            >
              <Cloud className="w-4 h-4 text-teal-600" />
              <span>{isSyncingDrive ? 'Saving...' : 'Save Dossier to Google Drive'}</span>
            </button>

            <button
              onClick={onExportSheets}
              disabled={isExportingSheets}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>{isExportingSheets ? 'Exporting...' : 'Export Attendance & Analytics Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Right Live Email Preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="font-black text-slate-800 text-base">Live Gmail Notification Preview</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              To: {selectedStudent?.parentEmail}
            </span>
          </div>

          {/* The Styled Email Container */}
          <div className="rounded-2xl border border-slate-200 p-6 sm:p-8 bg-slate-50/50 space-y-6">
            <div className="text-center pb-4 border-b border-emerald-100">
              <span className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                VETRI OSAI • PEDIATRIC SPEECH CARE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                {reportType} Speech & Auditory Milestone Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Automated clinical progress tracking delivered for {selectedStudent?.name}
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-xl p-4 border-l-4 border-emerald-500 shadow-xs space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 text-sm">{selectedStudent?.name} (Age: {selectedStudent?.age})</div>
              <div className="text-slate-600">
                <span className="font-semibold">Diagnosis:</span> {selectedStudent?.diagnosis}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Hearing Device:</span> {selectedStudent?.hearingDevice}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Attending Therapist:</span> {selectedStudent?.assignedTherapist}
              </div>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="text-xl font-black text-emerald-800">🔥 {selectedStudent?.streak} Days</div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Active Streak</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="text-xl font-black text-blue-800">{avgScore}%</div>
                <div className="text-[10px] font-bold text-blue-700 uppercase mt-0.5">Mean Accuracy</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div className="text-xl font-black text-purple-800">{studentSessions.length}</div>
                <div className="text-[10px] font-bold text-purple-700 uppercase mt-0.5">Sessions Logged</div>
              </div>
            </div>

            {/* Ling-6 Table Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Acoustic Frequency Calibration Summary
              </h4>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                <div className="grid grid-cols-3 p-2 bg-slate-100 font-bold text-slate-600 text-[11px]">
                  <span>Phoneme</span>
                  <span>Frequency Band</span>
                  <span>Calibration Status</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-3 p-2 font-medium">
                    <span>/m/ (Bee)</span>
                    <span className="text-slate-500">Low (250 Hz)</span>
                    <span className="text-emerald-700 font-bold">✓ 100% Detected (3m)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2 font-medium">
                    <span>/oo/ (Monkey)</span>
                    <span className="text-slate-500">Low-Mid (300-870 Hz)</span>
                    <span className="text-emerald-700 font-bold">✓ 100% Detected (3m)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2 font-medium">
                    <span>/ah/ (Lion)</span>
                    <span className="text-slate-500">Mid (800-1200 Hz)</span>
                    <span className="text-emerald-700 font-bold">✓ 95% Detected (2.5m)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2 font-medium">
                    <span>/sh/ (Quiet Tiger)</span>
                    <span className="text-slate-500">High (2000-4000 Hz)</span>
                    <span className="text-amber-700 font-bold">● 86% Detected (Targeting)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Therapist Home Advice */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 mb-1">
                Clinical Recommendations & Home Exercises
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">{therapistNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
