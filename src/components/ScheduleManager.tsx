import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ClassSchedule, Student } from '../types';

interface ScheduleManagerProps {
  schedules: ClassSchedule[];
  students: Student[];
  onAddSchedule: (schedule: ClassSchedule) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  onRequestCalendarSync: (schedule: ClassSchedule) => void;
  isSyncingCalendar: boolean;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  students,
  onAddSchedule,
  onDeleteSchedule,
  onRequestCalendarSync,
  isSyncingCalendar,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'student-aarav'
  );
  const [title, setTitle] = useState('Ling-6 Auditory Calibration & Speech Drill');
  const [dayOfWeek, setDayOfWeek] = useState<ClassSchedule['dayOfWeek']>('Monday');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [therapist, setTherapist] = useState('Dr. Sarah Mitchell, CCC-SLP');
  const [roomOrLink, setRoomOrLink] = useState('Suite 3B / Telehealth');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    const newSchedule: ClassSchedule = {
      id: `sched-${Date.now()}`,
      studentId: selectedStudentId,
      studentName: st?.name || 'Student',
      title: `${st?.name}: ${title}`,
      dayOfWeek,
      startTime,
      endTime,
      recurrence: 'weekly',
      therapist,
      roomOrLink,
      googleCalendarEventId: null,
    };

    await onAddSchedule(newSchedule);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Calendar Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Class Routines & Therapy Schedules
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Automatically mark recurring speech therapy, Ling-6 calibration, and parent coaching routines directly onto your Google Calendar.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Schedule New Class'}</span>
        </button>
      </div>

      {/* Add New Schedule Routine Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-lg space-y-4 animate-fadeIn"
        >
          <h3 className="font-bold text-slate-800 text-base">New Recurring Class Routine</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Enrolled Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.diagnosis})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Session Focus / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ling-6 Auditory Calibration Drill"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Therapist
              </label>
              <input
                type="text"
                value={therapist}
                onChange={(e) => setTherapist(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Location / Link
              </label>
              <input
                type="text"
                value={roomOrLink}
                onChange={(e) => setRoomOrLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md"
            >
              Save Schedule Routine
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((sched) => (
          <div
            key={sched.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Every {sched.dayOfWeek}
                </span>
                <button
                  onClick={() => onDeleteSchedule(sched.id)}
                  title="Remove schedule"
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-extrabold text-slate-800 text-base">{sched.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Student: {sched.studentName}</p>

              <div className="space-y-2 mt-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {sched.startTime} - {sched.endTime} ({sched.recurrence} cadence)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Therapist: {sched.therapist}</span>
                </div>
                <div className="text-slate-500 pl-6 text-[11px]">{sched.roomOrLink}</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {sched.googleCalendarEventId ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Synced with Google Calendar</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Ready to mark on calendar</span>
              )}

              <button
                onClick={() => onRequestCalendarSync(sched)}
                disabled={isSyncingCalendar}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Sync to Google Calendar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
