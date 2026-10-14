import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './firebase';
import { Student, TherapySession, ClassSchedule, AttendanceRecord } from './types';
import { firestoreService } from './services/firestoreService';
import { workspaceService } from './services/workspaceService';

import { ThemeNavbar, NavTab } from './components/ThemeNavbar';
import { HomePageView } from './components/HomePageView';
import { ListeningForestWorld } from './components/ListeningForestWorld';
import { ProgressView } from './components/ProgressView';
import { RewardsView } from './components/RewardsView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { StudentModal } from './components/StudentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LandingPage } from './components/LandingPage';
import { PointCalculatorModal } from './components/PointCalculatorModal';
import { ChildDetailsView } from './components/ChildDetailsView';

// Clean initial student structure (no mock sample users)
const initialStarterStudent: Student = {
  id: 'student-primary',
  name: 'Enrolled Child',
  age: 5,
  gender: 'Male',
  diagnosis: 'Pediatric Auditory-Verbal Plan',
  hearingDevice: 'Bilateral Cochlear Implant',
  parentName: 'Parent',
  parentEmail: 'parent@gmail.com',
  parentPhone: '+1 (555) 012-3456',
  streak: 0,
  points: 0,
  lingDaysPracticed: 0,
  lastSessionDate: new Date().toISOString().slice(0, 10),
  enrolledDate: new Date().toISOString().slice(0, 10),
  assignedTherapist: 'Certified Auditory-Verbal Therapist',
  targetSounds: ['m', 'ah', 'oo', 'ee', 'sh', 's'],
  level: 1,
  notes: 'Real-time monitoring initialized from Day 1.',
};

export default function App() {
  // Only show Landing Page for the first time. If the user already logged in with Gmail, skip landing page and show Home page
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    try {
      const alreadyLoggedIn = localStorage.getItem('vetri_has_logged_in_gmail') === 'true';
      return !alreadyLoggedIn;
    } catch {
      return true;
    }
  });

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // App Navigation: Home, Progress, Rewards, Settings, About, Contact
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [inForestWorld, setInForestWorld] = useState(false);
  const [forestInitialGame, setForestInitialGame] = useState<'overview' | 'card_matching' | 'sound_detective'>('overview');

  // Gamification: Points & 5-day Ling calibration practice (Starts from zero for new users)
  const [points, setPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('vetri_osai_points');
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  const [lingDaysPracticed, setLingDaysPracticed] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('vetri_osai_ling_days');
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  // Core Data - Real-time monitored via Firestore
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student>(initialStarterStudent);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Super Admin Authorization Check:
  // Only naveensg5479@gmail can access all users' details & calibrations
  const isAdmin = Boolean(
    user?.email &&
      (user.email.trim().toLowerCase() === 'naveensg5479@gmail.com' ||
        user.email.trim().toLowerCase() === 'naveensg5479@gmail')
  );

  // Visible students list:
  // naveensg5479@gmail can see and access details of all users.
  // Other Gmail users can see and access strictly their own profile only!
  const visibleStudents = useMemo(() => {
    if (!user) return students.length > 0 ? students : [selectedStudent];
    if (isAdmin) return students.length > 0 ? students : [selectedStudent];
    const userOwn = students.filter(
      (s) =>
        (s.userId && s.userId === user.uid) ||
        (s.parentEmail && s.parentEmail.toLowerCase().trim() === user.email?.toLowerCase().trim())
    );
    return userOwn.length > 0 ? userOwn : [selectedStudent];
  }, [students, user, isAdmin, selectedStudent]);

  // Modals
  const [showLoginIntakeModal, setShowLoginIntakeModal] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  // Workspace confirmation modals state (Mandated by workspace integration skill)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    details: { label: string; value: string }[];
    confirmText: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    details: [],
    confirmText: 'Confirm',
    onConfirm: async () => {},
  });

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Initialize Auth on mount
  useEffect(() => {
    initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(Boolean(token));
        if (currentUser) {
          try {
            localStorage.setItem('vetri_has_logged_in_gmail', 'true');
          } catch {}
          // If the user already logged in with Gmail, skip landing page and show home page
          setShowLanding(false);

          // Every time a user is logged in with Gmail, ensure child details are prompted
          try {
            const prompted = sessionStorage.getItem('vetri_login_intake_prompted');
            if (!prompted) {
              setShowLoginIntakeModal(true);
              sessionStorage.setItem('vetri_login_intake_prompted', 'true');
            }
          } catch {}
        }
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
  }, []);

  // 2. Real-Time Firestore Monitoring Listeners (Active from Day 1 upon entering app)
  useEffect(() => {
    if (showLanding) return;

    const unsubStudents = firestoreService.subscribeStudents((loadedStudents) => {
      setStudents(loadedStudents);
      if (loadedStudents.length > 0) {
        if (isAdmin || !user) {
          setSelectedStudent((prev) => {
            const match = loadedStudents.find((s) => s.id === prev?.id);
            return match || loadedStudents[0];
          });
          const active = loadedStudents[0];
          if (active.points !== undefined) {
            setPoints(active.points);
          }
          if (active.lingDaysPracticed !== undefined) {
            setLingDaysPracticed(active.lingDaysPracticed);
          }
        } else {
          // Other Gmail users: strictly isolate to their own profile
          const userOwn = loadedStudents.filter(
            (s) =>
              (s.userId && s.userId === user.uid) ||
              (s.parentEmail && s.parentEmail.toLowerCase().trim() === user.email?.toLowerCase().trim())
          );
          if (userOwn.length > 0) {
            setSelectedStudent((prev) => userOwn.find((s) => s.id === prev?.id) || userOwn[0]);
            const active = userOwn[0];
            if (active.points !== undefined) {
              setPoints(active.points);
            }
            if (active.lingDaysPracticed !== undefined) {
              setLingDaysPracticed(active.lingDaysPracticed);
            }
          }
        }
      }
    });

    const studentIdToWatch = selectedStudent?.id || null;
    const unsubSessions = firestoreService.subscribeSessions(studentIdToWatch, (loadedSessions) => {
      setSessions(loadedSessions);
    });

    const unsubAttendance = firestoreService.subscribeAttendance(studentIdToWatch, (loadedAttendance) => {
      setAttendance(loadedAttendance);
    });

    const unsubSchedules = firestoreService.subscribeSchedules((loadedSchedules) => {
      setSchedules(loadedSchedules);
    });

    return () => {
      unsubStudents();
      unsubSessions();
      unsubAttendance();
      unsubSchedules();
    };
  }, [showLanding, selectedStudent?.id, isAdmin, user]);

  // 3. Auto-initialize Private Patient Profile from User's Google Account if no profile exists for them
  useEffect(() => {
    if (showLanding) return;
    if (user && !isAdmin) {
      const userOwn = students.filter(
        (s) =>
          (s.userId && s.userId === user.uid) ||
          (s.parentEmail && s.parentEmail.toLowerCase().trim() === user.email?.toLowerCase().trim())
      );
      if (userOwn.length === 0) {
        firestoreService.fetchStudents().then(async (existing) => {
          const match = existing.filter(
            (s) =>
              (s.userId && s.userId === user.uid) ||
              (s.parentEmail && s.parentEmail.toLowerCase().trim() === user.email?.toLowerCase().trim())
          );
          if (match.length === 0) {
            const created = await firestoreService.createInitialStudentForUser(user);
            setStudents((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
            setSelectedStudent(created);
            setPoints(0);
            setLingDaysPracticed(0);
            try {
              localStorage.setItem('vetri_osai_points', '0');
              localStorage.setItem('vetri_osai_ling_days', '0');
            } catch {}
            showToast(`Welcome! Private profile for ${created.name} initialized. Practice starts from zero.`, 'success');
          } else {
            setSelectedStudent(match[0]);
            if (match[0].points !== undefined) setPoints(match[0].points);
            if (match[0].lingDaysPracticed !== undefined) setLingDaysPracticed(match[0].lingDaysPracticed);
          }
        });
      }
    } else if (user && isAdmin && students.length === 0) {
      firestoreService.fetchStudents().then(async (existing) => {
        if (existing.length === 0) {
          const created = await firestoreService.createInitialStudentForUser(user);
          setStudents([created]);
          setSelectedStudent(created);
        }
      });
    }
  }, [showLanding, user, isAdmin, students]);

  // Authentication Handlers
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(Boolean(result.accessToken));
        try {
          localStorage.setItem('vetri_has_logged_in_gmail', 'true');
          sessionStorage.setItem('vetri_login_intake_prompted', 'true');
        } catch {}
        setShowLanding(false);
        setActiveTab('home');
        // While login with gmail every time the web site should ask for the user details which are asked in the settings site
        setShowLoginIntakeModal(true);
        showToast(`Welcome, ${result.user.displayName || 'Parent'}! Please confirm child details.`, 'info');
      }
    } catch (err: any) {
      console.warn('Sign-in cancelled or notice:', err?.message || err);
      showToast(err.message || 'Google sign-in was canceled or failed.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setPoints(0);
    setLingDaysPracticed(0);
    setSelectedStudent(initialStarterStudent);
    try {
      localStorage.removeItem('vetri_has_logged_in_gmail');
      sessionStorage.removeItem('vetri_login_intake_prompted');
      localStorage.removeItem('vetri_osai_points');
      localStorage.removeItem('vetri_osai_ling_days');
      localStorage.removeItem('vetri_cached_students');
      localStorage.removeItem('vetri_cached_sessions_all');
    } catch {}
    setShowLanding(true);
    setActiveTab('home');
    setShowLoginIntakeModal(false);
    showToast('Signed out of Google account.', 'info');
  };

  const ensureAuthForWorkspace = async (needWorkspaceScopes: boolean = false): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token || !user) {
      showToast('Please sign in with Google to permit access.', 'info');
      try {
        const res = await googleSignIn(needWorkspaceScopes);
        if (res?.accessToken) {
          setUser(res.user);
          setHasToken(true);
          return true;
        }
      } catch (err: any) {
        console.warn('Workspace auth notice:', err?.message || err);
        return false;
      }
      return false;
    }
    return true;
  };

  const handleAddPoints = (amount: number) => {
    setPoints((prev) => {
      const updated = prev + amount;
      try {
        localStorage.setItem('vetri_osai_points', updated.toString());
      } catch {}
      // Sync to Firestore in real time
      if (selectedStudent?.id) {
        firestoreService.updateStudentPoints(selectedStudent.id, updated).catch(() => {});
      }
      return updated;
    });
    showToast(`+${amount} Points Earned! (Real-Time Synced) ⭐`);
  };

  const handleDeductPoints = (amount: number): boolean => {
    if (points < amount) return false;
    setPoints((prev) => {
      const updated = prev - amount;
      try {
        localStorage.setItem('vetri_osai_points', updated.toString());
      } catch {}
      if (selectedStudent?.id) {
        firestoreService.updateStudentPoints(selectedStudent.id, updated).catch(() => {});
      }
      return updated;
    });
    return true;
  };

  const handleAdvancePracticeDay = async () => {
    const nextDay = Math.min(lingDaysPracticed + 1, 5);
    setLingDaysPracticed(nextDay);
    try {
      localStorage.setItem('vetri_osai_ling_days', nextDay.toString());
    } catch {}

    const pointsEarned = 25;
    handleAddPoints(pointsEarned);

    // Record real-time daily progress in Firestore from Day 1
    try {
      await firestoreService.recordDailyProgress({
        student: selectedStudent,
        category: 'ling6_calibration',
        score: 95,
        durationMinutes: 15,
        notes: `Day ${nextDay} Ling-6 calibration completed: speech frequencies /m/, /ah/, /oo/, /ee/, /sh/, /s/ tested.`,
        pointsEarned,
      });
      await firestoreService.updateStudentLingDays(selectedStudent.id, nextDay);
      showToast(`Day ${nextDay} practice recorded to Firestore in real time! +${pointsEarned} Pts ⭐`, 'success');
    } catch (err) {
      console.warn('Firestore progress record error:', err);
    }
  };

  const handleUnlockAllDays = async () => {
    setLingDaysPracticed(5);
    try {
      localStorage.setItem('vetri_osai_ling_days', '5');
    } catch {}
    if (selectedStudent?.id) {
      await firestoreService.updateStudentLingDays(selectedStudent.id, 5).catch(() => {});
    }
    showToast('All 5 Ling calibration days verified! Games unlocked 🎉');
  };

  const handleOpenForest = (game: 'overview' | 'card_matching' | 'sound_detective' = 'overview') => {
    setForestInitialGame(game);
    setInForestWorld(true);
  };

  const handleSaveStudent = async (studentData: Student) => {
    // Strictly take parent name and gmail from the Google account login
    const finalParentName = user
      ? (user.displayName || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : studentData.parentName || 'Parent'))
      : (studentData.parentName || 'Parent');
    const finalParentEmail = user?.email || studentData.parentEmail || 'parent@gmail.com';

    const finalStudent: Student = {
      ...studentData,
      userId: studentData.userId || user?.uid,
      parentName: finalParentName,
      parentEmail: finalParentEmail,
    };

    await firestoreService.saveStudent(finalStudent);
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === finalStudent.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = finalStudent;
        return updated;
      }
      return [finalStudent, ...prev];
    });
    setSelectedStudent(finalStudent);
    showToast(`Profile for ${finalStudent.name} saved!`, 'success');
  };

  // Google Workspace Operations with Mandatory Confirmation Dialogs
  const handleRequestDriveSync = (student: Student) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Sync Dossier to Google Drive',
      description: `Do you want to create and upload a HIPAA/FERPA compliant progress dossier for ${student.name} into your Google Drive folder "Vetri Osai - Speech Therapy Dossiers"?`,
      details: [
        { label: 'Student', value: student.name },
        { label: 'Target Folder', value: 'Vetri Osai - Speech Therapy Dossiers' },
        { label: 'Permission Required', value: 'Google Drive (drive.file)' },
        { label: 'Compliance', value: 'Encrypted JSON Patient Telemetry' },
      ],
      confirmText: 'Upload to Google Drive',
      onConfirm: async () => {
        const authed = await ensureAuthForWorkspace();
        if (!authed) return;
        setIsActionLoading(true);
        try {
          const res = await workspaceService.syncStudentDossierToDrive(student, sessions);
          if (res.success) {
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'error');
          }
        } finally {
          setIsActionLoading(false);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestCalendarSync = (schedule: ClassSchedule) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Sync to Google Calendar',
      description: `Do you want to automatically create a recurring weekly calendar event for "${schedule.title}" on your Google Calendar?`,
      details: [
        { label: 'Event Summary', value: schedule.title },
        { label: 'Recurrence', value: `Every ${schedule.dayOfWeek} at ${schedule.startTime}` },
        { label: 'Therapist', value: schedule.therapist },
        { label: 'Reminders', value: '30 mins before & 2 hours prior via email' },
      ],
      confirmText: 'Add to Google Calendar',
      onConfirm: async () => {
        const authed = await ensureAuthForWorkspace();
        if (!authed) return;
        setIsActionLoading(true);
        try {
          const res = await workspaceService.syncScheduleToGoogleCalendar(schedule);
          if (res.success) {
            const updatedSched: ClassSchedule = {
              ...schedule,
              googleCalendarEventId: res.data?.id || 'synced-event',
              lastSyncedAt: new Date().toISOString(),
            };
            await firestoreService.saveSchedule(updatedSched);
            setSchedules((prev) =>
              prev.map((s) => (s.id === updatedSched.id ? updatedSched : s))
            );
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'error');
          }
        } finally {
          setIsActionLoading(false);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestGmailSend = (params: {
    student: Student;
    reportType: 'Daily' | 'Weekly' | 'Monthly';
    notes: string;
  }) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Send ${params.reportType} Milestone Report via Gmail`,
      description: `Do you want to send the automated speech pathology progress report for ${params.student.name} to their parent at ${params.student.parentEmail}?`,
      details: [
        { label: 'Recipient', value: params.student.parentEmail },
        { label: 'Report Frequency', value: `${params.reportType} Report` },
        { label: 'Child Streak', value: `${params.student.streak} Days` },
        { label: 'Sender Account', value: user?.email || 'Authenticated Gmail' },
      ],
      confirmText: 'Send Email via Gmail',
      onConfirm: async () => {
        const authed = await ensureAuthForWorkspace();
        if (!authed) return;
        setIsActionLoading(true);
        try {
          const res = await workspaceService.sendReportViaGmail({
            recipientEmail: params.student.parentEmail,
            student: params.student,
            reportType: params.reportType,
            sessions,
            streakDays: params.student.streak,
            therapistNotes: params.notes,
          });
          if (res.success) {
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'error');
          }
        } finally {
          setIsActionLoading(false);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestSheetsExport = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Export to Google Sheets',
      description: `Do you want to generate a multi-table spreadsheet containing the Analytical Table, Attendance Tracker, Daily Streaks, and Sessions Telemetry on Google Sheets?`,
      details: [
        { label: 'Document Name', value: 'Vetri Osai - Student Analytics & Attendance Ledger' },
        { label: 'Sheets Included', value: 'Analytical Table, Attendance & Streaks, Telemetry' },
        { label: 'Records Exported', value: `${students.length} Students, ${attendance.length} Attendance logs` },
      ],
      confirmText: 'Create Google Sheet',
      onConfirm: async () => {
        const authed = await ensureAuthForWorkspace();
        if (!authed) return;
        setIsActionLoading(true);
        try {
          const res = await workspaceService.exportToGoogleSheets(
            students,
            sessions,
            attendance
          );
          if (res.success) {
            showToast(res.message, 'success');
            if (res.data?.sheetUrl) {
              window.open(res.data.sheetUrl, '_blank');
            }
          } else {
            showToast(res.message, 'error');
          }
        } finally {
          setIsActionLoading(false);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // If user is viewing the landing experience outside the home page
  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={() => setShowLanding(false)}
        onSignIn={handleSignIn}
        user={user}
        isSigningIn={isSigningIn}
      />
    );
  }

  return (
    <div className="bg-[#ccebfd] min-h-screen p-3 sm:p-5 md:p-8 flex items-center justify-center selection:bg-pink-200 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`px-5 py-3.5 rounded-full shadow-xl border flex items-center gap-3 text-xs font-extrabold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* BEGIN: Main Dashboard Container */}
      <main className="w-full max-w-[1140px] bg-[#d9f1fe] rounded-[32px] p-4 md:p-6 shadow-xl border-4 border-white/60 relative overflow-hidden flex flex-col gap-5">
        {/* BEGIN: Top Navigation Bar */}
        <ThemeNavbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setInForestWorld(false);
            setActiveTab(tab);
          }}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          isSigningIn={isSigningIn}
          studentName={selectedStudent.name}
          streakDays={selectedStudent.streak}
          points={points}
          onReturnToLanding={() => setShowLanding(true)}
          onOpenPointCalculator={() => setIsCalculatorModalOpen(true)}
          isFirebaseActive={true}
        />

        {/* Main Content Area */}
        <div className="w-full">
          {inForestWorld ? (
            <ListeningForestWorld
              student={selectedStudent}
              lingDaysPracticed={lingDaysPracticed}
              initialGame={forestInitialGame}
              onAdvancePracticeDay={handleAdvancePracticeDay}
              onUnlockAllDays={handleUnlockAllDays}
              onEarnPoints={handleAddPoints}
              onBackToHome={() => setInForestWorld(false)}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomePageView
                  student={selectedStudent}
                  points={points}
                  streakDays={selectedStudent.streak}
                  lingDaysPracticed={lingDaysPracticed}
                  onNavigateToTab={(tab) => {
                    setInForestWorld(false);
                    setActiveTab(tab);
                  }}
                  onNavigateToForest={handleOpenForest}
                  onQuickStartAdventure={() => handleOpenForest('overview')}
                  onOpenPointCalculator={() => setIsCalculatorModalOpen(true)}
                  onEarnPoints={handleAddPoints}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressView
                  students={visibleStudents}
                  sessions={sessions}
                  attendance={attendance}
                  points={points}
                  streakDays={selectedStudent.streak}
                  onExportSheets={handleRequestSheetsExport}
                  onSyncDrive={handleRequestDriveSync}
                  onNavigateToRewards={() => {
                    setInForestWorld(false);
                    setActiveTab('rewards');
                  }}
                  isExporting={isActionLoading}
                  onOpenPointCalculator={() => setIsCalculatorModalOpen(true)}
                  user={user}
                  isAdmin={isAdmin}
                  selectedStudent={selectedStudent}
                  lingDaysPracticed={lingDaysPracticed}
                />
              )}

              {activeTab === 'rewards' && (
                <RewardsView
                  student={selectedStudent}
                  points={points}
                  streakDays={selectedStudent.streak}
                  onDeductPoints={handleDeductPoints}
                  onAddPoints={handleAddPoints}
                  onOpenPointCalculator={() => setIsCalculatorModalOpen(true)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  students={visibleStudents}
                  selectedStudent={selectedStudent}
                  onSelectStudent={(st) => setSelectedStudent(st)}
                  onOpenEnrollModal={() => {
                    setEditingStudent(null);
                    setIsEnrollModalOpen(true);
                  }}
                  onSaveStudent={handleSaveStudent}
                  onSyncDrive={handleRequestDriveSync}
                  onExportSheets={handleRequestSheetsExport}
                  onSendGmailReport={(st) =>
                    handleRequestGmailSend({
                      student: st,
                      reportType: 'Weekly',
                      notes: 'Consistent Ling-6 detection across all frequencies.',
                    })
                  }
                  onSyncCalendar={() =>
                    schedules[0] && handleRequestCalendarSync(schedules[0])
                  }
                  user={user}
                  hasWorkspaceToken={hasToken}
                  onSignIn={handleSignIn}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'about' && <AboutView />}

              {activeTab === 'contact' && <ContactView student={selectedStudent} />}
            </>
          )}
        </div>

        {/* Clean Dashboard Footer */}
        <footer className="w-full bg-white/70 rounded-2xl px-6 py-3.5 border border-white/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 tracking-tight font-rounded">VetriOsai</span>
            <span>•</span>
            <span>A small adventure, one sound at a time</span>
          </div>
          <div className="flex items-center gap-4 font-bold text-slate-600">
            <button
              onClick={() => {
                setInForestWorld(false);
                setActiveTab('about');
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => {
                setInForestWorld(false);
                setActiveTab('contact');
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact
            </button>
            {user ? (
              <button
                onClick={handleSignOut}
                className="hover:text-rose-700 transition-colors cursor-pointer text-rose-600 font-extrabold"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLanding(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer text-sky-600 font-extrabold"
              >
                View Landing Page
              </button>
            )}
          </div>
          <div>© 2026 Vetri Osai. All rights reserved.</div>
        </footer>
      </main>

      {/* Student Enrollment / Edit Modal */}
      <StudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      {/* Real Point Calculator Breakdown Modal */}
      <PointCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        student={selectedStudent}
        currentPoints={points}
        streakDays={selectedStudent.streak}
        sessions={sessions}
      />

      {/* Explicit User Confirmation Modal for Workspace mutating calls */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        details={confirmModalConfig.details}
        confirmText={confirmModalConfig.confirmText}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isActionLoading}
      />

      {/* Modal: Child Details Intake on Gmail Login */}
      {showLoginIntakeModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-[580px] my-6 bg-[#d9f1fe] rounded-[2.5rem] shadow-2xl border-4 border-white/90 overflow-hidden relative">
            {/* Modal Pediatric Header */}
            <div className="bg-gradient-to-r from-[#d2ebfc] via-[#e2f4ff] to-[#ffe8dc] px-6 py-4 border-b border-sky-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#ff622d]">
                  VetriOsai Patient Intake
                </span>
                <h2 className="font-rounded text-xl sm:text-2xl font-black text-slate-800">
                  Child &amp; Therapy Details
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Parent info is retrieved from your Gmail login (<span className="font-bold text-slate-800">{user.email}</span>)
                </p>
              </div>
              <button
                onClick={() => setShowLoginIntakeModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm shadow-xs transition cursor-pointer"
                title="Continue to App"
              >
                ✕
              </button>
            </div>

            {/* Child Details Form Embedded in Intake Mode */}
            <div className="p-2 sm:p-4 max-h-[82vh] overflow-y-auto">
              <ChildDetailsView
                key={selectedStudent.id || 'intake'}
                initialStudent={selectedStudent}
                user={user}
                isInitialIntake={true}
                canEdit={true}
                onSave={async (saved) => {
                  await handleSaveStudent(saved);
                  setShowLoginIntakeModal(false);
                  sessionStorage.setItem('vetri_login_intake_prompted', 'true');
                  showToast(`Child details saved for ${saved.name}! Baseline practice ready.`, 'success');
                }}
                onCancel={() => setShowLoginIntakeModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
