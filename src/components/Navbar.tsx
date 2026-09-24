import React, { useState } from 'react';
import { User, Role } from '../types';
import { AryaLogo } from './AryaLogo';
import { HimanshuAvatar } from './HimanshuAvatar';
import {
  CalendarDays,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  onResetData: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  availableUsers,
  onResetData,
  activeView,
  onSelectView
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur border-b-2 border-red-600 shadow-md">
      {/* Institutional Top Bar in Deep Crimson Red */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-red-900">
        <div className="flex items-center gap-2">
          <span className="bg-white text-red-700 px-2 py-0.5 rounded font-black uppercase text-[9px] tracking-wider shadow-sm">
            Kukas - Jaipur
          </span>
          <span className="font-bold tracking-wide hidden md:inline">
            Arya College of Engineering &amp; I.T.
          </span>
          <span className="text-red-200 font-serif italic hidden lg:inline">
            • "विद्या ददाति विनियम्" • RTU Kota Affiliated • Estd. 2000
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            title="Reset database to sample state"
            className="flex items-center gap-1 text-red-100 hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Exact Emblem & Red ARYA Typography */}
          <div className="flex items-center gap-3">
            <AryaLogo size="md" layout="horizontal" showText={true} />
          </div>

          {/* Role Navigation Pills in Red & White */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-red-50/60 p-1.5 rounded-2xl border border-red-100 text-xs font-bold">
            {currentUser.role === 'student' && (
              <>
                <button
                  onClick={() => onSelectView('student-events')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'student-events'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  Explore Events
                </button>
                <button
                  onClick={() => onSelectView('student-registrations')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'student-registrations'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  My Passes &amp; Certificates
                </button>
              </>
            )}

            {currentUser.role === 'organizer' && (
              <>
                <button
                  onClick={() => onSelectView('organizer-events')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'organizer-events'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  Event Operations
                </button>
                <button
                  onClick={() => onSelectView('organizer-scanner')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'organizer-scanner'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  QR Check-In Scanner
                </button>
                <button
                  onClick={() => onSelectView('organizer-volunteers')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'organizer-volunteers'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  Volunteer Desk
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => onSelectView('admin-overview')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'admin-overview'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  Campus Analytics
                </button>
                <button
                  onClick={() => onSelectView('admin-events')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'admin-events'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => onSelectView('admin-users')}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    activeView === 'admin-users'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <span>User Directory</span>
                  <span className="px-1.5 py-0.2 rounded bg-yellow-400 text-slate-950 font-black text-[9px] uppercase">
                    + Add Students
                  </span>
                </button>
                <button
                  onClick={() => onSelectView('admin-logs')}
                  className={`px-4 py-2 rounded-xl transition ${
                    activeView === 'admin-logs'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  Audit Trail
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Demo Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-white hover:bg-red-50/60 border border-slate-300 rounded-2xl transition text-left shadow-sm hover:border-red-400"
              >
                {currentUser.id === 'usr_admin_1' || currentUser.name.includes('Himanshu') ? (
                  <HimanshuAvatar size="md" />
                ) : (
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-red-600"
                  />
                )}
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-black text-slate-900 truncate max-w-[140px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-red-600 capitalize font-bold">
                    {currentUser.role} {currentUser.rollNumber ? `• ${currentUser.rollNumber}` : ''}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-red-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-red-100 bg-red-50/60">
                    <p className="text-[10px] uppercase font-black text-red-700 tracking-wider">
                      Arya College • Role Switcher
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select an account to test permissions instantly:
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {availableUsers.map((user) => {
                      const isCurrent = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                            isCurrent
                              ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {user.id === 'usr_admin_1' || user.name.includes('Himanshu') ? (
                              <HimanshuAvatar size="sm" />
                            ) : (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-8 h-8 rounded-lg object-cover border border-red-300"
                              />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-[10px] text-red-600 capitalize font-medium">
                                {user.role} {user.rollNumber ? `• ${user.rollNumber}` : ''}
                              </p>
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 pt-1 border-t border-slate-100 text-xs font-semibold">
          {currentUser.role === 'student' && (
            <>
              <button
                onClick={() => onSelectView('student-events')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'student-events' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Explore Events
              </button>
              <button
                onClick={() => onSelectView('student-registrations')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'student-registrations' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                My Passes
              </button>
            </>
          )}

          {currentUser.role === 'organizer' && (
            <>
              <button
                onClick={() => onSelectView('organizer-events')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'organizer-events' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => onSelectView('organizer-scanner')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'organizer-scanner' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                QR Check-In
              </button>
              <button
                onClick={() => onSelectView('organizer-volunteers')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'organizer-volunteers' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Volunteers
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => onSelectView('admin-overview')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'admin-overview' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => onSelectView('admin-events')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'admin-events' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => onSelectView('admin-users')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'admin-users' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => onSelectView('admin-logs')}
                className={`px-3 py-1.5 rounded-lg shrink-0 ${
                  activeView === 'admin-logs' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Audit Logs
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
