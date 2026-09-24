import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { AryaLogo } from './AryaLogo';
import {
  X,
  UserPlus,
  Users,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  UploadCloud
} from 'lucide-react';

interface BulkAddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: () => void;
}

interface StudentRow {
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  phone: string;
}

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)'
];

const SAMPLE_BATCH: StudentRow[] = [
  {
    name: 'Rohan Gupta',
    rollNumber: '24EARCS101',
    email: 'rohan.24earcs101@aryacollege.in',
    department: 'Computer Science & Engineering (CSE)',
    phone: '+91 98765 11001'
  },
  {
    name: 'Ananya Sharma',
    rollNumber: '24EARIT102',
    email: 'ananya.24earit102@aryacollege.in',
    department: 'Information Technology (IT)',
    phone: '+91 98765 11002'
  },
  {
    name: 'Harsh Vardhan Singh',
    rollNumber: '24EARAI103',
    email: 'harsh.24earai103@aryacollege.in',
    department: 'Artificial Intelligence & Data Science (AI & DS)',
    phone: '+91 98765 11003'
  },
  {
    name: 'Divya Meena',
    rollNumber: '24EAREC104',
    email: 'divya.24earec104@aryacollege.in',
    department: 'Electronics & Communication (ECE)',
    phone: '+91 98765 11004'
  },
  {
    name: 'Nikhil Kumar',
    rollNumber: '24EARME105',
    email: 'nikhil.24earme105@aryacollege.in',
    department: 'Mechanical Engineering (ME)',
    phone: '+91 98765 11005'
  }
];

export const BulkAddStudentsModal: React.FC<BulkAddStudentsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  const [activeMode, setActiveMode] = useState<'table' | 'csv'>('table');
  const [rows, setRows] = useState<StudentRow[]>([
    {
      name: '',
      rollNumber: '',
      email: '',
      department: DEPARTMENTS[0],
      phone: ''
    }
  ]);
  const [csvText, setCsvText] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string[];
  } | null>(null);

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL GUARD: Only Main Authority (Himanshu Sir / role === 'admin')
  const isAuthorized = currentUser.role === 'admin';

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        name: '',
        rollNumber: '',
        email: '',
        department: DEPARTMENTS[0],
        phone: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: keyof StudentRow, value: string) => {
    const updated = [...rows];
    updated[index][field] = value;

    // Auto generate Arya email if roll number is typed and email is blank
    if (field === 'rollNumber' && value.trim()) {
      const cleanRoll = value.trim().toLowerCase();
      if (!updated[index].email || updated[index].email.includes('@aryacollege.in')) {
        const studentFirst = updated[index].name.split(' ')[0]?.toLowerCase() || 'student';
        updated[index].email = `${studentFirst}.${cleanRoll}@aryacollege.in`;
      }
    }

    setRows(updated);
  };

  const handleLoadSampleBatch = () => {
    setRows(SAMPLE_BATCH);
    setResultMessage(null);
  };

  // Submit Multi-row Form
  const handleSubmitRows = (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    const validRows = rows.filter(
      (r) => r.name.trim() && r.rollNumber.trim() && r.email.trim()
    );

    if (validRows.length === 0) {
      setResultMessage({
        type: 'error',
        text: 'Please fill in at least one student with Name, Roll Number, and Email.'
      });
      return;
    }

    const { addedCount, errors } = storage.bulkAddStudents(validRows, currentUser.name);

    if (addedCount > 0) {
      setResultMessage({
        type: 'success',
        text: `Successfully enrolled ${addedCount} student(s) into Arya College student database!`,
        details: errors.length > 0 ? errors : undefined
      });
      onSuccess();
      // Reset form
      setRows([
        {
          name: '',
          rollNumber: '',
          email: '',
          department: DEPARTMENTS[0],
          phone: ''
        }
      ]);
    } else {
      setResultMessage({
        type: 'error',
        text: 'Failed to add students. Check for duplicate roll numbers or emails.',
        details: errors
      });
    }
  };

  // Submit CSV batch import
  const handleParseCsv = (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    if (!csvText.trim()) {
      setResultMessage({ type: 'error', text: 'Please paste CSV data or text rows first.' });
      return;
    }

    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsedStudents: StudentRow[] = [];

    lines.forEach((line) => {
      // Ignore header if present
      if (line.toLowerCase().includes('roll') && line.toLowerCase().includes('name')) return;

      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        parsedStudents.push({
          name: parts[0] || '',
          rollNumber: parts[1] || '',
          email: parts[2] || `${parts[0]?.split(' ')[0]?.toLowerCase()}.${parts[1]?.toLowerCase()}@aryacollege.in`,
          department: parts[3] || DEPARTMENTS[0],
          phone: parts[4] || '+91 98765 00000'
        });
      }
    });

    if (parsedStudents.length === 0) {
      setResultMessage({
        type: 'error',
        text: 'Could not parse any valid rows. Format: Name, Roll Number, Email, Department, Phone'
      });
      return;
    }

    const { addedCount, errors } = storage.bulkAddStudents(parsedStudents, currentUser.name);

    if (addedCount > 0) {
      setResultMessage({
        type: 'success',
        text: `Successfully imported & enrolled ${addedCount} student(s) into the database!`,
        details: errors.length > 0 ? errors : undefined
      });
      setCsvText('');
      onSuccess();
    } else {
      setResultMessage({
        type: 'error',
        text: 'Import failed. Check for duplicate roll numbers or formatting issues.',
        details: errors
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-600 max-h-[92vh] flex flex-col">
        {/* Header Ribbon in Red & White */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-md">
              <UserPlus className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-serif">
                  Bulk Student Enrollment &amp; Directory Portal
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-red-700 shadow-sm">
                  Main Authority Only
                </span>
              </div>
              <p className="text-xs text-red-200 mt-0.5">
                Authorized Executive Access: <strong className="text-white">Himanshu Sir (Main Head &amp; Director)</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACCESS CONTROL CHECK */}
        {!isAuthorized ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This function is strictly restricted to the <strong>Main Authority of Arya College (Himanshu Sir)</strong>.
              Students and regular faculty organizers do not have administrative privilege to modify the institutional student registry.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* AUTHORIZED CONTENT */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Authority Verification Card */}
            <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-950">
                    Official Executive Enrollment Privilege Granted
                  </p>
                  <p className="text-[11px] text-red-700">
                    Logged in as <strong>{currentUser.name}</strong> • Main Head, Arya College of Engineering &amp; I.T.
                  </p>
                </div>
              </div>

              {/* Quick Preset Action for Viva Demo */}
              <button
                onClick={handleLoadSampleBatch}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-red-700 bg-white border border-red-300 rounded-xl hover:bg-red-50 transition shadow-sm"
                title="Loads 5 sample 1st year Arya students to test instant bulk enrollment"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Load Sample Batch (5 Students)</span>
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('table')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    activeMode === 'table'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Interactive Multi-Row Form ({rows.length} Students)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('csv')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    activeMode === 'csv'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Paste Batch CSV / Text
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                RTU Format: 24EARCS...
              </span>
            </div>

            {/* Result Message Banner */}
            {resultMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex flex-col gap-1 border-2 animate-in fade-in duration-150 ${
                  resultMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {resultMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="font-bold">{resultMessage.text}</span>
                </div>
                {resultMessage.details && resultMessage.details.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-600 pl-6">
                    {resultMessage.details.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* MODE 1: MULTI-ROW FORM TABLE */}
            {activeMode === 'table' && (
              <form onSubmit={handleSubmitRows} className="space-y-4">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-red-50 text-red-900 font-black border-b border-red-200 uppercase text-[10px]">
                      <tr>
                        <th className="p-3 w-10">#</th>
                        <th className="p-3">Student Name *</th>
                        <th className="p-3">RTU Roll No. *</th>
                        <th className="p-3">Institutional Email *</th>
                        <th className="p-3">Branch / Department</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rows.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-slate-400">{index + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="e.g., Rohan Gupta"
                              value={row.name}
                              onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="24EARCS101"
                              value={row.rollNumber}
                              onChange={(e) => handleRowChange(index, 'rollNumber', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-red-700 uppercase focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              required
                              placeholder="student@aryacollege.in"
                              value={row.email}
                              onChange={(e) => handleRowChange(index, 'email', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-600"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.department}
                              onChange={(e) => handleRowChange(index, 'department', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="+91 98765 00000"
                              value={row.phone}
                              onChange={(e) => handleRowChange(index, 'phone', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              disabled={rows.length === 1}
                              className={`p-1.5 rounded-lg transition ${
                                rows.length === 1
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Toolbar under table */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4 text-red-600" />
                    <span>Add Another Student Row</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-600/30 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>Confirm &amp; Enroll All Students</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* MODE 2: BATCH CSV PASTE */}
            {activeMode === 'csv' && (
              <form onSubmit={handleParseCsv} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900">
                    Instructions for Batch Import:
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Paste one student per line in comma-separated format.
                    Format: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-red-700">Name, Roll Number, Email, Department, Phone</code>
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-500">
                    Rohan Gupta, 24EARCS101, rohan.24earcs101@aryacollege.in, Computer Science &amp; Engineering, +91 98765 11001<br />
                    Ananya Sharma, 24EARIT102, ananya.24earit102@aryacollege.in, Information Technology, +91 98765 11002
                  </div>
                </div>

                <textarea
                  rows={8}
                  placeholder="Paste student rows here..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-red-600"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-600/30 flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4 text-white" />
                    <span>Process &amp; Enroll Students</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-red-700">
            Arya College of Engineering &amp; I.T. • Academic Administration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
