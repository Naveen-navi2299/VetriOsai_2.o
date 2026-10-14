import React, { useState } from 'react';
import { Student, ClassSchedule } from '../types';
import { User } from 'firebase/auth';
import { ChildDetailsView } from './ChildDetailsView';

interface SettingsViewProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (st: Student) => void;
  onOpenEnrollModal: () => void;
  onSaveStudent?: (st: Student) => void;
  onSyncDrive: (student: Student) => void;
  onExportSheets: () => void;
  onSendGmailReport: (student: Student) => void;
  onSyncCalendar: () => void;
  user: User | null;
  hasWorkspaceToken: boolean;
  onSignIn: () => void;
  isAdmin?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onOpenEnrollModal,
  onSaveStudent,
  onSyncDrive,
  onExportSheets,
  onSendGmailReport,
  onSyncCalendar,
  user,
  hasWorkspaceToken,
  onSignIn,
  isAdmin: propIsAdmin,
}) => {
  const isSuperAdmin =
    propIsAdmin !== undefined
      ? propIsAdmin
      : Boolean(
          user?.email &&
            (user.email.trim().toLowerCase() === 'naveensg5479@gmail.com' ||
              user.email.trim().toLowerCase() === 'naveensg5479@gmail')
        );

  const [activeSubTab, setActiveSubTab] = useState<'child_details' | 'integrations'>('child_details');
  const [processorMap, setProcessorMap] = useState('Map 1 (Everyday Calm)');
  const [volumeLevel, setVolumeLevel] = useState(8);
  const [micSensitivity, setMicSensitivity] = useState(70);

  // If a non-admin user ever has integrations active, force back to child_details
  const currentSubTab = isSuperAdmin ? activeSubTab : 'child_details';

  return (
    <div className="flex flex-col w-full pb-10 space-y-6 animate-fadeIn">
      {/* Sub-navigation pill switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-2">
        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-full border border-white shadow-sm">
          <button
            onClick={() => setActiveSubTab('child_details')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentSubTab === 'child_details'
                ? 'bg-[#ff622d] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            👶 Child Details Settings
          </button>
          {/* Option 1: Only naveensg5479@gmail can access Workspace & Calibration */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveSubTab('integrations')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentSubTab === 'integrations'
                  ? 'bg-[#ff622d] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              ☁️ Workspace &amp; Calibration
            </button>
          )}
        </div>

        {/* Option 2: Only naveensg5479@gmail can switch between all profiles; other Gmail users can only see their own profile */}
        {isSuperAdmin && students.length > 1 && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white/80 px-4 py-2 rounded-full border border-white shadow-sm">
            <span>Profile:</span>
            <select
              value={selectedStudent.id}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="bg-transparent font-extrabold text-slate-900 border-none focus:ring-0 cursor-pointer p-0 pr-6"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.age} yrs)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentSubTab === 'child_details' ? (
        /* Primary view: The exact Child Details Settings card */
        <div className="w-full flex justify-center">
          <ChildDetailsView
            key={selectedStudent.id}
            initialStudent={selectedStudent}
            user={user}
            canEdit={isSuperAdmin}
            onSave={(updatedStudent) => {
              if (onSaveStudent) {
                onSaveStudent(updatedStudent);
              }
            }}
          />
        </div>
      ) : (
        /* Secondary view: Cloud Workspace sync & Audiological calibration */
        <div className="space-y-6">
          {/* Active Child Profile & Hardware Calibration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Child Profile */}
            <div className="bg-white/95 p-6 md:p-8 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold font-rounded text-slate-800 text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff622d] text-[20px]">badge</span>
                    <span>Active Child Profiles</span>
                  </h3>
                  <button
                    onClick={onOpenEnrollModal}
                    className="text-xs font-bold text-[#ff622d] hover:underline cursor-pointer"
                  >
                    + Add Another Child
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {students.map((st) => {
                    const isSelected = st.id === selectedStudent.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => onSelectStudent(st)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#ffe8dc] border-[#f8bc9f] ring-2 ring-[#ff9b6d]/60'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ff622d] text-white font-bold flex items-center justify-center text-sm">
                            {st.name[0] || 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">{st.name}</div>
                            <div className="text-xs text-slate-500">
                              {st.age} yrs • {st.diagnosis}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[#ff622d] text-[22px]">
                            check_circle
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                <span>Parent Email: {selectedStudent.parentEmail}</span>
                <span className="text-[#ff622d] font-bold">🔥 {selectedStudent.streak} Days</span>
              </div>
            </div>

            {/* Hearing Device & Acoustic Processor Calibration */}
            <div className="bg-white/95 p-6 md:p-8 rounded-[2rem] border border-white shadow-sm space-y-5">
              <h3 className="font-bold font-rounded text-slate-800 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38A3A5] text-[20px]">hearing</span>
                <span>Processor Map &amp; Microphone Setting</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Device Configuration
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedStudent.hearingDevice}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Processor Map Setting
                </label>
                <select
                  value={processorMap}
                  onChange={(e) => setProcessorMap(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-300"
                >
                  <option value="Map 1 (Everyday Calm)">Map 1 (Everyday Calm - Standard 250-8000Hz)</option>
                  <option value="Map 2 (Speech in Noise Focus)">Map 2 (Speech in Noise Focus - Directional)</option>
                  <option value="Map 3 (Melodic & Music Intonation)">Map 3 (Melodic &amp; Music Intonation)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Processor Volume Sensitivity</span>
                    <span className="text-[#ff622d] font-mono">{volumeLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={volumeLevel}
                    onChange={(e) => setVolumeLevel(Number(e.target.value))}
                    className="w-full accent-[#ff622d] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Microphone Sensitivity Floor</span>
                    <span className="text-[#38A3A5] font-mono">{micSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={micSensitivity}
                    onChange={(e) => setMicSensitivity(Number(e.target.value))}
                    className="w-full accent-[#38A3A5] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Google Workspace Cloud Integrations Hub */}
          <div className="bg-white/95 p-6 md:p-8 rounded-[2rem] border border-white shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold font-rounded text-slate-800 text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38A3A5] text-[22px]">cloud_sync</span>
                  <span>Google Workspace Automated Synchronization</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Link therapy telemetry with your Google Drive, Calendar, Gmail notifications, and Google Sheets.
                </p>
              </div>

              {!user && (
                <button
                  onClick={onSignIn}
                  className="px-5 py-2.5 rounded-full bg-[#ff622d] hover:bg-[#f0531c] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Drive */}
              <div className="p-5 rounded-2xl bg-[#d9f1fe]/40 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#d4ecfc] text-[#1b3b54] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">folder</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 font-rounded">Google Drive</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Backup patient progress dossiers to "Vetri Osai" folder.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onSyncDrive(selectedStudent)}
                    className="w-full py-2 px-3 rounded-full bg-[#ff622d] hover:bg-[#f0531c] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Sync Dossier
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <div className="p-5 rounded-2xl bg-[#d9f1fe]/40 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#ffe8dc] text-[#ff622d] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 font-rounded">Google Calendar</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Mark recurring speech therapy routines on calendar.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={onSyncCalendar}
                    className="w-full py-2 px-3 rounded-full bg-[#ff622d] hover:bg-[#f0531c] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Sync Calendar
                  </button>
                </div>
              </div>

              {/* Sheets */}
              <div className="p-5 rounded-2xl bg-[#d9f1fe]/40 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#d0f2e5] text-[#183b32] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">table_view</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 font-rounded">Google Sheets</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Export session rows and telemetry to Google Sheets.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={onExportSheets}
                    className="w-full py-2 px-3 rounded-full bg-[#ff622d] hover:bg-[#f0531c] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Export Sheets
                  </button>
                </div>
              </div>

              {/* Gmail */}
              <div className="p-5 rounded-2xl bg-[#d9f1fe]/40 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 font-rounded">Gmail Dispatch</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Draft &amp; send progress report email to parent.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onSendGmailReport(selectedStudent)}
                    className="w-full py-2 px-3 rounded-full bg-[#ff622d] hover:bg-[#f0531c] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Send Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
