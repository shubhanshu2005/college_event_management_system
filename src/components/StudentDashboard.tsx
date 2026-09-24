import React, { useState } from 'react';
import { CollegeEvent, Registration, User, EventCategory } from '../types';
import { storage } from '../services/storage';
import { AryaLogo } from './AryaLogo';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Clock3,
  QrCode,
  Award,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
  GraduationCap
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  events: CollegeEvent[];
  registrations: Registration[];
  onRefreshData: () => void;
  onOpenTicket: (reg: Registration) => void;
  onOpenCertificate: (reg: Registration) => void;
  activeTab: 'events' | 'registrations';
  onChangeTab: (tab: 'events' | 'registrations') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  events,
  registrations,
  onRefreshData,
  onOpenTicket,
  onOpenCertificate,
  activeTab,
  onChangeTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEventForModal, setSelectedEventForModal] = useState<CollegeEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const myRegistrations = registrations.filter(
    (r) => r.studentId === currentUser.id && r.status !== 'cancelled'
  );

  const categories: ('All' | EventCategory)[] = [
    'All',
    'Technical',
    'Hackathon',
    'Workshop',
    'Seminar',
    'Cultural',
    'Sports'
  ];

  // Filtering events
  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRegister = (event: CollegeEvent) => {
    const result = storage.registerForEvent(event, currentUser);
    if (result.success) {
      showToast(result.message, 'success');
      onRefreshData();
      if (selectedEventForModal) setSelectedEventForModal(null);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleCancelRegistration = (regId: string) => {
    if (window.confirm('Are you sure you want to cancel this event registration? If waitlisted students exist, one will be promoted.')) {
      const res = storage.cancelRegistration(regId);
      if (res.success) {
        showToast(res.message, 'success');
        onRefreshData();
      }
    }
  };

  const getEventStats = (event: CollegeEvent) => {
    const confirmedCount = registrations.filter(
      (r) => r.eventId === event.id && r.status === 'confirmed'
    ).length;
    const waitlistCount = registrations.filter(
      (r) => r.eventId === event.id && r.status === 'waitlisted'
    ).length;
    const isFull = confirmedCount >= event.capacity;
    const spotsLeft = Math.max(0, event.capacity - confirmedCount);
    const fillPercent = Math.min(100, Math.round((confirmedCount / event.capacity) * 100));

    const today = new Date().toISOString().split('T')[0];
    const isPastDeadline = event.registrationDeadline < today;

    const myReg = myRegistrations.find((r) => r.eventId === event.id);

    return { confirmedCount, waitlistCount, isFull, spotsLeft, fillPercent, isPastDeadline, myReg };
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 border-2 ${
            toastMessage.type === 'success'
              ? 'bg-red-700 text-white border-red-500'
              : 'bg-slate-900 text-white border-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Welcome Card in Red & White Theme */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-2 border-red-600">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Arya College of Engineering &amp; I.T. • Kukas - Jaipur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
            Welcome, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-2 leading-relaxed max-w-2xl font-medium">
            Discover campus technical hackathons, conferences, workshops, and sports championships. Register with your RTU roll number, download digital QR entry tickets, and access participation certificates.
          </p>

          <div className="flex items-center gap-3 mt-6 text-xs flex-wrap">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <span className="text-red-200 block text-[10px] font-bold uppercase">Active Registrations</span>
              <span className="text-lg font-black text-white">{myRegistrations.length} Passes</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <span className="text-red-200 block text-[10px] font-bold uppercase">Verified Certificates</span>
              <span className="text-lg font-black text-yellow-300">
                {myRegistrations.filter((r) => r.certificateIssued).length} Unlocked
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <span className="text-red-200 block text-[10px] font-bold uppercase">RTU Roll Number</span>
              <span className="text-sm font-mono font-black text-white">{currentUser.rollNumber || '23EARCS042'}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <span className="text-red-200 block text-[10px] font-bold uppercase">Campus Branch</span>
              <span className="text-xs font-bold text-white">{currentUser.department?.split(' ')[0] || 'CSE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header in Red & White */}
      <div className="flex items-center justify-between border-b-2 border-red-100 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeTab('events')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'events'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            Explore Campus Events ({events.length})
          </button>
          <button
            onClick={() => onChangeTab('registrations')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'registrations'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <span>My Registered Passes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'registrations' ? 'bg-white text-red-700' : 'bg-red-100 text-red-800'
              }`}
            >
              {myRegistrations.length}
            </span>
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: EXPLORE EVENTS ----------------- */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Search & Category Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-red-500" />
              <input
                type="text"
                placeholder="Search Arya events, auditorium, Shrinkhla, hackathon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const {
                confirmedCount,
                waitlistCount,
                isFull,
                spotsLeft,
                fillPercent,
                isPastDeadline,
                myReg
              } = getEventStats(event);

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-red-400 transition duration-200"
                >
                  {/* Event Banner */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                        {event.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {event.status === 'Completed' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/90 text-slate-300 backdrop-blur-md">
                          Completed
                        </span>
                      ) : isPastDeadline ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-white shadow-sm">
                          Deadline Passed
                        </span>
                      ) : isFull ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                          {event.allowWaitlist ? 'Waitlist Only' : 'Event Full'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                          {spotsLeft} Seats Left
                        </span>
                      )}
                    </div>

                    {/* Title on Banner */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-base line-clamp-1 leading-snug">{event.title}</h3>
                      <p className="text-[11px] text-red-200 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Date & Time pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar in Red */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                        <span>Registration Capacity</span>
                        <span className="font-bold text-slate-900">
                          {confirmedCount} / {event.capacity} ({fillPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            fillPercent >= 100
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      {waitlistCount > 0 && (
                        <p className="text-[10px] text-amber-700 font-bold text-right">
                          +{waitlistCount} students on waitlist
                        </p>
                      )}
                    </div>

                    {/* Deadline warning */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Deadline: {event.registrationDeadline}</span>
                      <span className="text-red-700 font-bold">{event.organizerName}</span>
                    </div>

                    {/* Action Buttons in Red & White */}
                    <div className="pt-2">
                      {myReg ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenTicket(myReg)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5 text-red-600" />
                            {myReg.status === 'confirmed' ? 'View QR Ticket' : 'Waitlist Ticket'}
                          </button>
                          <button
                            onClick={() => setSelectedEventForModal(event)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
                            title="View event details"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isPastDeadline || event.status === 'Completed' || event.status === 'Closed' ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed text-center"
                        >
                          Registration Closed
                        </button>
                      ) : isFull ? (
                        event.allowWaitlist ? (
                          <button
                            onClick={() => handleRegister(event)}
                            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Clock3 className="w-3.5 h-3.5" />
                            Join Priority Waitlist
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed text-center"
                          >
                            Event Full
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRegister(event)}
                            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            Register Now
                          </button>
                          <button
                            onClick={() => setSelectedEventForModal(event)}
                            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No events found</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: MY REGISTRATIONS & PASSES ----------------- */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Arya College Entry Passes &amp; Certificates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Present your QR ticket at the Arya Main Campus venue desk. Once check-in is verified by the organizer, your official participation certificate unlocks instantly.
              </p>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
              Active Passes: {myRegistrations.length}
            </span>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No registrations yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore Arya Main Campus technical workshops, Shrinkhla fest competitions, and cricket tournaments to register!
              </p>
              <button
                onClick={() => onChangeTab('events')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow"
              >
                Browse Campus Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-red-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {reg.status === 'confirmed' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            Confirmed Entry
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                            Waitlist
                          </span>
                        )}
                        {reg.attended && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 flex items-center gap-1 border border-red-200">
                            <CheckCircle2 className="w-3 h-3 text-red-600" />
                            Attendance Verified
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {reg.eventTitle}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleCancelRegistration(reg.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Cancel Registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date & Venue details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-red-50/30 p-3.5 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{reg.eventDate} ({reg.eventTime})</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">{reg.eventVenue}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-red-100 font-mono text-[11px] text-slate-500">
                      <span>Ticket Code: <strong className="text-red-700">{reg.ticketCode}</strong></span>
                    </div>
                  </div>

                  {/* Actions: View QR Ticket & Certificate in Red & White */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenTicket(reg)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-black rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-md shadow-red-600/30"
                    >
                      <QrCode className="w-4 h-4 text-white" />
                      View QR Pass
                    </button>

                    {reg.certificateIssued ? (
                      <button
                        onClick={() => onOpenCertificate(reg)}
                        className="flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-black rounded-xl bg-white text-red-700 border-2 border-red-600 hover:bg-red-50 transition shadow-sm"
                      >
                        <Award className="w-4 h-4 text-red-600" />
                        Certificate
                      </button>
                    ) : (
                      <div
                        className="py-2.5 px-3 text-xs text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed flex items-center gap-1 font-medium"
                        title="Unlocks automatically after attendance check-in"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Cert Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- EVENT DETAILS MODAL ----------------- */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-600 max-h-[90vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-48 sm:h-60 w-full bg-slate-900 shrink-0">
              <img
                src={selectedEventForModal.bannerImage}
                alt={selectedEventForModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-slate-950/40 to-transparent"></div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white mb-2 inline-block">
                  {selectedEventForModal.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-tight">
                  {selectedEventForModal.title}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-red-700 text-sm mb-1">About the Event</h4>
                <p className="leading-relaxed text-slate-600 text-sm whitespace-pre-line">
                  {selectedEventForModal.description}
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Event Date &amp; Time</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">
                    {selectedEventForModal.date} • {selectedEventForModal.time}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Arya Campus Venue</p>
                  <p className="font-bold text-red-700 text-xs mt-0.5">{selectedEventForModal.venue}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Seat Capacity</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedEventForModal.capacity} Seats</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Registration Closes</p>
                  <p className="font-bold text-rose-600 text-xs mt-0.5">{selectedEventForModal.registrationDeadline}</p>
                </div>
              </div>

              {/* Volunteer Opportunities */}
              {selectedEventForModal.volunteerRoles && selectedEventForModal.volunteerRoles.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-700 text-sm mb-2">Student Volunteer Opportunities</h4>
                  <div className="space-y-2">
                    {selectedEventForModal.volunteerRoles.map((role) => (
                      <div
                        key={role.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{role.title}</p>
                          <p className="text-slate-500 text-[11px]">{role.description}</p>
                        </div>
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {role.filled}/{role.slots} Slots Filled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer Information */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Faculty Event Convener</p>
                  <p className="font-bold text-slate-900 text-xs">{selectedEventForModal.organizerName}</p>
                </div>
                <span className="text-slate-500 text-xs font-semibold">Arya College of Engineering &amp; I.T., Kukas, Jaipur</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                onClick={() => handleRegister(selectedEventForModal)}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-600/30"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
