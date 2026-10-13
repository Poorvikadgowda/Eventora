import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export const CertificateViewerModal = ({ isOpen, onClose, certificate }) => {
  const { addToast } = useToast();
  const certRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!certificate) return null;

  const handleDownloadPDF = async () => {
    // 1. Direct download of authentic ReportLab landscape A4 PDF
    if (certificate?.certificateId) {
      window.open(`/api/certificates/download/${certificate.certificateId}`, '_blank');
      addToast('Downloading official landscape A4 certificate PDF...', 'success');
      return;
    }

    if (!certRef.current) return;
    setIsExporting(true);
    addToast('Generating high-resolution PDF certificate...', 'info');

    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const imgWidth = 842;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
      pdf.save(`${certificate.certificateId}-${certificate.recipientName.replace(/\s+/g, '_')}.pdf`);
      addToast('Certificate PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to generate PDF. You can use browser print.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(url);
    addToast('Public verification link copied to clipboard!', 'success');
  };

  const handleShareLinkedIn = () => {
    const shareText = encodeURIComponent(
      `Excited to have earned my verified credential for "${certificate.eventName}" on Eventora! Verify authenticity: ${window.location.origin}/verify/${certificate.certificateId}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${shareText}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Credential Studio — Verified Certificate" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-space-lg">
        {/* Printable Certificate Frame */}
        <div
          ref={certRef}
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-[0_12px_32px_-4px_rgba(16,42,67,0.08)] relative overflow-hidden flex flex-col justify-between border-t-8 border-secondary-container border-x border-b border-surface-container-high"
        >
          {/* Background Watermark */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-slate-50 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined text-[240px] text-slate-100 select-none">
              workspace_premium
            </span>
          </div>

          {/* Certificate Header */}
          <div className="flex justify-between items-start mb-8 relative z-10 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-teal-300 shadow-md">
                <span className="material-symbols-outlined text-[28px]">bolt</span>
              </div>
              <div>
                <span className="font-headline-sm text-primary tracking-wide font-bold block">
                  EVENTORA GLOBAL
                </span>
                <p className="text-[11px] text-slate-500 tracking-widest uppercase font-semibold">
                  Verified Campus & Enterprise Credential Authority
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">VERIFICATION ID</span>
              <span className="font-mono text-sm font-bold text-secondary bg-blue-50 px-2 py-0.5 rounded">
                {certificate.certificateId}
              </span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="text-center py-6 relative z-10 my-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 block mb-2 font-semibold">
              This is proudly presented to
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif italic text-primary mb-4 font-bold tracking-tight text-slate-900">
              {certificate.recipientName}
            </h2>
            <div className="w-24 h-1 bg-secondary mx-auto mb-6 rounded-full"></div>
            <p className="text-base text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              {certificate.description || `For successfully completing and actively participating in the premier symposium ${certificate.eventName}, demonstrating exceptional technical engagement and innovation.`}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
              <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
              <span className="text-xs font-semibold text-slate-700">Issued on {certificate.issueDate}</span>
            </div>
          </div>

          {/* Certificate Footer / Signatures & QR */}
          <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-200 relative z-10">
            <div>
              <div className="font-serif italic text-lg text-primary font-bold">{certificate.issuer || 'Dr. Eleanor Vance'}</div>
              <div className="w-32 h-[1px] bg-slate-300 my-1"></div>
              <span className="text-xs text-slate-500 font-medium">{certificate.issuerTitle || 'Chief Academic Officer'}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-xl p-1.5 flex flex-col items-center justify-center border border-slate-200 shadow-xs">
                <span className="material-symbols-outlined text-primary text-[36px]">qr_code_2</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">Scan to Verify</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span> 100% Cryptographic
              </span>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-lg text-primary font-bold">{certificate.coIssuer || 'Marcus Sterling'}</div>
              <div className="w-32 h-[1px] bg-slate-300 my-1 ml-auto"></div>
              <span className="text-xs text-slate-500 font-medium">{certificate.coIssuerTitle || 'Event Director'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-space-sm pt-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 min-w-[160px] bg-secondary hover:bg-secondary-container text-white font-label-md px-space-md py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-space-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md px-space-md py-3 rounded-xl transition-all flex items-center justify-center gap-space-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>Copy Verify Link</span>
          </button>

          <button
            onClick={handleShareLinkedIn}
            className="bg-[#0a66c2] hover:bg-[#095196] text-white font-label-md px-space-md py-3 rounded-xl transition-all flex items-center justify-center gap-space-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>Share on LinkedIn</span>
          </button>

          <a
            href={`/verify/${certificate.certificateId}`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-label-md px-space-md py-3 rounded-xl transition-all flex items-center justify-center gap-space-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Verify Live</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};
