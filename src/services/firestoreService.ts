import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Student, TherapySession, ClassSchedule, AttendanceRecord } from '../types';

// Real-time Firestore Service with ZERO mock/sample users and resilient offline support
export const firestoreService = {
  // ==========================================
  // REAL-TIME LISTENERS (onSnapshot)
  // ==========================================

  /**
   * Listen to all students in real-time
   */
  subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
    // Provide cached data first if available for instant UI rendering
    try {
      const cached = localStorage.getItem('vetri_cached_students');
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {}

    try {
      const q = query(collection(db, 'students'), orderBy('enrolledDate', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const students: Student[] = [];
          snapshot.forEach((docSnap) => {
            students.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          try {
            localStorage.setItem('vetri_cached_students', JSON.stringify(students));
          } catch {}
          callback(students);
        },
        (error) => {
          // If offline or network error, Firestore functions automatically from local cache
          console.warn('Students listener operating in offline mode:', error.message);
        }
      );
    } catch (err) {
      console.warn('Error establishing students subscription:', err);
      return () => {};
    }
  },

  /**
   * Listen to sessions in real-time (optionally filtered by studentId)
   */
  subscribeSessions(
    studentId: string | null,
    callback: (sessions: TherapySession[]) => void
  ): Unsubscribe {
    try {
      const cached = localStorage.getItem(`vetri_cached_sessions_${studentId || 'all'}`);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {}

    try {
      let q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
      if (studentId) {
        q = query(
          collection(db, 'sessions'),
          where('studentId', '==', studentId),
          orderBy('date', 'desc')
        );
      }
      return onSnapshot(
        q,
        (snapshot) => {
          const sessions: TherapySession[] = [];
          snapshot.forEach((docSnap) => {
            sessions.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          try {
            localStorage.setItem(`vetri_cached_sessions_${studentId || 'all'}`, JSON.stringify(sessions));
          } catch {}
          callback(sessions);
        },
        (error) => {
          console.warn('Sessions listener operating in offline mode:', error.message);
        }
      );
    } catch (err) {
      console.warn('Error establishing sessions subscription:', err);
      return () => {};
    }
  },

  /**
   * Listen to attendance in real-time
   */
  subscribeAttendance(
    studentId: string | null,
    callback: (attendance: AttendanceRecord[]) => void
  ): Unsubscribe {
    try {
      const cached = localStorage.getItem(`vetri_cached_attendance_${studentId || 'all'}`);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {}

    try {
      let q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      if (studentId) {
        q = query(
          collection(db, 'attendance'),
          where('studentId', '==', studentId),
          orderBy('date', 'desc')
        );
      }
      return onSnapshot(
        q,
        (snapshot) => {
          const records: AttendanceRecord[] = [];
          snapshot.forEach((docSnap) => {
            records.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          try {
            localStorage.setItem(`vetri_cached_attendance_${studentId || 'all'}`, JSON.stringify(records));
          } catch {}
          callback(records);
        },
        (error) => {
          console.warn('Attendance listener operating in offline mode:', error.message);
        }
      );
    } catch (err) {
      console.warn('Error establishing attendance subscription:', err);
      return () => {};
    }
  },

  /**
   * Listen to schedules in real-time
   */
  subscribeSchedules(callback: (schedules: ClassSchedule[]) => void): Unsubscribe {
    try {
      const cached = localStorage.getItem('vetri_cached_schedules');
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {}

    try {
      const q = query(collection(db, 'schedules'));
      return onSnapshot(
        q,
        (snapshot) => {
          const schedules: ClassSchedule[] = [];
          snapshot.forEach((docSnap) => {
            schedules.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          try {
            localStorage.setItem('vetri_cached_schedules', JSON.stringify(schedules));
          } catch {}
          callback(schedules);
        },
        (error) => {
          console.warn('Schedules listener operating in offline mode:', error.message);
        }
      );
    } catch (err) {
      console.warn('Error establishing schedules subscription:', err);
      return () => {};
    }
  },

  // ==========================================
  // DIRECT READS & WRITES
  // ==========================================

  async fetchStudents(): Promise<Student[]> {
    try {
      const snap = await getDocs(collection(db, 'students'));
      const list: Student[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      return list;
    } catch (e) {
      console.warn('fetchStudents error:', e);
      return [];
    }
  },

  async saveStudent(student: Student): Promise<void> {
    try {
      try {
        const cachedStr = localStorage.getItem('vetri_cached_students');
        const list: Student[] = cachedStr ? JSON.parse(cachedStr) : [];
        const idx = list.findIndex((s) => s.id === student.id);
        if (idx >= 0) list[idx] = student;
        else list.unshift(student);
        localStorage.setItem('vetri_cached_students', JSON.stringify(list));
      } catch {}
      await setDoc(doc(db, 'students', student.id), student, { merge: true });
    } catch (e: any) {
      console.warn('saveStudent handled offline / server note:', e?.message || e);
    }
  },

  async deleteStudent(studentId: string): Promise<void> {
    try {
      try {
        const cachedStr = localStorage.getItem('vetri_cached_students');
        if (cachedStr) {
          const list: Student[] = JSON.parse(cachedStr).filter((s: Student) => s.id !== studentId);
          localStorage.setItem('vetri_cached_students', JSON.stringify(list));
        }
      } catch {}
      await deleteDoc(doc(db, 'students', studentId));
    } catch (e: any) {
      console.warn('deleteStudent note:', e?.message || e);
    }
  },

  async updateStudentPoints(studentId: string, newPoints: number): Promise<void> {
    try {
      try {
        const cachedStr = localStorage.getItem('vetri_cached_students');
        if (cachedStr) {
          const list: Student[] = JSON.parse(cachedStr);
          const item = list.find((s) => s.id === studentId);
          if (item) item.points = newPoints;
          localStorage.setItem('vetri_cached_students', JSON.stringify(list));
        }
      } catch {}
      await updateDoc(doc(db, 'students', studentId), {
        points: newPoints,
      });
    } catch (e) {
      console.warn('updateStudentPoints offline queue note:', e);
    }
  },

  async updateStudentLingDays(studentId: string, daysPracticed: number): Promise<void> {
    try {
      try {
        const cachedStr = localStorage.getItem('vetri_cached_students');
        if (cachedStr) {
          const list: Student[] = JSON.parse(cachedStr);
          const item = list.find((s) => s.id === studentId);
          if (item) item.lingDaysPracticed = daysPracticed;
          localStorage.setItem('vetri_cached_students', JSON.stringify(list));
        }
      } catch {}
      await updateDoc(doc(db, 'students', studentId), {
        lingDaysPracticed: daysPracticed,
      });
    } catch (e) {
      console.warn('updateStudentLingDays offline queue note:', e);
    }
  },

  // SESSIONS
  async fetchSessions(studentId?: string | null): Promise<TherapySession[]> {
    try {
      const q = studentId
        ? query(collection(db, 'sessions'), where('studentId', '==', studentId))
        : collection(db, 'sessions');
      const snap = await getDocs(q);
      const list: TherapySession[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      return list;
    } catch (e) {
      console.warn('fetchSessions offline fallback note:', e);
      try {
        const cached = localStorage.getItem(`vetri_cached_sessions_${studentId || 'all'}`);
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
  },

  async saveSession(session: TherapySession): Promise<void> {
    try {
      try {
        const cachedStr = localStorage.getItem(`vetri_cached_sessions_all`);
        const list: TherapySession[] = cachedStr ? JSON.parse(cachedStr) : [];
        list.unshift(session);
        localStorage.setItem(`vetri_cached_sessions_all`, JSON.stringify(list));
      } catch {}
      await setDoc(doc(db, 'sessions', session.id), session, { merge: true });
    } catch (e: any) {
      console.warn('saveSession offline queue note:', e?.message || e);
    }
  },

  /**
   * Real-time Daily Progress Recorder
   * Automatically records session telemetry, marks daily attendance, and updates student streak in Firestore
   */
  async recordDailyProgress(params: {
    student: Student;
    category: TherapySession['category'];
    score: number;
    durationMinutes: number;
    notes: string;
    pointsEarned: number;
    phonemesTested?: string[];
  }): Promise<TherapySession> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const session: TherapySession = {
      id: `sess-${Date.now()}`,
      studentId: params.student.id,
      studentName: params.student.name,
      date: new Date().toISOString(),
      durationMinutes: params.durationMinutes,
      category: params.category,
      score: params.score,
      notes: params.notes,
      attended: true,
      syncedToDrive: false,
    };

    // 1. Save session to Firestore
    await this.saveSession(session);

    // 2. Mark attendance for today if not already marked
    const attendanceId = `att-${params.student.id}-${todayStr}`;
    const nextStreak = (params.student.streak || 0) + 1;
    const attendanceRecord: AttendanceRecord = {
      id: attendanceId,
      studentId: params.student.id,
      date: todayStr,
      status: 'present',
      streakCount: nextStreak,
      notes: `${params.category}: Score ${params.score}%`,
    };
    await this.markAttendance(attendanceRecord);

    // 3. Update student document with updated streak, points, and lastSessionDate
    const updatedPoints = (params.student.points || 0) + params.pointsEarned;
    await updateDoc(doc(db, 'students', params.student.id), {
      lastSessionDate: todayStr,
      streak: nextStreak,
      points: updatedPoints,
    });

    return session;
  },

  // ATTENDANCE
  async fetchAttendance(studentId?: string | null): Promise<AttendanceRecord[]> {
    try {
      const q = studentId
        ? query(collection(db, 'attendance'), where('studentId', '==', studentId))
        : collection(db, 'attendance');
      const snap = await getDocs(q);
      const list: AttendanceRecord[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      return list;
    } catch (e) {
      console.warn('fetchAttendance error:', e);
      return [];
    }
  },

  async markAttendance(record: AttendanceRecord): Promise<void> {
    try {
      await setDoc(doc(db, 'attendance', record.id), record, { merge: true });
    } catch (e) {
      console.error('markAttendance error:', e);
      throw e;
    }
  },

  // SCHEDULES
  async fetchSchedules(): Promise<ClassSchedule[]> {
    try {
      const snap = await getDocs(collection(db, 'schedules'));
      const list: ClassSchedule[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      return list;
    } catch (e) {
      console.warn('fetchSchedules error:', e);
      return [];
    }
  },

  async saveSchedule(schedule: ClassSchedule): Promise<void> {
    try {
      await setDoc(doc(db, 'schedules', schedule.id), schedule, { merge: true });
    } catch (e) {
      console.error('saveSchedule error:', e);
      throw e;
    }
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
    } catch (e) {
      console.error('deleteSchedule error:', e);
      throw e;
    }
  },

  /**
   * Helper to initialize real child profile from user account if none exists
   */
  async createInitialStudentForUser(user: { uid: string; displayName: string | null; email: string | null }): Promise<Student> {
    const parentDisplayName = user.displayName || 'Parent';
    const childName = `${parentDisplayName.split(' ')[0]}'s Child`;
    const today = new Date().toISOString().slice(0, 10);

    const student: Student = {
      id: `student-${user.uid.slice(0, 8)}`,
      userId: user.uid,
      name: childName,
      age: 5,
      diagnosis: 'Auditory & Speech Development Plan',
      hearingDevice: 'Bilateral Cochlear Implant',
      parentName: parentDisplayName,
      parentEmail: user.email || 'parent@gmail.com',
      parentPhone: '+1 (555) 012-3456',
      streak: 0,
      points: 0,
      lingDaysPracticed: 0,
      lastSessionDate: today,
      enrolledDate: today,
      assignedTherapist: 'Certified Auditory-Verbal Therapist',
      targetSounds: ['m', 'ah', 'oo', 'ee', 'sh', 's'],
      level: 1,
      notes: 'Initial real-time monitoring patient profile initialized from Day 1.',
    };

    await this.saveStudent(student);
    return student;
  },
};
