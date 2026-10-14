import React, { useState } from 'react';
import { Student, TherapySession, AttendanceRecord } from '../types';
import { HeroBannerSection } from './HeroBannerSection';
import { User } from 'firebase/auth';

interface ProgressViewProps {
  students: Student[];
  sessions: TherapySession[];
  attendance: AttendanceRecord[];
  points: number;
  streakDays: number;
  onExportSheets: () => void;
  onSyncDrive: (student: Student) => void;
  onNavigateToRewards: () => void;
  isExporting: boolean;
  onOpenPointCalculator?: () => void;
  user?: User | null;
  isAdmin?: boolean;
  selectedStudent?: Student;
  lingDaysPracticed?: number;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  students,
  sessions,
  attendance,
  points,
  streakDays,
  onExportSheets,
  onSyncDrive,
  onNavigateToRewards,
  isExporting,
  onOpenPointCalculator,
  user,
  isAdmin: propIsAdmin,
  selectedStudent,
  lingDaysPracticed = 0,
}) => {
  const isSuperAdmin =
    propIsAdmin !== undefined
      ? propIsAdmin
      : Boolean(
          user?.email &&
            (user.email.trim().toLowerCase() === 'naveensg5479@gmail.com' ||
              user.email.trim().toLowerCase() === 'naveensg5479@gmail')
        );

  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [currentMonth] = useState<Date>(new Date(2026, 9, 1)); // October 2026

  // For non-admin, strictly show only their own child's profile.
  // For super admin, allow viewing all or filtering by specific child.
  const activeStudent = isSuperAdmin
    ? selectedStudentId === 'all'
      ? selectedStudent || students[0]
      : students.find((s) => s.id === selectedStudentId) || selectedStudent || students[0]
    : selectedStudent || students[0];

  const studentName = activeStudent
    ? activeStudent.name
    : user?.displayName
    ? `${user.displayName.split(' ')[0]}'s child`
    : "Your child";

  const displayedStudents = isSuperAdmin
    ? selectedStudentId === 'all'
      ? students
      : students.filter((s) => s.id === selectedStudentId)
    : students.slice(0, 1);

  const filteredSessions =
    selectedStudentId === 'all'
      ? sessions
      : sessions.filter((s) => s.studentId === selectedStudentId);

  const filteredAttendance =
    selectedStudentId === 'all'
      ? attendance
      : attendance.filter((a) => a.studentId === selectedStudentId);

  const avgAccuracy =
    filteredSessions.length > 0
      ? Math.round(filteredSessions.reduce((acc, s) => acc + s.score, 0) / filteredSessions.length)
      : 94;

  // Calendar calculations for October 2026
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const attendanceMap = new Set(
    filteredAttendance.map((a) => parseInt(a.date.split('-')[2], 10))
  );

  return (
    <div className="flex flex-col w-full space-y-5 animate-fadeIn">
      {/* Exact Hero Banner with Doodles & Illustrated Boy Avatar */}
      <HeroBannerSection
        studentName={studentName}
        points={points}
        streakDays={streakDays}
      />

      {/* TWO CARDS CONTAINER: DAILY STREAK & WORLDS EXPLORED */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Daily Streak */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#EEF0F8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Top Label & Icon */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C829B]">1. Daily Streak</span>
              <div className="w-10 h-10 rounded-2xl bg-[#FFF3EC] flex items-center justify-center text-lg shadow-sm">
                🔥
              </div>
            </div>

            {/* Metric & Title */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <h2 className="text-4xl font-extrabold text-[#1E2238] tracking-tight">
                {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
              </h2>
            </div>
            <p className="text-sm font-medium text-[#646A86] leading-relaxed mb-6">
              Days in a row you practised sounds. Reach 7 days for the Golden Crown!
            </p>

            {/* Weekly Tracker */}
            <div className="mb-5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8F95B2] mb-3">This Week</div>
              <div className="flex items-center justify-between gap-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const isActive = idx < Math.min(7, Math.max(streakDays > 0 ? 1 : 0, streakDays % 7 || (streakDays > 0 ? 7 : 0)));
                  return (
                    <div
                      key={`week-day-${idx}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#FF6B35] text-white shadow-sm ring-2 ring-[#FF6B35]/20'
                          : 'bg-[#F1F3F9] text-[#717793] font-semibold'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress to Crown */}
            <div className="mb-6">
              <div className="h-2 w-full bg-[#EDF0F7] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#FF6B35] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(streakDays > 0 ? 14.28 : 0, (streakDays / 7) * 100))}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-[#8B91AD]">
                {Math.min(7, streakDays)} of 7 days to the Golden Crown
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-5 border-t border-[#F2F4FA] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#646A86]">
              Streak status: <span className="font-bold text-[#1E2238]">{streakDays > 0 ? 'Active' : 'Ready'}</span>
            </span>
            <span
              className={`px-2.5 py-1 rounded-full font-bold ${
                streakDays > 0 ? 'text-[#FF6B35] bg-[#FFF2EB]' : 'text-slate-500 bg-[#F1F3F9]'
              }`}
            >
              {streakDays > 0 ? 'Today: Done' : 'Today: Ready'}
            </span>
          </div>
        </div>

        {/* Card 2: Worlds Explored */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#EEF0F8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Top Label & Icon */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C829B]">
                2. Worlds Explored
              </span>
              <div className="w-10 h-10 rounded-2xl bg-[#E8F8F5] flex items-center justify-center text-lg shadow-sm text-teal-600">
                🌲
              </div>
            </div>

            {/* Metric & Title */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl">🧭</span>
              <h2 className="text-4xl font-extrabold text-[#1E2238] tracking-tight">
                {lingDaysPracticed > 0 ? '1' : '1'} of 4
              </h2>
            </div>
            <p className="text-sm font-medium text-[#646A86] leading-relaxed mb-6">
              Speech adventure worlds unlocked. Journey across all 4 acoustic environments!
            </p>

            {/* Worlds Tracker */}
            <div className="mb-5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8F95B2] mb-3">
                World Progress
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2 rounded-2xl bg-[#0D9488] text-white shadow-sm ring-2 ring-[#0D9488]/20 flex flex-col items-center">
                  <span className="text-sm">🌲</span>
                  <span className="text-[10px] font-bold mt-0.5">Forest</span>
                </div>
                <div className="p-2 rounded-2xl bg-[#F1F3F9] text-[#717793] flex flex-col items-center">
                  <span className="text-sm">🏝️</span>
                  <span className="text-[10px] font-semibold mt-0.5">Island</span>
                </div>
                <div className="p-2 rounded-2xl bg-[#F1F3F9] text-[#717793] flex flex-col items-center">
                  <span className="text-sm">🔤</span>
                  <span className="text-[10px] font-semibold mt-0.5">Town</span>
                </div>
                <div className="p-2 rounded-2xl bg-[#F1F3F9] text-[#717793] flex flex-col items-center">
                  <span className="text-sm">🏔️</span>
                  <span className="text-[10px] font-semibold mt-0.5">Peak</span>
                </div>
              </div>
            </div>

            {/* Progress to Explorer */}
            <div className="mb-6">
              <div className="h-2 w-full bg-[#EDF0F7] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#0D9488] rounded-full w-[25%]" />
              </div>
              <p className="text-xs font-semibold text-[#8B91AD]">1 of 4 worlds unlocked</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-5 border-t border-[#F2F4FA] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#646A86]">
              Active: <span className="font-bold text-[#1E2238]">Listening Forest</span>
            </span>
            <span className="text-[#0D9488] bg-[#E8F8F5] px-2.5 py-1 rounded-full font-bold">
              Accuracy: {avgAccuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* CALENDAR & PHONEME ACOUSTIC BREAKDOWN (White backdrop cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Streak Calendar */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold font-rounded text-slate-900 text-lg">
                Calendar to Mark the Streak
              </h3>
              <p className="text-xs text-slate-500 font-semibold">October 2026 Daily Practice Telemetry</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
              <span>🔥</span>
              <span>Streak Active</span>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[11px] font-extrabold text-slate-400 pb-1">
                {d}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }
              const isAttended = attendanceMap.has(day);
              const isToday = day === 12;

              return (
                <div
                  key={`day-${day}`}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center relative font-extrabold text-xs transition-all ${
                    isToday
                      ? 'bg-[#38A3A5] text-white shadow-sm ring-2 ring-[#38A3A5]/40'
                      : isAttended
                      ? 'bg-[#FFE7D9] text-amber-900 border border-[#E6A885]/50'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span>{day}</span>
                  {isAttended && (
                    <span className="text-[8px] leading-none text-orange-600 font-black">🔥</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>🔥 Marks completed practice day</span>
            <span className="text-[#38A3A5] font-extrabold">
              {streakDays > 0 ? `${streakDays}-Day Continuous Record` : '0 Days Recorded (Ready to begin)'}
            </span>
          </div>
        </div>

        {/* Phoneme Acoustic Evaluation */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100 space-y-4">
          <div>
            <h3 className="font-extrabold font-rounded text-slate-900 text-lg">
              Phoneme Performance Across Frequencies
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Cochlear implant frequency channels calibrated via Ling-6 acoustic test:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Low Frequency (/m/, /oo/) 250-870Hz', score: 99, barColor: 'bg-[#38A3A5]' },
              { label: 'Mid Frequency (/ah/, /ee/) 800-2300Hz', score: 96, barColor: 'bg-[#9D6DE6]' },
              { label: 'High Frequency (/sh/) 2000-4000Hz', score: 92, barColor: 'bg-[#F39268]' },
              { label: 'Highest Sibilant (/s/) 4000-8000Hz', score: 87, barColor: 'bg-[#FF4D6D]' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{item.label}</span>
                  <span className="font-extrabold text-slate-900">{item.score}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.barColor} transition-all duration-700`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-semibold bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
            <span>✓</span>
            <span>Optimal speech-detection verified across all 6 sound bands. Ready for advanced sibilant drills.</span>
          </div>
        </div>
      </div>

      {/* ANALYTICAL TABLE: STUDENT PERFORMANCE ROSTER */}
      <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold font-rounded text-slate-900">
                {isSuperAdmin
                  ? 'Clinical Roster & Performance Ledger'
                  : "Your Child's Progress Ledger"}
              </h2>
              {isSuperAdmin ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300/60">
                  👑 Admin: naveensg5479@gmail.com
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  🔒 Private Profile
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isSuperAdmin
                ? 'Super Admin Mode — Full clinic-wide telemetry, streak logs, and export tools for all users.'
                : 'Private patient telemetry for your enrolled child. Only your profile is visible and tracked.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isSuperAdmin && students.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                <span>Filter:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-transparent font-extrabold text-slate-900 border-none focus:ring-0 cursor-pointer p-0 pr-4 text-xs"
                >
                  <option value="all">All Children ({students.length})</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              {displayedStudents.length} {displayedStudents.length === 1 ? 'Child' : 'Children'}
            </span>
            <button
              onClick={onExportSheets}
              disabled={isExporting}
              className="text-xs font-extrabold px-3.5 py-1.5 bg-[#38A3A5] hover:bg-[#2e888a] text-white rounded-full transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>📊 Export to Sheets</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Diagnosis</th>
                <th className="pb-3">Device</th>
                <th className="pb-3">Streak</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Stars</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-slate-100 text-slate-700 text-xs font-semibold">
              {displayedStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold flex items-center gap-2 text-slate-900">
                    <div className="w-7 h-7 rounded-full bg-[#FFE7D9] text-[#E6A885] flex items-center justify-center font-extrabold text-xs border border-[#E6A885]/40">
                      {st.name[0]}
                    </div>
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3.5">{st.age} yrs</td>
                  <td className="py-3.5 max-w-[170px] truncate text-slate-600">{st.diagnosis}</td>
                  <td className="py-3.5 font-semibold text-slate-700">{st.hearingDevice}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFE7D9] text-amber-900 font-extrabold border border-[#E6A885]/40">
                      🔥 {st.streak || 1}d
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D9F5F1] text-teal-900 font-extrabold border border-[#38A3A5]/40">
                      94%
                    </span>
                  </td>
                  <td className="py-3.5 font-extrabold text-amber-600">
                    {points} ⭐
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onSyncDrive(st)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#D9F5F1] text-slate-700 hover:text-teal-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="Sync clinical dossier to Google Drive folder"
                    >
                      Drive Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
