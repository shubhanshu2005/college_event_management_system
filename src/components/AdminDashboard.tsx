import React, { useState, useEffect, useRef } from 'react';
import { CollegeEvent, Registration, User, AuditLog, Role } from '../types';
import { storage } from '../services/storage';
import { AryaLogo } from './AryaLogo';
import { HimanshuAvatar } from './HimanshuAvatar';
import {
  Shield,
  Users,
  Calendar,
  CheckCircle2,
  PieChart,
  BarChart3,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Search,
  Filter,
  FileText,
  Sparkles,
  AlertCircle,
  X,
  Plus,
  UploadCloud,
  FileSpreadsheet,
  Check,
  Building2,
  GraduationCap,
  Key
} from 'lucide-react';
import Chart from 'chart.js/auto';

interface AdminDashboardProps {
  currentUser: User;
  events: CollegeEvent[];
  registrations: Registration[];
  users: User[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
  activeSubView?: 'overview' | 'events' | 'users' | 'logs';
}

interface MultiStudentRow {
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  phone: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  events,
  registrations,
  users,
  auditLogs,
  onRefreshData,
  activeSubView = 'overview'
}) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'events' | 'users' | 'logs'>(activeSubView);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | Role>('all');
  const [searchUser, setSearchUser] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [searchLogs, setSearchLogs] = useState('');

  // Main Authority Add User / Multiple Students Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addMode, setAddMode] = useState<'bulk-grid' | 'bulk-csv' | 'single'>('bulk-grid');

  // Single User State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'student' as Role,
    rollNumber: '',
    department: 'Computer Science & Engineering (CSE)',
    phone: '',
    status: 'active' as const
  });

  // Multiple Students Rows State (Mode A: Interactive multi-row)
  const [studentRows, setStudentRows] = useState<MultiStudentRow[]>([
    {
      rollNumber: '24EARCS088',
      name: 'Amit Pareek',
      email: 'amit.24earcs088@aryacollege.in',
      department: 'Computer Science & Engineering (CSE)',
      phone: '+91 98765 11001'
    },
    {
      rollNumber: '24EARIT042',
      name: 'Ananya Sen',
      email: 'ananya.24earit042@aryacollege.in',
      department: 'Information Technology (IT)',
      phone: '+91 98765 11002'
    },
    {
      rollNumber: '24EAREC015',
      name: 'Rohit Saini',
      email: 'rohit.24earec015@aryacollege.in',
      department: 'Electronics & Communication (ECE)',
      phone: '+91 98765 11003'
    }
  ]);

  // Bulk CSV / Text state (Mode B)
  const [csvText, setCsvText] = useState(
    '24EARCS101, Vikas Choudhary, vikas.24earcs101@aryacollege.in, CSE, 9876500101\n24EARCS102, Sneha Sharma, sneha.24earcs102@aryacollege.in, CSE, 9876500102\n24EARIT055, Nikhil Verma, nikhil.24earit055@aryacollege.in, IT, 9876500103'
  );

  // Status message in modal
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; message: string; details?: string[] } | null>(null);

  // Chart Canvas Refs
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const registrationsChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance1 = useRef<Chart | null>(null);
  const chartInstance2 = useRef<Chart | null>(null);

  // Sync tab with activeSubView prop
  useEffect(() => {
    if (activeSubView) setCurrentTab(activeSubView);
  }, [activeSubView]);

  // Render Charts
  useEffect(() => {
    if (currentTab === 'overview') {
      // 1. Events by Category (Doughnut)
      if (categoryChartRef.current) {
        if (chartInstance1.current) chartInstance1.current.destroy();

        const categoriesCount: Record<string, number> = {};
        events.forEach((e) => {
          categoriesCount[e.category] = (categoriesCount[e.category] || 0) + 1;
        });

        chartInstance1.current = new Chart(categoryChartRef.current, {
          type: 'doughnut',
          data: {
            labels: Object.keys(categoriesCount),
            datasets: [
              {
                data: Object.values(categoriesCount),
                backgroundColor: [
                  '#DC2626',
                  '#B91C1C',
                  '#EF4444',
                  '#991B1B',
                  '#F87171',
                  '#1F2937'
                ],
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
                labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } }
              }
            }
          }
        });
      }

      // 2. Top Events by Registrations (Bar Chart in Arya Red)
      if (registrationsChartRef.current) {
        if (chartInstance2.current) chartInstance2.current.destroy();

        const topEvents = events.slice(0, 5);
        const labels = topEvents.map((e) => e.title.length > 18 ? e.title.substring(0, 18) + '...' : e.title);
        const data = topEvents.map((e) =>
          registrations.filter((r) => r.eventId === e.id && r.status === 'confirmed').length
        );

        chartInstance2.current = new Chart(registrationsChartRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Confirmed Registrations',
                data,
                backgroundColor: '#DC2626',
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 5 }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, [currentTab, events, registrations]);

  // Is Current User the Main Authority?
  const isMainAuthority = currentUser.role === 'admin';

  // Handler: Add Single User
  const handleCreateSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAuthority) {
      alert('Access Denied: Only Main College Authority (Himanshu Sir) can provision users.');
      return;
    }
    if (!newUserForm.name || !newUserForm.email) return;

    // Check email uniqueness
    const exists = users.some((u) => u.email.toLowerCase() === newUserForm.email.toLowerCase());
    if (exists) {
      setModalFeedback({
        type: 'error',
        message: `Email address "${newUserForm.email}" is already registered!`
      });
      return;
    }

    storage.addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      rollNumber: newUserForm.rollNumber || undefined,
      department: newUserForm.department,
      phone: newUserForm.phone || '+91 98765 00000',
      status: 'active',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
    });

    setModalFeedback({
      type: 'success',
      message: `Account for ${newUserForm.name} (${newUserForm.role}) created successfully!`
    });

    setNewUserForm({
      name: '',
      email: '',
      role: 'student',
      rollNumber: '',
      department: 'Computer Science & Engineering (CSE)',
      phone: '',
      status: 'active'
    });
    onRefreshData();
  };

  // Handler: Add Multiple Students (Grid mode)
  const handleAddMultipleStudentsGrid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAuthority) {
      alert('Access Denied: Only Main College Authority (Himanshu Sir) can enroll students.');
      return;
    }

    // Filter valid non-empty rows
    const validRows = studentRows.filter((r) => r.name.trim() && r.rollNumber.trim() && r.email.trim());
    if (validRows.length === 0) {
      setModalFeedback({
        type: 'error',
        message: 'Please fill in at least one student with Roll Number, Name, and Email.'
      });
      return;
    }

    const result = storage.bulkAddStudents(
      validRows.map((r) => ({
        name: r.name,
        email: r.email,
        rollNumber: r.rollNumber,
        department: r.department || 'Computer Science & Engineering (CSE)',
        phone: r.phone || '+91 98765 00000'
      })),
      `${currentUser.name} (Main College Authority)`
    );

    if (result.addedCount > 0) {
      setModalFeedback({
        type: 'success',
        message: `Successfully enrolled ${result.addedCount} student(s) into Arya College records!`,
        details: result.errors.length > 0 ? result.errors : undefined
      });
      onRefreshData();
    } else {
      setModalFeedback({
        type: 'error',
        message: 'No students were added due to validation conflicts.',
        details: result.errors
      });
    }
  };

  // Handler: Add Multiple Students from CSV
  const handleAddStudentsFromCsv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAuthority) {
      alert('Access Denied: Only Main College Authority (Himanshu Sir) can enroll students.');
      return;
    }

    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const parsedStudents: MultiStudentRow[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 3) {
        parsedStudents.push({
          rollNumber: parts[0] || '',
          name: parts[1] || '',
          email: parts[2] || '',
          department: parts[3] || 'Computer Science & Engineering',
          phone: parts[4] || '+91 98765 00000'
        });
      }
    });

    if (parsedStudents.length === 0) {
      setModalFeedback({
        type: 'error',
        message: 'No valid rows found. Format must be: Roll Number, Name, Email, Department, Phone'
      });
      return;
    }

    const result = storage.bulkAddStudents(
      parsedStudents.map((r) => ({
        name: r.name,
        email: r.email,
        rollNumber: r.rollNumber,
        department: r.department,
        phone: r.phone
      })),
      `${currentUser.name} (Main College Authority)`
    );

    if (result.addedCount > 0) {
      setModalFeedback({
        type: 'success',
        message: `Successfully imported and enrolled ${result.addedCount} student(s) from CSV!`,
        details: result.errors.length > 0 ? result.errors : undefined
      });
      onRefreshData();
    } else {
      setModalFeedback({
        type: 'error',
        message: 'Could not enroll students from CSV.',
        details: result.errors
      });
    }
  };

  // Helper: Add another row in Grid
  const addStudentRow = () => {
    setStudentRows([
      ...studentRows,
      {
        rollNumber: '',
        name: '',
        email: '',
        department: 'Computer Science & Engineering (CSE)',
        phone: ''
      }
    ]);
  };

  // Helper: Remove row in Grid
  const removeStudentRow = (index: number) => {
    if (studentRows.length <= 1) return;
    setStudentRows(studentRows.filter((_, i) => i !== index));
  };

  // Helper: Preload Sample Batch
  const preloadSampleBatch = () => {
    setStudentRows([
      {
        rollNumber: '24EARCS' + Math.floor(100 + Math.random() * 900),
        name: 'Gaurav Sharma',
        email: `gaurav.${Date.now()}@aryacollege.in`,
        department: 'Computer Science & Engineering (CSE)',
        phone: '+91 98765 22001'
      },
      {
        rollNumber: '24EARIT' + Math.floor(100 + Math.random() * 900),
        name: 'Pooja Agarwal',
        email: `pooja.${Date.now()}@aryacollege.in`,
        department: 'Information Technology (IT)',
        phone: '+91 98765 22002'
      },
      {
        rollNumber: '24EAREC' + Math.floor(100 + Math.random() * 900),
        name: 'Manish Meena',
        email: `manish.${Date.now()}@aryacollege.in`,
        department: 'Electronics & Communication (ECE)',
        phone: '+91 98765 22003'
      }
    ]);
    setModalFeedback(null);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'active' | 'suspended') => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    storage.updateUserStatus(userId, next);
    onRefreshData();
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Cannot delete the currently logged in administrator!');
      return;
    }
    if (window.confirm('Are you sure you want to permanently delete this user account?')) {
      storage.deleteUser(userId);
      onRefreshData();
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Delete this event and all associated registrations?')) {
      storage.deleteEvent(eventId);
      onRefreshData();
    }
  };

  const handleChangeEventStatus = (eventId: string, newStatus: CollegeEvent['status']) => {
    storage.updateEventStatus(eventId, newStatus);
    onRefreshData();
  };

  // Metrics
  const totalAttended = registrations.filter((r) => r.attended).length;
  const totalConfirmed = registrations.filter((r) => r.status === 'confirmed').length;
  const overallTurnout = totalConfirmed > 0 ? Math.round((totalAttended / totalConfirmed) * 100) : 0;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(searchUser.toLowerCase()));
    return matchRole && matchSearch;
  });

  // Filtered Events
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchEvent.toLowerCase()) ||
    e.category.toLowerCase().includes(searchEvent.toLowerCase())
  );

  // Filtered Logs
  const filteredLogs = auditLogs.filter((l) =>
    l.action.toLowerCase().includes(searchLogs.toLowerCase()) ||
    l.performedBy.toLowerCase().includes(searchLogs.toLowerCase()) ||
    l.details.toLowerCase().includes(searchLogs.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner in Authentic Arya Red & White */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-2 border-red-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <HimanshuAvatar size="xl" className="border-4 border-yellow-400 shadow-xl" />
            <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md border border-slate-900">
              Authority
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 border border-white/30 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-yellow-300" />
              <span>Arya College of Engineering Main Campus, Jaipur • Principal &amp; Main Head</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif">Dr. Himanshu Arora</h1>
            <p className="text-xs text-yellow-300 font-bold uppercase tracking-wider mt-0.5">
              Principal &amp; College Main Authority (Himanshu Sir)
            </p>
            <p className="text-xs text-red-100 mt-1 max-w-xl font-medium">
              Campus-wide governance over RTU departmental events, faculty conveners, multiple student batch enrollments, and real-time security audit trails.
            </p>
          </div>
        </div>

        {/* Exclusive Main Authority Quick Actions */}
        {isMainAuthority && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setAddMode('bulk-grid');
                setModalFeedback(null);
                setIsAddUserOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-red-700 bg-white hover:bg-red-50 rounded-xl transition shadow-md"
              title="Add multiple students or provision users (Main Authority Exclusive)"
            >
              <Users className="w-4 h-4 text-red-600" />
              <span>Add Multiple Students</span>
              <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded text-[9px] uppercase font-bold">
                Authority Only
              </span>
            </button>
            <button
              onClick={() => {
                setAddMode('single');
                setModalFeedback(null);
                setIsAddUserOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-red-900/80 hover:bg-red-900 border border-red-500 rounded-xl transition"
            >
              <UserPlus className="w-4 h-4" />
              Single User
            </button>
          </div>
        )}
      </div>

      {/* Admin Tabs in Red & White */}
      <div className="bg-white rounded-2xl border-2 border-red-100 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            currentTab === 'overview'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setCurrentTab('events')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            currentTab === 'events'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setCurrentTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            currentTab === 'users'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          User Directory ({users.length})
        </button>
        <button
          onClick={() => setCurrentTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            currentTab === 'logs'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* ------------------ TAB 1: SYSTEM OVERVIEW & CHARTS ------------------ */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Campus Events</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{events.length}</span>
                <span className="text-xs text-emerald-600 font-semibold">
                  {events.filter((e) => e.status === 'Open').length} Open
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Active across RTU departments</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Student Registrations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-red-600">{totalConfirmed}</span>
                <span className="text-xs text-amber-600 font-semibold">
                  +{registrations.filter((r) => r.status === 'waitlisted').length} waitlisted
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Prevented duplicate entries: 100%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">QR Check-in Rate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-600">{overallTurnout}%</span>
                <span className="text-xs text-slate-400">{totalAttended} attended</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Verified attendance credentials</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Users</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{users.length}</span>
                <span className="text-xs text-red-600 font-semibold">
                  {users.filter((u) => u.role === 'student').length} Students
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {users.filter((u) => u.role === 'organizer').length} Faculty Organizers
              </p>
            </div>
          </div>

          {/* Chart.js Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Categories Doughnut */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Events Distribution by Category</h3>
                <p className="text-xs text-slate-500">Breakdown of Arya College events across academic domains</p>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <canvas ref={categoryChartRef} />
              </div>
            </div>

            {/* Chart 2: Registrations Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Events by Student Turnout</h3>
                <p className="text-xs text-slate-500">Events with highest confirmed ticket registrations</p>
              </div>
              <div className="h-64 relative">
                <canvas ref={registrationsChartRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB 2: ALL EVENTS GOVERNANCE ------------------ */}
      {currentTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Events Governance</h3>
              <p className="text-xs text-slate-500">Master view and lifecycle control of all campus events</p>
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by title or venue..."
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-red-50/70 text-slate-700 font-bold border-b border-red-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Event Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Schedule &amp; Venue</th>
                  <th className="p-3">Convener / Organizer</th>
                  <th className="p-3">Registrations</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEvents.map((evt) => {
                  const confirmed = registrations.filter((r) => r.eventId === evt.id && r.status === 'confirmed').length;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900 max-w-[200px]">
                        {evt.title}
                        <span className="block text-[10px] text-slate-400 font-mono">{evt.id}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          {evt.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {evt.date} • {evt.time}
                        <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">{evt.venue}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{evt.organizerName}</td>
                      <td className="p-3 font-mono font-bold text-red-700">
                        {confirmed} / {evt.capacity}
                      </td>
                      <td className="p-3">
                        <select
                          value={evt.status}
                          onChange={(e) => handleChangeEventStatus(evt.id, e.target.value as CollegeEvent['status'])}
                          className="text-[11px] font-bold bg-slate-50 border border-slate-300 rounded-lg p-1"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Open">Open</option>
                          <option value="Full">Full</option>
                          <option value="Closed">Closed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ TAB 3: USER ACCOUNTS DIRECTORY ------------------ */}
      {currentTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">User Directory &amp; Student Registry</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                  Arya College Main Campus
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage student records, faculty event organizers, and system administrator accounts
              </p>
            </div>

            {/* Top Toolbar: Search + Role Filter + EXCLUSIVE ADD BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll no, email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-1">
                {(['all', 'student', 'organizer', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize ${
                      userRoleFilter === r
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Exclusive Add Multiple Students Button (Accessed only by Main Authority) */}
              {isMainAuthority ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAddMode('bulk-grid');
                      setModalFeedback(null);
                      setIsAddUserOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-600/30"
                    title="Add multiple students simultaneously (Main Authority exclusive)"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>+ Add Multiple Students</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddMode('single');
                      setModalFeedback(null);
                      setIsAddUserOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                    title="Add single user"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Single</span>
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  (User provisioning restricted to Main Authority Himanshu Sir)
                </span>
              )}
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-red-50/70 text-slate-700 font-bold border-b border-red-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Roll / ID Number</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2.5">
                      {u.id === 'usr_admin_1' || u.name.includes('Himanshu') ? (
                        <HimanshuAvatar size="sm" />
                      ) : (
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-red-200" />
                      )}
                      <div>
                        {u.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'student'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : u.role === 'organizer'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-red-700">{u.rollNumber || 'N/A'}</td>
                    <td className="p-3 text-slate-600 truncate max-w-[200px]">{u.department || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ TAB 4: AUDIT LOGS ------------------ */}
      {currentTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Security &amp; Attendance Audit Log</h3>
              <p className="text-xs text-slate-500">
                Immutable trace of registrations, check-in validations, multiple student bulk additions, and administrative actions
              </p>
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-red-50/70 text-slate-700 font-bold border-b border-red-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Initiated By</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900 font-sans">{log.action}</td>
                    <td className="p-3 text-red-700 font-sans font-semibold">{log.performedBy}</td>
                    <td className="p-3 text-slate-600 font-sans">{log.details}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {log.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ MAIN AUTHORITY EXCLUSIVE: ADD USER & MULTIPLE STUDENTS MODAL ------------------ */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-600 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-800 via-red-700 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Key className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base font-serif">College Main Authority Portal</h3>
                    <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider">
                      Himanshu Sir Exclusive
                    </span>
                  </div>
                  <p className="text-[11px] text-red-100">
                    Restricted Access: Provision User Accounts &amp; Bulk Enroll Multiple Students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="bg-red-50/70 px-6 pt-3 flex border-b border-red-100 gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setAddMode('bulk-grid');
                  setModalFeedback(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-t-xl transition ${
                  addMode === 'bulk-grid'
                    ? 'bg-white text-red-700 border-t-2 border-x-2 border-red-600 shadow-sm'
                    : 'text-slate-600 hover:text-red-700'
                }`}
              >
                <Users className="w-4 h-4 text-red-600" />
                Add Multiple Students (Multi-Row Grid)
              </button>

              <button
                onClick={() => {
                  setAddMode('bulk-csv');
                  setModalFeedback(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-t-xl transition ${
                  addMode === 'bulk-csv'
                    ? 'bg-white text-red-700 border-t-2 border-x-2 border-red-600 shadow-sm'
                    : 'text-slate-600 hover:text-red-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Fast CSV / Paste Batch Importer
              </button>

              <button
                onClick={() => {
                  setAddMode('single');
                  setModalFeedback(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-t-xl transition ${
                  addMode === 'single'
                    ? 'bg-white text-red-700 border-t-2 border-x-2 border-red-600 shadow-sm'
                    : 'text-slate-600 hover:text-red-700'
                }`}
              >
                <UserPlus className="w-4 h-4 text-slate-700" />
                Single Account
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Feedback Alert Banner */}
              {modalFeedback && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-semibold ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {modalFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{modalFeedback.message}</p>
                    {modalFeedback.details && modalFeedback.details.length > 0 && (
                      <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-slate-700">
                        {modalFeedback.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ----------------- SUB-MODE 1: MULTIPLE STUDENTS GRID ----------------- */}
              {addMode === 'bulk-grid' && (
                <form onSubmit={handleAddMultipleStudentsGrid} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs">
                    <div>
                      <p className="font-black text-red-900">
                        Batch Registration: Enroll Multiple Students Simultaneously
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Authorized by Himanshu Sir (Main Authority). Add rows for all candidates.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={preloadSampleBatch}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-red-700 font-bold border border-red-200 rounded-xl transition text-[11px] shadow-sm"
                      >
                        ⚡ Demo: Pre-fill 3 Students
                      </button>
                      <button
                        type="button"
                        onClick={addStudentRow}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-[11px] shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Row
                      </button>
                    </div>
                  </div>

                  {/* Student Rows Table */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {studentRows.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-700 text-[11px]">
                            Student #{idx + 1}
                          </span>
                          {studentRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStudentRow(idx)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Remove this row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Roll Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., 24EARCS055"
                              value={row.rollNumber}
                              onChange={(e) => {
                                const copy = [...studentRows];
                                copy[idx].rollNumber = e.target.value.toUpperCase();
                                setStudentRows(copy);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., Vikas Sharma"
                              value={row.name}
                              onChange={(e) => {
                                const copy = [...studentRows];
                                copy[idx].name = e.target.value;
                                setStudentRows(copy);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              College Email *
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="e.g., vikas.24earcs055@aryacollege.in"
                              value={row.email}
                              onChange={(e) => {
                                const copy = [...studentRows];
                                copy[idx].email = e.target.value;
                                setStudentRows(copy);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Department Branch
                            </label>
                            <select
                              value={row.department}
                              onChange={(e) => {
                                const copy = [...studentRows];
                                copy[idx].department = e.target.value;
                                setStudentRows(copy);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                            >
                              <option value="Computer Science & Engineering (CSE)">Computer Science &amp; Engineering (CSE)</option>
                              <option value="Information Technology (IT)">Information Technology (IT)</option>
                              <option value="Electronics & Communication (ECE)">Electronics &amp; Communication (ECE)</option>
                              <option value="Artificial Intelligence & Data Science (AI&DS)">Artificial Intelligence &amp; Data Science (AI&amp;DS)</option>
                              <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                              <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
                              <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Contact Phone
                            </label>
                            <input
                              type="text"
                              placeholder="+91 98765 00000"
                              value={row.phone}
                              onChange={(e) => {
                                const copy = [...studentRows];
                                copy[idx].phone = e.target.value;
                                setStudentRows(copy);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submission Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">
                      Ready to enroll: <strong className="text-red-700">{studentRows.length}</strong> student candidate(s)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Authorize &amp; Enroll All {studentRows.length} Students</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* ----------------- SUB-MODE 2: BULK CSV / TEXT IMPORTER ----------------- */}
              {addMode === 'bulk-csv' && (
                <form onSubmit={handleAddStudentsFromCsv} className="space-y-4 text-xs">
                  <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100">
                    <p className="font-black text-red-900 mb-1">
                      Paste Tabular / CSV Student Roster
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Format each student line as: <code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-red-700 border border-red-200">RollNumber, Full Name, Email, Department, Phone</code>.
                      Ideal for exporting from college excel sheets.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Student Data (One line per student) *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs leading-relaxed focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        setCsvText(
                          '24EARCS201, Harsh Vardhan, harsh.24earcs201@aryacollege.in, CSE, 9876543001\n24EARIT202, Tina Mathur, tina.24earit202@aryacollege.in, IT, 9876543002\n24EAREC203, Kunal Soni, kunal.24earec203@aryacollege.in, ECE, 9876543003'
                        )
                      }
                      className="text-xs text-red-700 font-bold hover:underline"
                    >
                      Load Sample 3 Students
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Process &amp; Enroll CSV Students</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* ----------------- SUB-MODE 3: SINGLE USER PROVISION ----------------- */}
              {addMode === 'single' && (
                <form onSubmit={handleCreateSingleUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rohan Gupta"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., rohan.gupta@aryacollege.in"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Role *</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="student">Student (Candidate)</option>
                        <option value="organizer">Faculty Organizer (Convener)</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">RTU Roll / Staff ID</label>
                      <input
                        type="text"
                        placeholder="e.g., 24EARCS099"
                        value={newUserForm.rollNumber}
                        onChange={(e) => setNewUserForm({ ...newUserForm, rollNumber: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Department</label>
                    <input
                      type="text"
                      value={newUserForm.department}
                      onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30"
                    >
                      Provision Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
