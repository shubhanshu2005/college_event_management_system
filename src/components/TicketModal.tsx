import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Registration } from '../types';
import { AryaLogo } from './AryaLogo';
import { X, Calendar, Clock, MapPin, CheckCircle2, ShieldAlert, Printer } from 'lucide-react';

interface TicketModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ registration, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (registration && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        `ARYA-KUKAS-CHECKIN:${registration.ticketCode}:${registration.studentRoll}:${registration.eventId}`,
        {
          width: 190,
          margin: 1,
          color: {
            dark: '#B91C1C',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error', error);
        }
      );
    }
  }, [registration]);

  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-600">
        {/* Header Ribbon in Red & White Theme */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-5 text-center relative border-b-2 border-red-600">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close ticket"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-1 bg-white p-2.5 rounded-2xl max-w-[200px] mx-auto shadow-md">
            <AryaLogo size="sm" layout="stacked" />
          </div>

          <div className="inline-block px-3 py-0.5 bg-white text-red-700 rounded-full text-[10px] font-black tracking-wider uppercase my-1.5 shadow-sm">
            Official E-Ticket &amp; Entry Pass
          </div>
          <h2 className="text-base font-black leading-tight line-clamp-1">{registration.eventTitle}</h2>
          <p className="text-[11px] text-red-200 mt-0.5 font-medium">
            Arya College of Engineering &amp; I.T. • Kukas - Jaipur
          </p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          {/* Status Alert Banner */}
          {registration.status === 'confirmed' ? (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Confirmed Arya Entry Pass</span>
              </div>
              <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black">
                Valid Pass
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Priority Waitlist Ticket</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 rounded text-[10px] font-bold">Waitlist</span>
            </div>
          )}

          {/* QR Code Centerpiece */}
          <div className="flex flex-col items-center justify-center p-4 bg-red-50/40 border-2 border-dashed border-red-300 rounded-2xl">
            <div className="bg-white p-3 rounded-xl shadow-md border border-red-100">
              <canvas ref={canvasRef} className="w-44 h-44 rounded-lg block" />
            </div>
            <div className="mt-3 text-center">
              <span className="font-mono text-xs font-black tracking-widest text-white bg-red-600 px-3.5 py-1 rounded-md shadow-sm">
                {registration.ticketCode}
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Scan at the Arya Main Campus entrance desk for instant check-in
              </p>
            </div>
          </div>

          {/* Attendee Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px]">Student Name</p>
              <p className="font-extrabold text-slate-900">{registration.studentName}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px]">RTU Roll Number</p>
              <p className="font-mono font-extrabold text-red-600">{registration.studentRoll}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px]">Department</p>
              <p className="font-semibold text-slate-700 truncate">{registration.studentDept}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px]">Attendance Status</p>
              <p className={`font-extrabold ${registration.attended ? 'text-emerald-600' : 'text-slate-500'}`}>
                {registration.attended ? '✓ Verified Present' : 'Pending Check-In'}
              </p>
            </div>
          </div>

          {/* Event Venue & Date */}
          <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>{registration.eventDate} ({registration.eventTime})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="truncate">{registration.eventVenue}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Pass
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
