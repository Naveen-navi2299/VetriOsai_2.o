import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { User } from 'firebase/auth';

interface ChildDetailsViewProps {
  initialStudent?: Student;
  user: User | null;
  onSave: (student: Student) => void;
  onCancel?: () => void;
  isInitialIntake?: boolean;
  canEdit?: boolean;
}

export const ChildDetailsView: React.FC<ChildDetailsViewProps> = ({
  initialStudent,
  user,
  onSave,
  onCancel,
  isInitialIntake = false,
  canEdit,
}) => {
  // Super Admin check
  const isSuperAdmin = Boolean(
    user?.email &&
      (user.email.trim().toLowerCase() === 'naveensg5479@gmail.com' ||
        user.email.trim().toLowerCase() === 'naveensg5479@gmail')
  );

  // Form is editable if:
  // 1. canEdit is explicitly passed as true, OR
  // 2. this is the initial login intake modal (parent filling their child details upon login), OR
  // 3. user is the super admin (naveensg5479@gmail.com)
  const isEditable = canEdit !== undefined ? canEdit : (isInitialIntake || isSuperAdmin);

  // Extract parent name and Gmail from Google account
  const googleParentName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'Parent');
  const googleParentEmail = user?.email || 'parent@gmail.com';

  const [name, setName] = useState(initialStudent?.name || '');
  const [hearingLossEar, setHearingLossEar] = useState<'left' | 'right' | 'both'>(
    initialStudent?.hearingLossEar || 'both'
  );
  const [operationYear, setOperationYear] = useState(
    initialStudent?.operationYear || (initialStudent?.enrolledDate ? initialStudent.enrolledDate.slice(0, 4) : '2023')
  );
  const [currentAge, setCurrentAge] = useState<string>(
    initialStudent?.age ? `${initialStudent.age} years` : '5 years'
  );
  const [operationAge, setOperationAge] = useState<string>(
    initialStudent?.ageAtOperation || '2 years'
  );
  const [hearingDeviceType, setHearingDeviceType] = useState<'aid' | 'implant' | 'none'>(
    initialStudent?.hearingDeviceType ||
    (initialStudent?.hearingDevice?.toLowerCase().includes('implant') ? 'implant' :
     initialStudent?.hearingDevice?.toLowerCase().includes('aid') ? 'aid' : 'implant')
  );

  // Parent name and email taken from Gmail login
  const [parentName, setParentName] = useState(
    user ? googleParentName : (initialStudent?.parentName || 'Parent')
  );
  const [parentEmail, setParentEmail] = useState(
    user?.email || initialStudent?.parentEmail || 'parent@gmail.com'
  );
  const [parentPhone, setParentPhone] = useState(
    initialStudent?.parentPhone || ''
  );

  // Sync state whenever initialStudent or user changes
  useEffect(() => {
    if (initialStudent) {
      if (initialStudent.name) setName(initialStudent.name);
      if (initialStudent.hearingLossEar) setHearingLossEar(initialStudent.hearingLossEar);
      if (initialStudent.operationYear) setOperationYear(initialStudent.operationYear);
      if (initialStudent.age) setCurrentAge(`${initialStudent.age} years`);
      if (initialStudent.ageAtOperation) setOperationAge(initialStudent.ageAtOperation);
      if (initialStudent.hearingDeviceType) setHearingDeviceType(initialStudent.hearingDeviceType);
      if (initialStudent.parentPhone) setParentPhone(initialStudent.parentPhone);
    }
    if (user) {
      setParentName(user.displayName || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'Parent'));
      setParentEmail(user.email || 'parent@gmail.com');
    }
  }, [initialStudent, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;

    const parsedAgeNum = parseInt(currentAge.replace(/\D/g, ''), 10) || 5;

    const deviceLabel =
      hearingDeviceType === 'implant'
        ? 'Cochlear Implant - Bilateral'
        : hearingDeviceType === 'aid'
        ? 'Hearing Aids'
        : 'None';

    const earLabel =
      hearingLossEar === 'both' ? 'Both ears' : hearingLossEar === 'left' ? 'Left ear' : 'Right ear';

    // Strictly enforce parent name and gmail from the Google account login if logged in
    const finalParentName = user
      ? (user.displayName || user.email?.split('@')[0] || parentName.trim() || 'Parent')
      : (parentName.trim() || 'Parent');

    const finalParentEmail = user?.email || parentEmail.trim() || 'parent@gmail.com';

    const updatedStudent: Student = {
      id: initialStudent?.id || `student-${user?.uid ? user.uid.slice(0, 8) : Date.now()}`,
      userId: initialStudent?.userId || user?.uid,
      name: name.trim() || (user ? `${finalParentName.split(' ')[0]}'s Child` : 'Enrolled Child'),
      age: parsedAgeNum,
      diagnosis: `${deviceLabel} (${earLabel})`,
      hearingDevice: deviceLabel,
      hearingLossEar,
      operationYear,
      ageAtOperation: operationAge,
      hearingDeviceType,
      parentName: finalParentName,
      parentEmail: finalParentEmail,
      parentPhone: parentPhone.trim() || '+1 (555) 012-3456',
      streak: initialStudent?.streak ?? 0,
      points: initialStudent?.points ?? 0,
      lingDaysPracticed: initialStudent?.lingDaysPracticed ?? 0,
      lastSessionDate: initialStudent?.lastSessionDate || new Date().toISOString().slice(0, 10),
      enrolledDate: initialStudent?.enrolledDate || new Date().toISOString().slice(0, 10),
      assignedTherapist: initialStudent?.assignedTherapist || 'Certified Auditory-Verbal Therapist',
      targetSounds: initialStudent?.targetSounds || ['m', 'ah', 'oo', 'ee', 'sh', 's'],
      level: initialStudent?.level || 1,
      notes: `Child profile registered. Ear: ${earLabel}, Op Year: ${operationYear}, Op Age: ${operationAge}.`,
    };

    onSave(updatedStudent);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 sm:px-4 font-sans relative selection:bg-[#ff622d] selection:text-white">
      {/* Background Decorative Sparkles */}
      <div aria-hidden="true" className="absolute top-[10%] right-[12%] text-sky-400 opacity-40 pointer-events-none select-none">
        <svg fill="currentColor" height="42" viewBox="0 0 24 24" width="42">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z"></path>
        </svg>
      </div>
      <div aria-hidden="true" className="absolute top-[45%] left-[8%] text-sky-400 opacity-35 pointer-events-none select-none">
        <svg fill="currentColor" height="36" viewBox="0 0 24 24" width="36">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z"></path>
        </svg>
      </div>
      <div aria-hidden="true" className="absolute top-[80%] right-[8%] text-sky-400 opacity-35 pointer-events-none select-none">
        <svg fill="currentColor" height="34" viewBox="0 0 24 24" width="34">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z"></path>
        </svg>
      </div>

      {/* Child Details Elevated Card */}
      <section
        className="bg-white rounded-[2rem] shadow-[0_20px_45px_-10px_rgba(96,149,194,0.22),0_8px_16px_-6px_rgba(96,149,194,0.1)] w-full max-w-[540px] p-6 sm:p-8 border border-white/80 transition-all duration-300 relative z-10"
        data-purpose="child-details-card"
      >
        {/* Card Header: Title & Activity Badge */}
        <div className="flex items-center justify-between mb-5 pb-1">
          <div>
            <h1 className="font-rounded text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Child Details
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isInitialIntake
                ? 'Welcome! Please fill in your child details for acoustic calibration.'
                : isEditable
                ? 'Admin Mode: Edit patient details and audiological configuration'
                : 'Registered patient profile & audiological settings (View-only)'}
            </p>
          </div>

          {/* Activity / Session Badge */}
          <div
            className="flex items-center bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 shadow-sm border border-purple-200/50 shrink-0"
            data-purpose="session-info-badge"
          >
            <div className="w-3.5 h-3.5 mr-2 rounded-sm bg-gradient-to-tr from-yellow-400 via-rose-400 to-sky-400 flex items-center justify-center">
              <span className="block w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            </div>
            <span>
              {initialStudent?.streak ? `${initialStudent.streak * 2} hr` : '0 hr'}{' '}
              <span className="font-normal text-slate-400 mx-0.5">|</span>{' '}
              {initialStudent?.streak ? `${initialStudent.streak} sessions` : '0 sessions'}
            </span>
          </div>
        </div>

        {/* View-Only Warning Banner for Non-Admin in Settings */}
        {!isEditable && (
          <div className="mb-5 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs animate-fadeIn">
            <span className="text-amber-600 text-lg leading-none select-none mt-0.5">🔒</span>
            <div className="space-y-0.5">
              <p className="font-extrabold text-[13px] text-amber-900">
                Child Details (View-Only Mode)
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Profile details cannot be edited here. Only the administrator (
                <strong className="text-amber-950 font-bold underline">naveensg5479@gmail.com</strong>
                ) can modify or change user details.
              </p>
            </div>
          </div>
        )}

        {/* Google Account Verified Info Badge */}
        {user && (
          <div className="mb-4 px-3.5 py-2 bg-sky-50/80 border border-sky-200/70 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-sky-900 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gmail Connected:</span>
              <span className="font-mono font-bold text-sky-800 text-[11px]">{user.email}</span>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
              Google Profile
            </span>
          </div>
        )}

        {/* Form Component */}
        <form className="space-y-4" data-purpose="child-details-form" onSubmit={handleSubmit}>
          {/* Field 1: Name */}
          <div className="space-y-1.5">
            <label className="block text-[15px] font-bold text-slate-800" htmlFor="child-name">
              Child's Name
            </label>
            <input
              className={`custom-input w-full px-4 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium transition-colors ${
                !isEditable
                  ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed border-slate-200 select-none'
                  : 'focus:bg-white bg-white/80 border-slate-300'
              }`}
              id="child-name"
              name="child-name"
              placeholder="Enter child's name (e.g., Naveen, Aarav)"
              type="text"
              required
              disabled={!isEditable}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Field 2: Hearing Loss in (Pill Radio Selector) */}
          <div className="space-y-1.5 pt-0.5" data-purpose="hearing-loss-group">
            <span className="block text-[15px] font-bold text-slate-800">
              Hearing Loss in
            </span>
            <div aria-label="Hearing loss in ear" className="flex flex-wrap items-center gap-2.5 pt-0.5" role="radiogroup">
              {/* Left Ear Pill (Peach) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_loss"
                  value="left"
                  disabled={!isEditable}
                  checked={hearingLossEar === 'left'}
                  onChange={() => isEditable && setHearingLossEar('left')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingLossEar === 'left'
                      ? 'bg-[#ffe8dc] border-[#f8bc9f] ring-2 ring-[#ff9b6d]/60 font-bold'
                      : 'bg-[#ffe8dc]/60 border-[#f8bc9f]/60 opacity-60'
                  }`}
                >
                  Left ear
                </span>
              </label>

              {/* Right Ear Pill (Mint) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_loss"
                  value="right"
                  disabled={!isEditable}
                  checked={hearingLossEar === 'right'}
                  onChange={() => isEditable && setHearingLossEar('right')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingLossEar === 'right'
                      ? 'bg-[#d0f2e5] border-[#9ce0c9] ring-2 ring-[#52cba4]/60 font-bold'
                      : 'bg-[#d0f2e5]/60 border-[#9ce0c9]/60 opacity-60'
                  }`}
                >
                  Right ear
                </span>
              </label>

              {/* Both Ears Pill (Blue) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_loss"
                  value="both"
                  disabled={!isEditable}
                  checked={hearingLossEar === 'both'}
                  onChange={() => isEditable && setHearingLossEar('both')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingLossEar === 'both'
                      ? 'bg-[#d4ecfc] border-[#a9d7f6] ring-2 ring-[#71bcf5]/60 font-bold'
                      : 'bg-[#d4ecfc]/60 border-[#a9d7f6]/60 opacity-60'
                  }`}
                >
                  Both ears
                </span>
              </label>
            </div>
          </div>

          {/* Field 3: Year of Operation */}
          <div className="space-y-1.5 pt-0.5">
            <label className="block text-[15px] font-bold text-slate-800" htmlFor="operation-year">
              Year of operation
            </label>
            <div className="relative">
              <input
                className={`custom-input w-full pl-4 pr-11 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium transition-colors ${
                  !isEditable
                    ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed border-slate-200'
                    : 'focus:bg-white bg-white/80 border-slate-300'
                }`}
                id="operation-year"
                name="operation-year"
                placeholder="e.g., 2021"
                type="text"
                disabled={!isEditable}
                value={operationYear}
                onChange={(e) => setOperationYear(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect height="18" rx="2" ry="2" strokeWidth="1.8" width="18" x="3" y="4"></rect>
                  <line strokeLinecap="round" strokeWidth="1.8" x1="16" x2="16" y1="2" y2="6"></line>
                  <line strokeLinecap="round" strokeWidth="1.8" x1="8" x2="8" y1="2" y2="6"></line>
                  <line strokeWidth="1.8" x1="3" x2="21" y1="10" y2="10"></line>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Grid row for Age (now) & Age at operation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
            {/* Field 4: Age (now) */}
            <div className="space-y-1.5">
              <label className="block text-[15px] font-bold text-slate-800" htmlFor="current-age">
                Age (now)
              </label>
              <div className="relative">
                <input
                  className={`custom-input w-full pl-4 pr-10 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium transition-colors ${
                    !isEditable
                      ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed border-slate-200'
                      : 'focus:bg-white bg-white/80 border-slate-300'
                  }`}
                  id="current-age"
                  name="current-age"
                  placeholder="e.g., 5 years"
                  type="text"
                  disabled={!isEditable}
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5-5 5 5M7 14l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Field 5: Age at operation */}
            <div className="space-y-1.5">
              <label className="block text-[15px] font-bold text-slate-800" htmlFor="operation-age">
                Age at operation
              </label>
              <div className="relative">
                <input
                  className={`custom-input w-full pl-4 pr-10 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium transition-colors ${
                    !isEditable
                      ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed border-slate-200'
                      : 'focus:bg-white bg-white/80 border-slate-300'
                  }`}
                  id="operation-age"
                  name="operation-age"
                  placeholder="e.g., 2 years"
                  type="text"
                  disabled={!isEditable}
                  value={operationAge}
                  onChange={(e) => setOperationAge(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5-5 5 5M7 14l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Field 6: Hearing device (Pill Selector) */}
          <div className="space-y-1.5 pt-0.5" data-purpose="device-group">
            <span className="block text-[15px] font-bold text-slate-800">
              Hearing device
            </span>
            <div aria-label="Hearing device type" className="flex flex-wrap items-center gap-2.5 pt-0.5" role="radiogroup">
              {/* Hearing Aid (Peach) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_device"
                  value="aid"
                  disabled={!isEditable}
                  checked={hearingDeviceType === 'aid'}
                  onChange={() => isEditable && setHearingDeviceType('aid')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-4.5 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingDeviceType === 'aid'
                      ? 'bg-[#ffe8dc] border-[#f8bc9f] ring-2 ring-[#ff9b6d]/60 font-bold'
                      : 'bg-[#ffe8dc]/60 border-[#f8bc9f]/60 opacity-60'
                  }`}
                >
                  Hearing aid
                </span>
              </label>

              {/* Cochlear Implant (Mint) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_device"
                  value="implant"
                  disabled={!isEditable}
                  checked={hearingDeviceType === 'implant'}
                  onChange={() => isEditable && setHearingDeviceType('implant')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingDeviceType === 'implant'
                      ? 'bg-[#d0f2e5] border-[#9ce0c9] ring-2 ring-[#52cba4]/60 font-bold'
                      : 'bg-[#d0f2e5]/60 border-[#9ce0c9]/60 opacity-60'
                  }`}
                >
                  Cochlear implant
                </span>
              </label>

              {/* None (Blue) */}
              <label className={isEditable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                <input
                  type="radio"
                  name="hearing_device"
                  value="none"
                  disabled={!isEditable}
                  checked={hearingDeviceType === 'none'}
                  onChange={() => isEditable && setHearingDeviceType('none')}
                  className="sr-only peer"
                />
                <span
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border text-slate-800 ${
                    hearingDeviceType === 'none'
                      ? 'bg-[#d4ecfc] border-[#a9d7f6] ring-2 ring-[#71bcf5]/60 font-bold'
                      : 'bg-[#d4ecfc]/60 border-[#a9d7f6]/60 opacity-60'
                  }`}
                >
                  None
                </span>
              </label>
            </div>
          </div>

          {/* Section: Parent / Guardian Details (Taken from Gmail Login) */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-[13px] font-extrabold uppercase tracking-wider text-slate-500">
                Parent &amp; Contact Details
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Linked to Gmail
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700" htmlFor="parent-name">
                  Parent / Guardian Name
                </label>
                {user && (
                  <span className="text-[10px] text-slate-400 font-medium">From Google Profile</span>
                )}
              </div>
              <input
                className={`custom-input w-full px-4 py-2 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium ${
                  user && !isSuperAdmin
                    ? 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 select-none'
                    : isEditable
                    ? 'focus:bg-white bg-white/80 border-slate-300'
                    : 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200'
                }`}
                id="parent-name"
                name="parent-name"
                placeholder="Enter parent's name"
                type="text"
                required
                readOnly={Boolean(user && !isSuperAdmin)}
                disabled={Boolean(!isEditable && !isSuperAdmin)}
                value={user && !isSuperAdmin ? googleParentName : parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="parent-email">
                    Gmail Address
                  </label>
                  {user && (
                    <span className="text-[10px] text-slate-400 font-medium">Google Auth</span>
                  )}
                </div>
                <input
                  className={`custom-input w-full px-3.5 py-2 rounded-xl text-slate-700 placeholder-slate-400 text-xs font-medium ${
                    user && !isSuperAdmin
                      ? 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 select-none'
                      : isEditable
                      ? 'focus:bg-white bg-white/80 border-slate-300'
                      : 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200'
                  }`}
                  id="parent-email"
                  name="parent-email"
                  type="email"
                  required
                  readOnly={Boolean(user && !isSuperAdmin)}
                  disabled={Boolean(!isEditable && !isSuperAdmin)}
                  value={user && !isSuperAdmin ? googleParentEmail : parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="parent-phone">
                  Phone Number
                </label>
                <input
                  className={`custom-input w-full px-3.5 py-2 rounded-xl text-slate-700 placeholder-slate-400 text-xs font-medium ${
                    !isEditable
                      ? 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200'
                      : 'focus:bg-white bg-white/80 border-slate-300'
                  }`}
                  id="parent-phone"
                  name="parent-phone"
                  type="tel"
                  placeholder="+1 (555) 012-3456"
                  disabled={!isEditable}
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="pt-4 flex items-center gap-3" data-purpose="form-submit-container">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 py-3 px-4 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition cursor-pointer"
              >
                Back
              </button>
            )}

            {isEditable ? (
              <button
                className="flex-1 bg-[#ff622d] hover:bg-[#f0531c] active:scale-[0.99] text-white font-bold text-base py-3.5 px-6 rounded-full shadow-[0_8px_20px_-4px_rgba(255,98,45,0.45)] transition duration-200 flex items-center justify-center space-x-2 group focus:outline-none focus:ring-4 focus:ring-orange-300 cursor-pointer"
                type="submit"
              >
                <span>{isInitialIntake ? 'Save & Start Practice' : 'Save Details'}</span>
                <span className="text-xl inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            ) : (
              <div className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-full text-center text-xs font-extrabold text-slate-500 flex items-center justify-center gap-2 select-none shadow-inner">
                <span>🔒 Editing disabled for users. Changes only allowed by naveensg5479@gmail.com</span>
              </div>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};
