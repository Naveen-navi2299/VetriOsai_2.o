import React from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  Trees,
  Calendar,
  Mail,
  UserPlus,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Student, TherapySession, ClassSchedule } from '../types';

interface DashboardOverviewProps {
  students: Student[];
  sessions: TherapySession[];
  schedules: ClassSchedule[];
  selectedStudent: Student;
  onSelectStudent: (student: Student) => void;
  onNavigateTab: (tab: string) => void;
  onOpenEnrollModal: () => void;
  onOpenDriveSync: (student: Student) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  sessions,
  schedules,
  selectedStudent,
  onSelectStudent,
  onNavigateTab,
  onOpenEnrollModal,
  onOpenDriveSync,
}) => {
  const studentSessions = sessions.filter((s) => s.studentId === selectedStudent.id);
  const totalCompleted = studentSessions.length;
  const recentSession = studentSessions[0];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pediatric Speech & Auditory Care Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Nurturing Speech, Sound & Auditory Confidence
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Personalized acoustic calibration routines for children with cochlear implants and speech delays. Automatically synchronizing with Google Drive, Calendar, Gmail notifications, and Sheets telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('ling6')}
              className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-lg hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Start Ling-6 Calibration</span>
            </button>

            <button
              onClick={() => onNavigateTab('forest')}
              className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-850 text-white font-bold text-xs border border-emerald-400/30 transition-all flex items-center gap-2"
            >
              <Trees className="w-4 h-4 text-emerald-300" />
              <span>Explore Listening Forest</span>
            </button>

            <button
              onClick={onOpenEnrollModal}
              className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Child</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Cohort Selector Strip with Streaks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">Active Students & Daily Streaks</h2>
          <span className="text-xs font-semibold text-slate-500">
            Click student card to switch active profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {students.map((st) => {
            const isSelected = selectedStudent.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => onSelectStudent(st)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {st.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                        <div className="text-[11px] text-slate-500">{st.age} years old</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{st.streak}d</span>
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-semibold text-slate-700 truncate">{st.diagnosis}</div>
                    <div className="text-[11px] text-slate-500 truncate">{st.hearingDevice}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700">Level {st.level} Calibration</span>
                  <span className="text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                    <span>Selected</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Today's Routine + Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-800 text-base">Class Schedules</h3>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Recurring therapy routines connected to your Google Calendar.
            </p>

            <div className="space-y-3">
              {schedules.slice(0, 3).map((sched) => (
                <div
                  key={sched.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{sched.title}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {sched.dayOfWeek}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {sched.startTime} - {sched.endTime} ({sched.therapist})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigateTab('schedule')}
              className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>Manage & Sync Calendar Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Student Active Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  {selectedStudent.name}'s Auditory Milestones
                </h3>
                <p className="text-xs text-slate-500">
                  Target sound coverage, streak record, and recent clinical notes
                </p>
              </div>

              <button
                onClick={() => onOpenDriveSync(selectedStudent)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
              >
                <span>Backup to Drive</span>
              </button>
            </div>

            {/* Quick sound badge pills */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-6">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Active Ling-6 Calibration Phonemes
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.targetSounds.map((snd) => (
                  <span
                    key={snd}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-black text-slate-800 text-xs shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>/{snd}/</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Session card */}
            {recentSession && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    Latest Session: {recentSession.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Score: {recentSession.score}%
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {recentSession.notes}
                </p>
                <div className="text-[10px] text-emerald-600 font-medium pt-1">
                  Recorded on {new Date(recentSession.date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{totalCompleted} Completed Sessions</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('reports')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Gmail Report</span>
              </button>

              <button
                onClick={() => onNavigateTab('analytics')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>View Full Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
