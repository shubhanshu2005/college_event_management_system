import React, { useState, useEffect, useRef } from 'react';
import { CollegeEvent, Registration, User, EventCategory, EventStatus, VolunteerRole } from '../types';
import { storage } from '../services/storage';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  FileSpreadsheet,
  QrCode,
  PieChart,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Search,
  Check,
  AlertTriangle,
  X,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';
import Chart from 'chart.js/auto';

interface OrganizerDashboardProps {
  currentUser: User;
  events: CollegeEvent[];
  registrations: Registration[];
  allUsers: User[];
  onRefreshData: () => void;
  activeSubView?: 'events' | 'scanner' | 'volunteers';
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  currentUser,
  events,
  registrations,
  allUsers,
  onRefreshData,
  activeSubView = 'events'
}) => {
  // Filter events organized by this user (or all if faculty head)
  const myEvents = events.filter(
    (e) => e.organizerId === currentUser.id || currentUser.role === 'admin'
  );

  const [selectedEventId, setSelectedEventId] = useState<string>(
    myEvents[0]?.id || events[0]?.id || ''
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'volunteers' | 'stats' | 'details'>(
    activeSubView === 'scanner' ? 'attendance' : activeSubView === 'volunteers' ? 'volunteers' : 'attendance'
  );

  // Quick Attendance QR Token input
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [searchAttendee, setSearchAttendee] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'waitlisted' | 'present' | 'absent'>('all');

  // Chart ref
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Form State for Event Creation / Editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical' as EventCategory,
    date: '',
    time: '10:00 AM',
    venue: '',
    capacity: 50,
    registrationDeadline: '',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    allowWaitlist: true,
    maxWaitlist: 20
  });

  // Volunteer Role Creation Form
  const [volunteerRoleForm, setVolunteerRoleForm] = useState({
    title: '',
    slots: 3,
    description: ''
  });
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Volunteer Assignment Form
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<string>('');
  const [selectedStudentForVolunteer, setSelectedStudentForVolunteer] = useState<string>('');

  const currentEvent = events.find((e) => e.id === selectedEventId) || myEvents[0] || events[0];
  const eventRegistrations = registrations.filter((r) => r.eventId === currentEvent?.id);
  const volunteerAssignments = storage.getVolunteerAssignments(currentEvent?.id);

  // Switch tab when activeSubView prop changes from Navbar
  useEffect(() => {
    if (activeSubView === 'scanner') setActiveTab('attendance');
    else if (activeSubView === 'volunteers') setActiveTab('volunteers');
  }, [activeSubView]);

  // Render Chart.js when stats tab is viewed
  useEffect(() => {
    if (activeTab === 'stats' && chartCanvasRef.current && currentEvent) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const confirmed = eventRegistrations.filter((r) => r.status === 'confirmed').length;
      const present = eventRegistrations.filter((r) => r.attended).length;
      const absent = Math.max(0, confirmed - present);
      const remainingSeats = Math.max(0, currentEvent.capacity - confirmed);

      chartInstanceRef.current = new Chart(chartCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Attended (Present)', 'Absent / Unchecked', 'Available Seats'],
          datasets: [
            {
              data: [present, absent, remainingSeats],
              backgroundColor: ['#10b981', '#f59e0b', '#e2e8f0'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { size: 11, weight: 'bold' }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activeTab, currentEvent, eventRegistrations]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.venue) {
      alert('Please fill in the required fields: Title, Date, Venue');
      return;
    }

    const newEvt = storage.createEvent({
      ...formData,
      status: 'Open',
      organizerId: currentUser.id,
      organizerName: currentUser.name
    });

    onRefreshData();
    setSelectedEventId(newEvt.id);
    setIsCreateModalOpen(false);
  };

  const handleOpenEditModal = () => {
    if (!currentEvent) return;
    setFormData({
      title: currentEvent.title,
      description: currentEvent.description,
      category: currentEvent.category,
      date: currentEvent.date,
      time: currentEvent.time,
      venue: currentEvent.venue,
      capacity: currentEvent.capacity,
      registrationDeadline: currentEvent.registrationDeadline,
      bannerImage: currentEvent.bannerImage,
      allowWaitlist: currentEvent.allowWaitlist,
      maxWaitlist: currentEvent.maxWaitlist || 20
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    storage.updateEvent(currentEvent.id, formData);
    onRefreshData();
    setIsEditModalOpen(false);
  };

  const handleToggleStatus = (newStatus: EventStatus) => {
    if (!currentEvent) return;
    storage.updateEventStatus(currentEvent.id, newStatus);
    onRefreshData();
  };

  // Mark Attendance via quick scanner input
  const handleVerifyTicketCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketInput.trim()) return;

    const res = storage.verifyTicketCode(manualTicketInput.trim(), currentUser.name);
    setScanResult({ success: res.success, message: res.message });
    if (res.success) {
      setManualTicketInput('');
      onRefreshData();
    }
  };

  // Toggle individual attendee attendance
  const handleToggleAttendee = (regId: string, currentStatus: boolean) => {
    storage.markAttendance(regId, !currentStatus, currentUser.name);
    onRefreshData();
  };

  // Export Attendees to CSV
  const handleExportCSV = () => {
    if (!currentEvent) return;
    const headers = [
      'Registration ID',
      'Student Name',
      'Roll Number',
      'Email',
      'Department',
      'Status',
      'Ticket Code',
      'Attended',
      'Check-in Timestamp',
      'Certificate ID'
    ];

    const rows = eventRegistrations.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.studentRoll,
      r.studentEmail,
      `"${r.studentDept}"`,
      r.status,
      r.ticketCode,
      r.attended ? 'Yes' : 'No',
      r.attendedAt || 'N/A',
      r.certificateId || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add volunteer role
  const handleCreateVolunteerRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !volunteerRoleForm.title) return;

    storage.addVolunteerRole(
      currentEvent.id,
      volunteerRoleForm.title,
      Number(volunteerRoleForm.slots),
      volunteerRoleForm.description
    );
    setVolunteerRoleForm({ title: '', slots: 3, description: '' });
    setIsAddRoleOpen(false);
    onRefreshData();
  };

  // Assign Volunteer
  const handleAssignVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !selectedRoleForAssignment || !selectedStudentForVolunteer) return;

    const studentUser = allUsers.find((u) => u.id === selectedStudentForVolunteer);
    if (!studentUser) return;

    const res = storage.assignVolunteer(
      currentEvent.id,
      selectedRoleForAssignment,
      studentUser,
      currentUser.name
    );

    if (res.success) {
      setSelectedStudentForVolunteer('');
      onRefreshData();
    } else {
      alert(res.message);
    }
  };

  const handleRemoveVolunteer = (asgId: string) => {
    storage.removeVolunteer(asgId, currentUser.name);
    onRefreshData();
  };

  // Filtered Attendees list
  const filteredAttendees = eventRegistrations.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      r.studentRoll.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      r.ticketCode.toLowerCase().includes(searchAttendee.toLowerCase());

    if (statusFilter === 'confirmed') return matchesSearch && r.status === 'confirmed';
    if (statusFilter === 'waitlisted') return matchesSearch && r.status === 'waitlisted';
    if (statusFilter === 'present') return matchesSearch && r.attended;
    if (statusFilter === 'absent') return matchesSearch && !r.attended && r.status === 'confirmed';
    return matchesSearch;
  });

  const confirmedCount = eventRegistrations.filter((r) => r.status === 'confirmed').length;
  const waitlistCount = eventRegistrations.filter((r) => r.status === 'waitlisted').length;
  const attendedCount = eventRegistrations.filter((r) => r.attended).length;
  const attendanceRate =
    confirmedCount > 0 ? Math.round((attendedCount / confirmedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card in Red & White */}
      <div className="bg-white rounded-3xl p-6 border-2 border-red-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-200">
              Arya College of Engineering &amp; I.T. • Faculty Organizer Console
            </span>
            <span className="text-xs text-slate-500 font-semibold">Convened by {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Event Operations &amp; Attendance Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create events, manage capacity, verify student QR tickets, assign student volunteers, and export RTU attendance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-600/30"
          >
            <Plus className="w-4 h-4 text-white" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Event Selector & Quick Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Event Dropdown & Quick Status Switcher */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Select Active Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.status})
              </option>
            ))}
          </select>

          {currentEvent && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentEvent.status === 'Open'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentEvent.status === 'Draft'
                      ? 'bg-slate-100 text-slate-700'
                      : currentEvent.status === 'Full'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentEvent.status}
                </span>
              </div>

              {/* Status Change Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {currentEvent.status !== 'Open' ? (
                  <button
                    onClick={() => handleToggleStatus('Open')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                  >
                    <Unlock className="w-3 h-3" />
                    Open Reg
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus('Closed')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-[11px] font-semibold transition"
                  >
                    <Lock className="w-3 h-3" />
                    Close Reg
                  </button>
                )}

                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition"
                >
                  <Edit className="w-3 h-3" />
                  Edit Event
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 3 cols: Quick Metrics */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Confirmed Seats</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">{confirmedCount}</span>
              <span className="text-xs text-slate-400">/ {currentEvent?.capacity}</span>
            </div>
            <p className="text-[10px] text-red-600 font-medium mt-1">
              {Math.max(0, (currentEvent?.capacity || 0) - confirmedCount)} spots remaining
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Waitlist Total</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600">{waitlistCount}</span>
              <span className="text-xs text-slate-400">students</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Auto-promoted on cancel</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Present Attendees</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600">{attendedCount}</span>
              <span className="text-xs text-slate-400">checked-in</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{attendanceRate}% Turnout Rate</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Volunteer Staff</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-purple-600">{volunteerAssignments.length}</span>
              <span className="text-xs text-slate-400">assigned</span>
            </div>
            <p className="text-[10px] text-purple-600 font-medium mt-1">
              Across {currentEvent?.volunteerRoles?.length || 0} designated roles
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Controller */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Bar in Red & White */}
        <div className="flex items-center justify-between border-b border-red-100 px-6 pt-3 bg-red-50/40 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-white text-red-700 border-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-red-700 border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              Attendance &amp; QR Verification ({eventRegistrations.length})
            </button>

            <button
              onClick={() => setActiveTab('volunteers')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition whitespace-nowrap ${
                activeTab === 'volunteers'
                  ? 'bg-white text-red-700 border-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-red-700 border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-red-600" />
              Manage Volunteers ({volunteerAssignments.length})
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-white text-red-700 border-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-red-700 border-transparent'
              }`}
            >
              <PieChart className="w-4 h-4 text-red-600" />
              Analytics (Chart.js)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition mb-2 border border-red-200"
            title="Download formatted CSV of all registered students"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-700" />
            Export Attendee CSV
          </button>
        </div>

        {/* ------------------ TAB 1: ATTENDANCE & QR CHECK-IN ------------------ */}
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-6">
            {/* Quick QR Code Scanner / Ticket Code Validator Simulator in Red & White */}
            <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-950 text-white p-5 rounded-3xl shadow-lg border-2 border-red-600">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="w-4 h-4 text-white" />
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-300">
                    Arya Main Campus • Live Check-In Desk / QR Code Validator
                  </span>
                </div>
                <p className="text-xs text-red-100">
                  Scan attendee QR ticket or type their verification code (e.g.{' '}
                  <code className="text-yellow-300 bg-white/15 px-1 py-0.5 rounded font-mono">
                    TK-ARYA-CS042-9841
                  </code>
                  ) for immediate real-time check-in and attendance timestamping.
                </p>

                <form onSubmit={handleVerifyTicketCode} className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Enter Ticket Code to Check-in..."
                    value={manualTicketInput}
                    onChange={(e) => setManualTicketInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-mono bg-white/15 border border-white/30 rounded-xl text-white placeholder:text-red-200 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-red-700 bg-white hover:bg-red-50 rounded-xl transition shadow-md"
                  >
                    Verify &amp; Check In
                  </button>
                </form>

                {/* Scan feedback alert */}
                {scanResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      scanResult.success
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                        : 'bg-rose-900/80 text-rose-200 border border-rose-600'
                    }`}
                  >
                    {scanResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{scanResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, roll no, ticket..."
                  value={searchAttendee}
                  onChange={(e) => setSearchAttendee(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'confirmed', 'waitlisted', 'present', 'absent'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                      statusFilter === filter
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendee Roster Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Ticket Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAttendees.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">
                        {reg.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">{reg.studentEmail}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-red-700">{reg.studentRoll}</td>
                      <td className="p-3 text-slate-600 truncate max-w-[150px]">{reg.studentDept}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{reg.ticketCode}</td>
                      <td className="p-3">
                        {reg.status === 'confirmed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Waitlist
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {reg.attended ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present ({reg.attendedAt?.split(' ')[1] || 'Done'})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Absent</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleAttendee(reg.id, reg.attended)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                            reg.attended
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                          }`}
                        >
                          {reg.attended ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAttendees.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No attendees found matching filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------ TAB 2: VOLUNTEER MANAGEMENT ------------------ */}
        {activeTab === 'volunteers' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Volunteer Coordination & Roles</h3>
                <p className="text-xs text-slate-500">
                  Assign student volunteers to specific operational tasks like registration desk, lab setup, or stage management.
                </p>
              </div>

              <button
                onClick={() => setIsAddRoleOpen(!isAddRoleOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Volunteer Role
              </button>
            </div>

            {/* Add Role Form Modal/Collapse */}
            {isAddRoleOpen && (
              <form
                onSubmit={handleCreateVolunteerRole}
                className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in duration-150"
              >
                <h4 className="text-xs font-bold text-purple-900 uppercase">Create New Volunteer Role</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Role Title (e.g., Stage Coordinator)"
                    value={volunteerRoleForm.title}
                    onChange={(e) => setVolunteerRoleForm({ ...volunteerRoleForm, title: e.target.value })}
                    className="text-xs p-2 bg-white rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Slot Limit"
                    value={volunteerRoleForm.slots}
                    onChange={(e) => setVolunteerRoleForm({ ...volunteerRoleForm, slots: Number(e.target.value) })}
                    className="text-xs p-2 bg-white rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Short Description of Duties"
                    value={volunteerRoleForm.description}
                    onChange={(e) => setVolunteerRoleForm({ ...volunteerRoleForm, description: e.target.value })}
                    className="text-xs p-2 bg-white rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRoleOpen(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg"
                  >
                    Save Role
                  </button>
                </div>
              </form>
            )}

            {/* Existing Roles List & Slot Meters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentEvent?.volunteerRoles?.map((role) => (
                <div key={role.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800">{role.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {role.filled} / {role.slots} Filled
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{role.description}</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${Math.min(100, (role.filled / role.slots) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Assign Volunteer Form */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Assign Student to Role
              </h4>
              <form onSubmit={handleAssignVolunteer} className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedRoleForAssignment}
                  onChange={(e) => setSelectedRoleForAssignment(e.target.value)}
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                >
                  <option value="">Select Volunteer Role...</option>
                  {currentEvent?.volunteerRoles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.filled}/{r.slots} filled)
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStudentForVolunteer}
                  onChange={(e) => setSelectedStudentForVolunteer(e.target.value)}
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                >
                  <option value="">Select Student...</option>
                  {allUsers
                    .filter((u) => u.role === 'student')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber} - {s.department})
                      </option>
                    ))}
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
                >
                  Assign Volunteer
                </button>
              </form>
            </div>

            {/* Current Volunteer Roster */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                Active Event Volunteers ({volunteerAssignments.length})
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Volunteer Student</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Assigned Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {volunteerAssignments.map((asg) => (
                      <tr key={asg.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900">{asg.studentName}</td>
                        <td className="p-3 font-mono text-red-700 font-bold">{asg.studentRoll}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                            {asg.roleTitle}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{asg.assignedAt}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveVolunteer(asg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove volunteer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {volunteerAssignments.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No volunteers assigned to this event yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 3: ANALYTICS (CHART.JS) ------------------ */}
        {activeTab === 'stats' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance & Capacity Statistics</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Powered by <strong>Chart.js</strong> rendering live event metrics directly on an HTML5 canvas.
                </p>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span className="font-semibold text-emerald-800">Present Turnout:</span>
                    <span className="font-bold text-emerald-900">
                      {attendedCount} / {confirmedCount} ({attendanceRate}%)
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="font-semibold text-amber-800">Waitlist Backlog:</span>
                    <span className="font-bold text-amber-900">{waitlistCount} Students</span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                    <span className="font-semibold text-blue-800">Capacity Utilization:</span>
                    <span className="font-bold text-blue-900">
                      {Math.round((confirmedCount / (currentEvent?.capacity || 1)) * 100)}% Filled
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart.js Container */}
              <div className="h-64 relative bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center">
                <canvas ref={chartCanvasRef} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------ CREATE EVENT MODAL ------------------ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Create New College Event</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CodeSprint 2026: Inter-College Coding Contest"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the agenda, rules, speaker, and criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Seminar Hall 2, Admin Wing"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity (Max Seats) *</label>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Enable Waitlist</p>
                  <p className="text-[11px] text-slate-500">
                    Allow students to join priority waitlist when full capacity is reached
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowWaitlist}
                  onChange={(e) => setFormData({ ...formData, allowWaitlist: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ EDIT EVENT MODAL ------------------ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Event Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEvent} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
