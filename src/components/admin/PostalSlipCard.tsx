'use client';
import { useState } from 'react';
import { Download, Printer, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { downloadPostalSlipPDF, printPostalSlipWindow } from '@/utils/postalSlip';

interface PostalSlipCardProps {
  orderNumber: string;
  deliveryAddress: {
    fullName: string;
    houseOrFlat: string;
    street: string;
    area?: string;
    city: string;
    state: string;
    pinCode: string;
    mobile: string;
  };
}

export default function PostalSlipCard({ orderNumber, deliveryAddress: addr }: PostalSlipCardProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const containerId = `postal-slip-preview-${orderNumber.replace(/[^a-zA-Z0-9-]/g, '_')}`;

  const handleCopyText = () => {
    const text = `BY INDIA POST PARCEL(CONTRACTUAL)\nCONTRACT NO.41120154-TENALI EXAMS PUBLISHERS\nCUSTOMER ID:${orderNumber}\n\nTo\n${addr.fullName}\n${addr.houseOrFlat}, ${addr.street}${addr.area ? '\n' + addr.area : ''}\n${addr.city}, ${addr.state} - ${addr.pinCode}\nCELL: ${addr.mobile}\n\nFrom:\nTENALI EXAMS PUBLISHERS\nD.NO.19-308\nNAMBURU-522508\nGUNTUR-DIST\nCELL 7396977544`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Postal Slip format copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      downloadPostalSlipPDF({ orderNumber, deliveryAddress: addr });
      toast.success('PDF downloaded (19cm x 9.5cm)');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    printPostalSlipWindow({ orderNumber, deliveryAddress: addr });
  };

  return (
    <div className="space-y-3">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <FileText size={15} className="text-blue-500" />
          <span>Postal Slip (19cm × 9.5cm)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 transition-all shadow-sm"
          >
            {copied ? (
              <><Check size={14} className="text-emerald-500" strokeWidth={3} /> Copied</>
            ) : (
              <><Copy size={14} /> Copy Text</>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <><Loader2 size={14} className="animate-spin" /> Generating PDF...</>
            ) : (
              <><Download size={14} /> Download PDF</>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Printer size={14} /> Print Slip
          </button>
        </div>
      </div>

      {/* 19cm x 9.5cm Postal Card Container Preview */}
      <div className="w-full p-2 bg-slate-900/5 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
        <div
          id={containerId}
          className="w-full max-w-170 aspect-19/9.5 min-h-75 bg-white text-black font-mono p-4 sm:p-5 shadow-lg border-2 border-black flex flex-col justify-between select-all text-left box-border rounded-sm overflow-hidden"
        >
          {/* Header */}
          <div className="font-bold text-[10px] sm:text-[11px] uppercase tracking-tight leading-snug border-b-2 border-black/80 pb-1.5 sm:pb-2">
            <div>BY INDIA POST PARCEL(CONTRACTUAL)</div>
            <div>CONTRACT NO.41120154-TENALI EXAMS PUBLISHERS</div>
            <div>CUSTOMER ID:{orderNumber}</div>
          </div>

          {/* To Section */}
          <div className="pl-6 sm:pl-12 text-[11px] sm:text-xs leading-tight sm:leading-normal space-y-0.5 wrap-break-word">
            <div className="font-bold text-xs sm:text-sm mb-0.5">To</div>
            <div className="font-bold text-xs sm:text-sm text-black">{addr.fullName}</div>
            <div>{addr.houseOrFlat}, {addr.street}</div>
            {addr.area && <div>{addr.area}</div>}
            <div>{addr.city}, {addr.state} - {addr.pinCode}</div>
            <div className="mt-0.5 font-bold">CELL: {addr.mobile}</div>
          </div>

          {/* From Section */}
          <div className="font-bold text-[9.5px] sm:text-[10.5px] leading-tight pt-1.5 sm:pt-2 border-t-2 border-black/80">
            <div>From:</div>
            <div>TENALI EXAMS PUBLISHERS</div>
            <div>D.NO.19-308</div>
            <div>NAMBURU-522508</div>
            <div>GUNTUR-DIST</div>
            <div>CELL 7396977544</div>
          </div>
        </div>
      </div>
    </div>
  );
}
