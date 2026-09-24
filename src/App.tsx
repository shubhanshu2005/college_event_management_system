import React, { useState, useEffect } from 'react';
import { User, CollegeEvent, Registration, AuditLog, Role } from './types';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { AryaLogo } from './components/AryaLogo';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TicketModal } from './components/TicketModal';
import { CertificateModal } from './components/CertificateModal';
import {
  CalendarDays,
  GraduationCap,
  UserCheck,
  Shield,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [events, setEvents] = useState<CollegeEvent[]>(() => storage.getEvents());
  const [registrations, setRegistrations] = useState<Registration[]>(() => storage.getRegistrations());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());

  // Active View Tab
  const [activeView, setActiveView] = useState<string>('student-events');

  // Modals state
  const [selectedTicketReg, setSelectedTicketReg] = useState<Registration | null>(null);
  const [selectedCertificateReg, setSelectedCertificateReg] = useState<Registration | null>(null);

  // Refresh all state from storage
  const handleRefreshData = () => {
    setUsers(storage.getUsers());
    setEvents(storage.getEvents());
    setRegistrations(storage.getRegistrations());
    setAuditLogs(storage.getAuditLogs());
    setCurrentUser(storage.getCurrentUser());
  };

  // Switch Active User (for viva role demo)
  const handleSwitchUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    // Set natural default view for role
    if (user.role === 'student') setActiveView('student-events');
    else if (user.role === 'organizer') setActiveView('organizer-events');
    else if (user.role === 'admin') setActiveView('admin-overview');
    handleRefreshData();
  };

  // Reset database to initial seed data
  const handleResetData = () => {
    if (window.confirm('Reset all Arya College events, registrations, and attendance to default demo state?')) {
      storage.resetToDefaults();
      handleRefreshData();
      setActiveView('student-events');
    }
  };

  // When role changes, guarantee view is valid
  useEffect(() => {
    if (currentUser.role === 'student' && !activeView.startsWith('student-')) {
      setActiveView('student-events');
    } else if (currentUser.role === 'organizer' && !activeView.startsWith('organizer-')) {
      setActiveView('organizer-events');
    } else if (currentUser.role === 'admin' && !activeView.startsWith('admin-')) {
      setActiveView('admin-overview');
    }
  }, [currentUser.role]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Header with Official Arya Red-White Logo */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        availableUsers={users}
        onResetData={handleResetData}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Role Notice Switcher Banner in Red & White */}
        <div className="mb-6 p-3 bg-white rounded-2xl border-2 border-red-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Active Profile:</span>
            <span className="font-black text-slate-900">{currentUser.name}</span>
            <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
              {currentUser.role} {currentUser.rollNumber ? `(${currentUser.rollNumber})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Demo Switcher:</span>
            <button
              onClick={() => {
                const s = users.find((u) => u.role === 'student');
                if (s) handleSwitchUser(s);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentUser.role === 'student'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-700'
              }`}
            >
              Rahul (Student)
            </button>
            <button
              onClick={() => {
                const o = users.find((u) => u.name.includes('Rananjay')) || users.find((u) => u.role === 'organizer');
                if (o) handleSwitchUser(o);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentUser.role === 'organizer'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-700'
              }`}
            >
              Rananjay Rathore (Organizer)
            </button>
            <button
              onClick={() => {
                const a = users.find((u) => u.name.includes('Himanshu')) || users.find((u) => u.role === 'admin');
                if (a) handleSwitchUser(a);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentUser.role === 'admin'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-700'
              }`}
            >
              Dr. Himanshu Arora (Main Head)
            </button>
          </div>
        </div>

        {/* ----------------- ROLE-BASED DASHBOARDS ----------------- */}
        {currentUser.role === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            events={events}
            registrations={registrations}
            onRefreshData={handleRefreshData}
            onOpenTicket={(reg) => setSelectedTicketReg(reg)}
            onOpenCertificate={(reg) => setSelectedCertificateReg(reg)}
            activeTab={activeView === 'student-registrations' ? 'registrations' : 'events'}
            onChangeTab={(tab) =>
              setActiveView(tab === 'registrations' ? 'student-registrations' : 'student-events')
            }
          />
        )}

        {currentUser.role === 'organizer' && (
          <OrganizerDashboard
            currentUser={currentUser}
            events={events}
            registrations={registrations}
            allUsers={users}
            onRefreshData={handleRefreshData}
            activeSubView={
              activeView === 'organizer-scanner'
                ? 'scanner'
                : activeView === 'organizer-volunteers'
                ? 'volunteers'
                : 'events'
            }
          />
        )}

        {currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            events={events}
            registrations={registrations}
            users={users}
            auditLogs={auditLogs}
            onRefreshData={handleRefreshData}
            activeSubView={
              activeView === 'admin-events'
                ? 'events'
                : activeView === 'admin-users'
                ? 'users'
                : activeView === 'admin-logs'
                ? 'logs'
                : 'overview'
            }
          />
        )}
      </main>

      {/* Global Modals */}
      <TicketModal
        registration={selectedTicketReg}
        onClose={() => setSelectedTicketReg(null)}
      />

      <CertificateModal
        registration={selectedCertificateReg}
        onClose={() => setSelectedCertificateReg(null)}
      />

      {/* Institutional Footer in Red & White */}
      <footer className="bg-white border-t-2 border-red-600 mt-12 py-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AryaLogo size="md" layout="horizontal" showText={false} />
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-black text-red-600 text-base">ARYA</span>
                <span className="font-black text-slate-900 text-xs uppercase">College of Engineering &amp; I.T.</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                SP-40, RIICO Industrial Area, Kukas - Jaipur, Rajasthan 302028 • RTU Affiliated
              </p>
              <p className="text-[10px] text-red-700 font-serif italic font-bold">
                "विद्या ददाति विनियम्" (Knowledge Imparts Humility)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-slate-500 font-medium">Arya CEMS • Red &amp; White Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
