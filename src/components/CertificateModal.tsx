import React from 'react';
import { Registration } from '../types';
import { AryaLogo } from './AryaLogo';
import { X, Award, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ registration, onClose }) => {
  if (!registration || !registration.attended) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-double border-red-600">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-red-700 bg-white/90 hover:bg-white rounded-full transition shadow-md"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Container with Red & White Institutional Styling */}
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-red-50/30 via-white to-red-50/20 relative">
          {/* Subtle watermark logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <AryaLogo size="xl" layout="stacked" />
          </div>

          {/* Exact Logo from User Request at Center Top */}
          <div className="flex flex-col items-center mb-4">
            <AryaLogo size="md" layout="stacked" />
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-2">
              Affiliated to Rajasthan Technical University (RTU), Kota • Approved by AICTE, New Delhi • Estd. 2000
            </p>
          </div>

          {/* Certificate Title Banner in Red */}
          <div className="my-5">
            <p className="text-xs uppercase tracking-[0.35em] text-red-700 font-black mb-1">
              Certificate of Active Participation &amp; Technical Excellence
            </p>
            <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto"></div>
          </div>

          {/* Recipient text */}
          <p className="text-xs italic text-slate-600 mb-1">This certificate is proudly awarded to</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 underline decoration-red-600 underline-offset-8 mb-2">
            {registration.studentName}
          </h2>
          <p className="text-xs text-slate-600 font-mono tracking-wide">
            RTU Roll No: <span className="font-bold text-red-700">{registration.studentRoll}</span> • Branch: {registration.studentDept}
          </p>

          {/* Body description */}
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-5 leading-relaxed font-medium">
            for active engagement and successful verified attendance at the college technical event
          </p>

          <h3 className="text-lg sm:text-xl font-black text-red-700 font-serif mt-2 mb-3">
            "{registration.eventTitle}"
          </h3>

          <p className="text-xs text-slate-500">
            Conducted on <span className="font-bold text-slate-800">{registration.eventDate}</span> at {registration.eventVenue}
          </p>

          {/* Signatures & Red Verification Seal */}
          <div className="mt-10 pt-6 border-t border-red-100 grid grid-cols-3 items-end text-center text-xs text-slate-600">
            <div>
              <div className="font-serif italic font-bold text-sm text-slate-900 border-b border-slate-300 pb-1 mx-4">
                Rananjay Rathore
              </div>
              <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase">Event Convener &amp; Organizer</p>
              <p className="text-[9px] text-slate-400">Arya College of Engg. &amp; I.T.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-red-600 bg-red-50 flex items-center justify-center text-red-700 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-red-600" />
              </div>
              <span className="text-[10px] text-red-700 font-black uppercase mt-1">Verified Credential</span>
              <span className="text-[9px] font-mono font-bold text-slate-700">{registration.certificateId || 'CERT-ARYA-2026'}</span>
            </div>

            <div>
              <div className="font-serif italic font-bold text-sm text-slate-900 border-b border-slate-300 pb-1 mx-4">
                Himanshu Sir
              </div>
              <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase">Main Head &amp; Director</p>
              <p className="text-[9px] text-slate-400">Arya College of Engg. &amp; I.T., Kukas</p>
            </div>
          </div>
        </div>

        {/* Footer toolbar in Red & White */}
        <div className="bg-red-50/80 px-6 py-3 border-t border-red-100 flex items-center justify-between">
          <span className="text-xs text-red-800 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-red-600" />
            Verified against RTU Student Records • Arya Main Campus Database
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
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
    </div>
  );
};
