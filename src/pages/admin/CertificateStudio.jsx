import React, { useState, useRef, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import {
  loadCertificateTemplate,
  saveCertificateTemplate,
  DEFAULT_CERTIFICATE_TEMPLATE,
  revokeCertificate,
  reissueCertificate
} from '../../services/certificateService';

export const CertificateStudio = () => {
  const { events, students, registrations, attendance, certificates, generateCertificate } = useEvents();
  const { addToast } = useToast();

  // Active event selection
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');

  // Certificate Type Scope: 'participation' | 'winner' | 'achievement'
  const [selectedCertTypeScope, setSelectedCertTypeScope] = useState('participation');

  // Active view tab: 'studio' (Designer & Live Preview) | 'eligibility' (Participants & Rules) | 'vault' (Issued Registry)
  const [activeTab, setActiveTab] = useState('studio');

  // Load template config for selected event
  const [template, setTemplate] = useState(() => {
    return loadCertificateTemplate(events[0]?.id);
  });

  // Eligibility rules state
  const [eligibilityRules, setEligibilityRules] = useState({
    requireRegistration: true,
    requireDynamicQR: true,
    requireApproval: true,
  });

  // Organizer manual approvals (Set of student IDs)
  const [approvedStudentIds, setApprovedStudentIds] = useState(new Set());

  // Search filter for participant eligibility list
  const [participantSearch, setParticipantSearch] = useState('');

  // UI state for operations
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const certCanvasRef = useRef(null);
  const modalCertCanvasRef = useRef(null);

  // Selected event reference
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || {
      id: 'evt_fallback',
      title: 'Campus Summit 2026',
      date: '2026-10-15',
      venue: 'JPN Auditorium',
      capacity: 250,
      registeredCount: 0,
      attendanceCount: 0,
    };
  }, [events, selectedEventId]);

  // When selected event changes, sync event title & load saved template
  useEffect(() => {
    if (selectedEvent) {
      const saved = loadCertificateTemplate(selectedEvent.id);
      setTemplate({
        ...saved,
        eventName: selectedEvent.title,
        eventId: selectedEvent.id,
      });

      // Default-approve all students who have verified dynamic QR attendance for this event
      const eventAtt = attendance.filter((a) => a.eventId === selectedEvent.id && a.status === 'Present');
      const autoApproved = new Set(eventAtt.map((a) => a.studentId));
      setApprovedStudentIds(autoApproved);
    }
  }, [selectedEventId, selectedEvent, attendance]);

  // Get all registered students for selected event
  const eventParticipants = useMemo(() => {
    if (!selectedEvent) return [];

    // Filter registrations for this event
    const regForEvent = registrations.filter((r) => r.eventId === selectedEvent.id);
    
    // Fallback: if no registrations exist for this event in mock state, use initial students
    const candidateList = regForEvent.length > 0 
      ? regForEvent.map((reg) => {
          const matchStudent = students.find((s) => s.id === reg.studentId) || {
            id: reg.studentId,
            name: reg.studentName || 'Student Attendee',
            email: reg.studentEmail || 'student@eventora.edu',
            usn: reg.usn || '1MS22CS000',
            department: 'Computer Science'
          };
          return matchStudent;
        })
      : students.slice(0, 6); // Realistic initial cohort

    // For each candidate, evaluate attendance and eligibility
    return candidateList.map((st) => {
      // Find attendance record
      const attRecord = attendance.find(
        (a) => a.eventId === selectedEvent.id && (a.studentId === st.id || a.usn === st.usn || a.studentName?.toLowerCase() === st.name?.toLowerCase())
      );

      const hasAttendance = Boolean(attRecord && attRecord.status === 'Present');
      const isDynamicQR = Boolean(attRecord && attRecord.method === 'Dynamic QR');

      // Check if certificate is already issued
      const alreadyIssuedCert = certificates.find(
        (c) => c.eventId === selectedEvent.id && (c.studentId === st.id || c.usn === st.usn || c.recipientName?.toLowerCase() === st.name?.toLowerCase())
      );

      const isApproved = approvedStudentIds.has(st.id);

      // Eligibility calculation
      let isEligible = true;
      const reasons = [];

      if (eligibilityRules.requireDynamicQR && (!hasAttendance || !isDynamicQR)) {
        isEligible = false;
        reasons.push('Dynamic QR check-in missing');
      }

      if (eligibilityRules.requireApproval && !isApproved) {
        isEligible = false;
        reasons.push('Organizer approval pending');
      }

      return {
        ...st,
        attRecord,
        hasAttendance,
        isDynamicQR,
        isApproved,
        isEligible: isEligible && !alreadyIssuedCert,
        alreadyIssuedCert,
        ineligibilityReason: reasons.join(' • '),
      };
    });
  }, [selectedEvent, registrations, students, attendance, certificates, eligibilityRules, approvedStudentIds]);

  // Filtered participants list for search
  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return eventParticipants;
    const q = participantSearch.toLowerCase();
    return eventParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.usn && p.usn.toLowerCase().includes(q))
    );
  }, [eventParticipants, participantSearch]);

  // Statistics
  const eligibleCount = useMemo(() => eventParticipants.filter((p) => p.isEligible).length, [eventParticipants]);
  const issuedCount = useMemo(() => eventParticipants.filter((p) => p.alreadyIssuedCert).length, [eventParticipants]);
  const qrVerifiedCount = useMemo(() => eventParticipants.filter((p) => p.hasAttendance && p.isDynamicQR).length, [eventParticipants]);

  // Validation
  const validateTemplate = () => {
    const errors = {};
    if (!template.title.trim()) errors.title = 'Certificate title is required';
    if (!template.eventName.trim()) errors.eventName = 'Event name is required';
    if (!template.issuerName.trim()) errors.issuerName = 'Primary signatory name is required';
    if (!template.issuerTitle.trim()) errors.issuerTitle = 'Primary signatory title is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler: Save Template
  const handleSaveTemplate = () => {
    if (!validateTemplate()) {
      addToast('Please correct validation errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      saveCertificateTemplate({
        ...template,
        eventId: selectedEvent.id,
        eligibilityRules,
      });
      addToast(`Certificate template saved successfully for "${selectedEvent.title}"!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save template to storage.', 'error');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Handler: Export PDF
  const handleDownloadPDF = async (targetRef = certCanvasRef) => {
    if (!targetRef.current) return;
    setIsExportingPDF(true);
    addToast('Rendering high-fidelity landscape A4 certificate...', 'info');

    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4', // 841.89 pt x 595.28 pt
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image centered with clean landscape proportion
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Eventora-Certificate-${template.sampleRecipient.replace(/\s+/g, '_')}.pdf`);
      addToast('Landscape certificate PDF exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error generating PDF.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Batch Results Summary State
  const [batchResultsSummary, setBatchResultsSummary] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Handler: Batch Generate Certificates via Real FastAPI + ReportLab Engine
  const handleBatchGenerate = async () => {
    if (!validateTemplate()) {
      addToast('Please complete required template fields first.', 'error');
      return;
    }

    if (selectedEvent.certificateTypes?.includes('none')) {
      addToast('Certificate issuance blocked: This event is configured with "No Certificate".', 'error');
      return;
    }

    const eligibleToGenerate = eventParticipants.filter((p) => p.isEligible);

    if (eligibleToGenerate.length === 0 && selectedCertTypeScope === 'participation') {
      addToast('No eligible attendees qualify for certificate generation under current rules.', 'info');
      return;
    }

    setIsGenerating(true);
    addToast(`Generating real ReportLab landscape PDFs (${selectedCertTypeScope})...`, 'info');

    try {
      // 1. Call Backend Batch Generation Endpoint
      const response = await fetch('/api/certificates/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          certificateType: selectedCertTypeScope,
          templateConfig: {
            title: template.title,
            subtitle: template.subtitle,
            eventName: template.eventName,
            description: template.description,
            issueDate: template.issueDate,
            issuerName: template.issuerName,
            issuerTitle: template.issuerTitle,
            coIssuerName: template.coIssuerName,
            coIssuerTitle: template.coIssuerTitle,
            logoType: template.logoType,
            certificateType: selectedCertTypeScope === 'winner' ? 'Winner' : selectedCertTypeScope === 'achievement' ? 'Achievement' : 'Participation',
          },
          eligibilityRules: {
            requireRegistration: eligibilityRules.requireRegistration,
            requireDynamicQR: eligibilityRules.requireDynamicQR,
            requireApproval: eligibilityRules.requireApproval,
          },
          approvedStudentIds: Array.from(approvedStudentIds),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBatchResultsSummary(data);
        setShowResultsModal(true);

        // Synchronize generated certificates into client state
        if (data.results && data.results.length > 0) {
          for (const res of data.results) {
            await generateCertificate({
              eventId: selectedEvent.id,
              eventName: template.eventName,
              studentId: res.studentId,
              recipientName: res.studentName,
              recipientEmail: `${res.studentName.toLowerCase().replace(/\s+/g, '.')}@eventora.edu`,
              usn: res.usn || '',
              issuer: template.issuerName,
              issuerTitle: template.issuerTitle,
              coIssuer: template.coIssuerName,
              coIssuerTitle: template.coIssuerTitle,
              description: template.description,
            });
          }
        }

        addToast(
          `Success: Generated ${data.successfulCount} real PDF certificates (${data.skippedCount} skipped)!`,
          'success'
        );
      } else {
        // Fallback to client generation if backend returns non-200
        for (const p of eligibleToGenerate) {
          await generateCertificate({
            eventId: selectedEvent.id,
            eventName: template.eventName,
            studentId: p.id,
            recipientName: p.name,
            recipientEmail: p.email,
            usn: p.usn || '',
            issuer: template.issuerName,
            issuerTitle: template.issuerTitle,
            coIssuer: template.coIssuerName,
            coIssuerTitle: template.coIssuerTitle,
            description: template.description,
          });
        }
        addToast(`Generated certificates for ${eligibleToGenerate.length} verified attendees.`, 'success');
      }
    } catch (err) {
      console.warn('Backend batch generation fallback to client:', err);
      for (const p of eligibleToGenerate) {
        await generateCertificate({
          eventId: selectedEvent.id,
          eventName: template.eventName,
          studentId: p.id,
          recipientName: p.name,
          recipientEmail: p.email,
          usn: p.usn || '',
          issuer: template.issuerName,
          issuerTitle: template.issuerTitle,
          coIssuer: template.coIssuerName,
          coIssuerTitle: template.coIssuerTitle,
          description: template.description,
        });
      }
      addToast(`Generated certificates for ${eligibleToGenerate.length} verified attendees.`, 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Single attendee issuance
  const handleIssueSingle = async (participant) => {
    setIsGenerating(true);
    try {
      await generateCertificate({
        eventId: selectedEvent.id,
        eventName: template.eventName,
        studentId: participant.id,
        recipientName: participant.name,
        recipientEmail: participant.email,
        usn: participant.usn || '',
        issuer: template.issuerName,
        issuerTitle: template.issuerTitle,
        coIssuer: template.coIssuerName,
        coIssuerTitle: template.coIssuerTitle,
        description: template.description,
      });
      addToast(`Certificate issued to ${participant.name}!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to issue certificate.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle single student approval
  const handleToggleApproval = (studentId) => {
    setApprovedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Approve all QR verified students
  const handleApproveAllQR = () => {
    const qrStudentIds = eventParticipants.filter((p) => p.hasAttendance && p.isDynamicQR).map((p) => p.id);
    setApprovedStudentIds(new Set([...approvedStudentIds, ...qrStudentIds]));
    addToast(`Approved all ${qrStudentIds.length} QR-verified participants.`, 'success');
  };

  // Revoke an issued certificate
  const handleRevoke = async (certId, studentName) => {
    if (!window.confirm(`Revoke credential ${certId} for ${studentName}? It will become immediately invalid in the public verification ledger.`)) {
      return;
    }
    try {
      const res = await revokeCertificate(certId, 'Revoked after administrative policy review', 'Event Director');
      addToast(res.message || `Revoked certificate ${certId}`, 'success');
    } catch {
      addToast('Failed to revoke certificate.', 'error');
    }
  };

  // Reissue / reinstate a revoked certificate
  const handleReissue = async (certId, studentName) => {
    try {
      const res = await reissueCertificate(certId, 'Event Director');
      addToast(res.message || `Reinstated certificate ${certId}`, 'success');
    } catch {
      addToast('Failed to reinstate certificate.', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-20 font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & STUDIO CONTROLS BAR                       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#102A43] text-teal-300">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Credential Studio & Generator
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              A4 Landscape Standard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#102A43] tracking-tight">
            Eventora Certificate Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Create academic-grade certificates with live vector preview, configure anti-fraud dynamic QR attendance gates, and issue verifiable credentials.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Save Template Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px] text-teal-600">
              {isSaving ? 'sync' : 'save'}
            </span>
            <span>{isSaving ? 'Saving Template...' : 'Save Template'}</span>
          </button>

          {/* Fullscreen Preview Button */}
          <button
            onClick={() => setShowFullPreviewModal(true)}
            className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            <span>Full Preview</span>
          </button>

          {/* Batch Generate Button */}
          <button
            onClick={handleBatchGenerate}
            disabled={isGenerating || eligibleCount === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 text-white ${
              eligibleCount > 0 && !isGenerating
                ? 'bg-[#2563EB] hover:bg-blue-700 cursor-pointer shadow-blue-500/20'
                : 'bg-slate-400 cursor-not-allowed opacity-70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isGenerating ? 'hourglass_top' : 'workspace_premium'}
            </span>
            <span>
              {isGenerating ? 'Issuing Certificates...' : `Generate Certificates (${eligibleCount} Eligible)`}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EVENT SELECTOR & WORKFLOW TABS ROW                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Event Selector Card */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-[#102A43] flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">event</span>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Event Scope
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="font-bold text-[#102A43] text-base bg-transparent border-none outline-none cursor-pointer p-0 focus:ring-0 max-w-xs sm:max-w-md truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="text-slate-800 text-sm">
                    {ev.title} ({ev.displayDate || ev.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Registered</span>
              <span className="font-bold text-xs text-[#102A43]">{eventParticipants.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="block text-[10px] text-teal-700 font-bold uppercase">QR Check-Ins</span>
              <span className="font-bold text-xs text-teal-800">{qrVerifiedCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="block text-[10px] text-blue-700 font-bold uppercase">Issued</span>
              <span className="font-bold text-xs text-blue-800">{issuedCount}</span>
            </div>
          </div>
        </div>

        {/* View Tabs Toggle */}
        <div className="lg:col-span-4 bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-white text-[#102A43] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">brush</span>
            <span>Template Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'eligibility'
                ? 'bg-white text-[#102A43] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Eligibility ({eligibleCount})</span>
          </button>
        </div>
      </div>

      {/* No Certificate Warning Banner */}
      {selectedEvent.certificateTypes?.includes('none') && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-900 shadow-xs mb-4">
          <span className="material-symbols-outlined text-rose-600 text-[26px]">block</span>
          <div className="text-xs">
            <strong className="block font-bold text-sm">Certificate Generation Disabled for this Event:</strong>
            This event is currently configured with &ldquo;No Certificate&rdquo;. Batch issuance, automated generation, and credential distribution are disabled.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE VIEW (STUDIO VS ELIGIBILITY)            */}
      {/* ======================================================== */}
      {activeTab === 'studio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ---------------------------------------------------- */}
          {/* LEFT 5 COLS: EDITABLE TEMPLATE CONTROLS              */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">tune</span>
                  <h3 className="text-base font-bold text-[#102A43]">Template Content Editor</h3>
                </div>
                <button
                  onClick={() => setTemplate(DEFAULT_CERTIFICATE_TEMPLATE)}
                  className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Certificate Credential Type Scope */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#102A43]">
                    Certificate Credential Type
                  </label>
                  {selectedCertTypeScope !== 'participation' && (
                    <a
                      href={`/admin/events/${selectedEvent.id}/results`}
                      className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                      Manage Results Board →
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'participation', label: 'Participation', icon: 'school', color: 'teal' },
                    { id: 'winner', label: 'Winner (1st-3rd)', icon: 'trophy', color: 'amber' },
                    { id: 'achievement', label: 'Achievement', icon: 'award_star', color: 'purple' },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => {
                        setSelectedCertTypeScope(ct.id);
                        if (ct.id === 'winner') {
                          setTemplate((prev) => ({
                            ...prev,
                            title: 'Certificate of Winner',
                            description: `In recognition of competitive victory and outstanding placement in ${selectedEvent.title}.`,
                          }));
                        } else if (ct.id === 'achievement') {
                          setTemplate((prev) => ({
                            ...prev,
                            title: 'Certificate of Achievement',
                            description: `For extraordinary innovation, distinction, and technical achievement in ${selectedEvent.title}.`,
                          }));
                        } else {
                          setTemplate((prev) => ({
                            ...prev,
                            title: 'Certificate of Participation',
                            description: `For active participation and demonstrated technical proficiency in ${selectedEvent.title}.`,
                          }));
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        selectedCertTypeScope === ct.id
                          ? ct.id === 'winner'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                            : ct.id === 'achievement'
                            ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-xs'
                            : 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ct.icon}</span>
                      <span className="text-[11px] font-semibold">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Title */}
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                  Certificate Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={template.title}
                  onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                  placeholder="e.g. Certificate of Excellence"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                    validationErrors.title
                      ? 'border-red-400 bg-red-50 text-red-900'
                      : 'border-slate-300 bg-slate-50/50 focus:bg-white focus:border-blue-600 text-slate-800'
                  }`}
                />
                {validationErrors.title && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.title}</p>
                )}

                {/* Quick Title Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Certificate of Excellence', 'Certificate of Participation', 'Certificate of Completion', 'Certificate of Merit'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTemplate({ ...template, title: preset })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          template.title === preset
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {preset.replace('Certificate of ', '')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                  Event / Symposium Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={template.eventName}
                  onChange={(e) => setTemplate({ ...template, eventName: e.target.value })}
                  placeholder="e.g. Annual Tech Fest 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-blue-600 text-sm font-semibold text-slate-800 outline-none"
                />
              </div>

              {/* Recipient Name Sample Preview */}
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                  Sample Recipient Name & USN (For Live Preview)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={template.sampleRecipient}
                    onChange={(e) => setTemplate({ ...template, sampleRecipient: e.target.value })}
                    placeholder="e.g. Poorvika Gowda"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={template.sampleUsn}
                    onChange={(e) => setTemplate({ ...template, sampleUsn: e.target.value })}
                    placeholder="e.g. 1DA22CS042"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Achievement / Description Text */}
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                  Achievement / Citation Statement
                </label>
                <textarea
                  rows={3}
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  placeholder="For active participation, demonstrated excellence, and verified academic attendance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-blue-600 text-xs text-slate-700 leading-relaxed outline-none"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                  Official Issue Date
                </label>
                <input
                  type="text"
                  value={template.issueDate}
                  onChange={(e) => setTemplate({ ...template, issueDate: e.target.value })}
                  placeholder="e.g. October 15, 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              {/* Institutional Branding / Logo Selector */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-[#102A43] mb-2">
                  Institutional Crest & Emblem
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'eventora', label: 'Eventora Seal', icon: 'bolt' },
                    { id: 'dr_ait', label: 'Dr. AIT Crest', icon: 'school' },
                    { id: 'university', label: 'Global Varsity', icon: 'account_balance' },
                  ].map((logo) => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setTemplate({ ...template, logoType: logo.id })}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        template.logoType === logo.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{logo.icon}</span>
                      <span className="text-[11px] truncate w-full">{logo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorized Signatures Section */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-teal-600">draw</span>
                  Authorized Signatories
                </h4>

                {/* Primary Signatory */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Signatory 1 (Primary Issuer)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={template.issuerName}
                      onChange={(e) => setTemplate({ ...template, issuerName: e.target.value })}
                      placeholder="Name (e.g. Dr. Eleanor Vance)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      value={template.issuerTitle}
                      onChange={(e) => setTemplate({ ...template, issuerTitle: e.target.value })}
                      placeholder="Title (e.g. Chief Academic Officer)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Secondary Signatory */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Signatory 2 (Event Director)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={template.coIssuerName}
                      onChange={(e) => setTemplate({ ...template, coIssuerName: e.target.value })}
                      placeholder="Name (e.g. Marcus Sterling)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      value={template.coIssuerTitle}
                      onChange={(e) => setTemplate({ ...template, coIssuerTitle: e.target.value })}
                      placeholder="Title (e.g. Event Director)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* RIGHT 7 COLS: LIVE A4 LANDSCAPE CERTIFICATE PREVIEW  */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Live A4 Landscape Vector Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(certCanvasRef)}
                  disabled={isExportingPDF}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">download</span>
                  <span>{isExportingPDF ? 'Rendering PDF...' : 'Download Sample PDF'}</span>
                </button>
              </div>
            </div>

            {/* Certificate Landscape Canvas Box */}
            <div className="bg-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center overflow-x-auto">
              {/* Landscape A4 Card: 842px x 595px Aspect Proportion */}
              <div
                ref={certCanvasRef}
                style={{
                  width: '100%',
                  maxWidth: '780px',
                  aspectRatio: '1.414 / 1',
                }}
                className="bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between p-8 sm:p-10 select-none border-8 border-[#102A43]"
              >
                {/* Elegant Inner Decorative Border */}
                <div className="absolute inset-2 border-2 border-amber-400/60 pointer-events-none rounded-lg"></div>
                <div className="absolute inset-3 border border-teal-600/30 pointer-events-none rounded-md"></div>

                {/* Subtle Background Watermark */}
                <div className="absolute right-6 bottom-6 w-72 h-72 rounded-full bg-slate-50 pointer-events-none flex items-center justify-center opacity-60">
                  <span className="material-symbols-outlined text-[200px] text-slate-200">
                    workspace_premium
                  </span>
                </div>

                {/* Header Row */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 pb-4">
                  {/* Left Logo / Crest */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#102A43] flex items-center justify-center text-teal-300 shadow-sm border border-amber-400/40">
                      <span className="material-symbols-outlined text-[26px]">
                        {template.logoType === 'dr_ait'
                          ? 'school'
                          : template.logoType === 'university'
                          ? 'account_balance'
                          : 'bolt'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#102A43] tracking-widest text-sm uppercase">
                        {template.logoType === 'dr_ait' ? 'DR. AMBEDKAR INSTITUTE OF TECHNOLOGY' : 'EVENTORA GLOBAL'}
                      </h4>
                      <p className="text-[10px] text-teal-700 tracking-wider uppercase font-semibold">
                        Accredited Academic Credential Authority
                      </p>
                    </div>
                  </div>

                  {/* Right Security ID */}
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      TAMPER-PROOF VERIFICATION ID
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                      CERT-894201-ET26
                    </span>
                  </div>
                </div>

                {/* Center Certificate Body */}
                <div className="relative z-10 text-center my-auto py-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">
                    {template.subtitle}
                  </span>

                  {/* Recipient Name in Serif Display */}
                  <h2 className="text-3xl sm:text-4xl font-serif italic font-extrabold text-[#102A43] tracking-tight mb-1">
                    {template.sampleRecipient}
                  </h2>

                  {/* USN / Subtitle */}
                  {template.sampleUsn && (
                    <span className="font-mono text-xs font-semibold text-teal-700 tracking-wider block mb-2">
                      USN: {template.sampleUsn}
                    </span>
                  )}

                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3"></div>

                  {/* Certificate Type Ribbon & Title Banner */}
                  <div className="flex flex-col items-center gap-1.5 mb-3">
                    {selectedCertTypeScope === 'winner' ? (
                      <div className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm border border-amber-300">
                        <span className="material-symbols-outlined text-[17px]">military_tech</span>
                        ★ COMPETITIVE VICTORY • 1ST PLACE WINNER ★
                      </div>
                    ) : selectedCertTypeScope === 'achievement' ? (
                      <div className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-sm border border-purple-400">
                        <span className="material-symbols-outlined text-[17px]">award_star</span>
                        ◆ DISTINGUISHED ACHIEVEMENT • BEST INNOVATION ◆
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-5 py-1 rounded-full bg-teal-50 border border-teal-300 text-teal-900 font-bold text-xs uppercase tracking-wider shadow-xs">
                        <span className="material-symbols-outlined text-[16px] text-teal-600">school</span>
                        VERIFIED ACADEMIC PARTICIPATION & MERIT
                      </div>
                    )}

                    <div className="inline-block px-4 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-extrabold text-[#102A43] uppercase tracking-widest">
                        {template.title}
                      </span>
                    </div>
                  </div>

                  {/* Citation / Event Description */}
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {template.description}
                  </p>

                  <div className="mt-2 text-[11px] font-semibold text-slate-500">
                    Event: <strong className="text-slate-800">{template.eventName}</strong> • Issued on{' '}
                    <span className="text-slate-700">{template.issueDate}</span>
                  </div>
                </div>

                {/* Footer Row: Signatures & QR Seal */}
                <div className="relative z-10 grid grid-cols-3 items-end pt-4 border-t border-slate-200/80">
                  {/* Primary Signatory */}
                  <div>
                    <div className="font-serif italic font-bold text-[#102A43] text-sm">
                      {template.issuerName}
                    </div>
                    <div className="w-28 h-0.5 bg-slate-300 my-1"></div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {template.issuerTitle}
                    </span>
                  </div>

                  {/* Center QR Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-1 flex flex-col items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[30px] text-[#102A43]">
                        qr_code_2
                      </span>
                      <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter">
                        Scan to Verify
                      </span>
                    </div>
                    <span className="text-[8px] text-emerald-700 font-bold mt-1 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">lock</span>
                      SHA-256 Validated
                    </span>
                  </div>

                  {/* Secondary Signatory */}
                  <div className="text-right">
                    <div className="font-serif italic font-bold text-[#102A43] text-sm">
                      {template.coIssuerName}
                    </div>
                    <div className="w-28 h-0.5 bg-slate-300 my-1 ml-auto"></div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {template.coIssuerTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-[18px]">verified_user</span>
                <span>All certificates generated inherit this vector layout and cryptographic audit trail.</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">842 × 595 pt A4</span>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VIEW 2: ELIGIBILITY RULES & PARTICIPANT AUDIT TABLE      */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Eligibility Configuration Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[22px]">policy</span>
                  Automated Credential Issuance Criteria
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set mandatory rules to prevent unverified certificate claims. Only qualifying participants will receive credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApproveAllQR}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>Approve All QR Verified ({qrVerifiedCount})</span>
                </button>
              </div>
            </div>

            {/* Rules Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Rule 1: Registration Required */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A43]">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">how_to_reg</span>
                    Event Registration Gate
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Student must possess confirmed registration for "{selectedEvent.title}".
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Enforced
                </span>
              </div>

              {/* Rule 2: Dynamic QR Attendance Required */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A43]">
                    <span className="material-symbols-outlined text-[16px] text-teal-600">qr_code_scanner</span>
                    Dynamic QR Attendance
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Attendee must have checked in via rotating 15s Dynamic QR code.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={eligibilityRules.requireDynamicQR}
                  onChange={(e) =>
                    setEligibilityRules({ ...eligibilityRules, requireDynamicQR: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-600 rounded cursor-pointer mt-0.5"
                />
              </div>

              {/* Rule 3: Organizer Manual Approval */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A43]">
                    <span className="material-symbols-outlined text-[16px] text-purple-600">verified</span>
                    Organizer Approval Gate
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Requires manual organizer sign-off before credentials unlock.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={eligibilityRules.requireApproval}
                  onChange={(e) =>
                    setEligibilityRules({ ...eligibilityRules, requireApproval: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Participant Verification Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header & Search */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-[#102A43] text-sm">
                  Registered Participants & Qualification Status ({eventParticipants.length})
                </h4>
                <p className="text-xs text-slate-500">
                  {eligibleCount} currently qualify for generation • {issuedCount} already issued
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
                  <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">search</span>
                  <input
                    type="text"
                    placeholder="Search attendee or USN..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-800 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4">USN / Dept</th>
                    <th className="py-3 px-4">Attendance Check-In</th>
                    <th className="py-3 px-4 text-center">Organizer Approval</th>
                    <th className="py-3 px-4">Eligibility Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No participants found for this query.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.email}</div>
                        </td>

                        {/* USN & Dept */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div>{p.usn || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{p.department}</div>
                        </td>

                        {/* Attendance Status */}
                        <td className="py-3.5 px-4">
                          {p.hasAttendance ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                p.isDynamicQR
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {p.isDynamicQR ? 'verified' : 'schedule'}
                              </span>
                              {p.isDynamicQR ? 'Dynamic QR Validated' : 'Manual Attendance'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                              <span className="material-symbols-outlined text-[13px]">close</span>
                              Not Checked In
                            </span>
                          )}
                        </td>

                        {/* Organizer Approval Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleApproval(p.id)}
                            className={`p-1 rounded-lg border transition-all ${
                              p.isApproved
                                ? 'bg-purple-50 border-purple-300 text-purple-700'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                            }`}
                            title={p.isApproved ? 'Click to revoke approval' : 'Click to approve'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {p.isApproved ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                          </button>
                        </td>

                        {/* Eligibility Status */}
                        <td className="py-3.5 px-4">
                          {p.alreadyIssuedCert ? (
                            p.alreadyIssuedCert.status === 'Revoked' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="material-symbols-outlined text-[13px]">gpp_bad</span>
                                Revoked ({p.alreadyIssuedCert.certificateId})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                Issued ({p.alreadyIssuedCert.certificateId})
                              </span>
                            )
                          ) : p.isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Eligible to Issue
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                              title={p.ineligibilityReason}
                            >
                              <span className="material-symbols-outlined text-[13px]">error</span>
                              Ineligible ({p.ineligibilityReason || 'Missing requirements'})
                            </span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          {p.alreadyIssuedCert ? (
                            <div className="flex items-center justify-end gap-2">
                              {p.alreadyIssuedCert.status === 'Revoked' ? (
                                <button
                                  onClick={() => handleReissue(p.alreadyIssuedCert.certificateId, p.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                                  title="Reinstate revoked credential"
                                >
                                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                                  <span>Reinstate</span>
                                </button>
                              ) : (
                                <>
                                  <a
                                    href={`/api/certificates/download/${p.alreadyIssuedCert.certificateId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                                    title="Download real ReportLab landscape A4 PDF"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">download</span>
                                    <span>PDF</span>
                                  </a>
                                  <button
                                    onClick={() => handleRevoke(p.alreadyIssuedCert.certificateId, p.name)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors"
                                    title="Revoke certificate"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">gpp_bad</span>
                                    <span>Revoke</span>
                                  </button>
                                </>
                              )}
                              <a
                                href={`/verify/${p.alreadyIssuedCert.certificateId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-slate-500 hover:text-blue-600 font-semibold"
                              >
                                Verify
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleIssueSingle(p)}
                              disabled={!p.isEligible || isGenerating}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                p.isEligible && !isGenerating
                                  ? 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Issue Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FULLSCREEN PREVIEW MODAL                               */}
      {/* ======================================================== */}
      {showFullPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">
                  A4 Landscape Certificate Fullscreen Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Exact high-resolution rendering as delivered to attendee vaults and public verification links.
                </p>
              </div>
              <button
                onClick={() => setShowFullPreviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Modal Certificate Canvas */}
            <div
              ref={modalCertCanvasRef}
              style={{
                width: '100%',
                aspectRatio: '1.414 / 1',
              }}
              className="bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between p-10 sm:p-14 select-none border-8 border-[#102A43]"
            >
              {/* Decorative borders */}
              <div className="absolute inset-2 border-2 border-amber-400/60 pointer-events-none rounded-lg"></div>
              <div className="absolute inset-3 border border-teal-600/30 pointer-events-none rounded-md"></div>

              {/* Watermark */}
              <div className="absolute right-8 bottom-8 w-80 h-80 rounded-full bg-slate-50 pointer-events-none flex items-center justify-center opacity-60">
                <span className="material-symbols-outlined text-[240px] text-slate-200">
                  workspace_premium
                </span>
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#102A43] flex items-center justify-center text-teal-300 shadow-sm border border-amber-400/40">
                    <span className="material-symbols-outlined text-[32px]">
                      {template.logoType === 'dr_ait'
                        ? 'school'
                        : template.logoType === 'university'
                        ? 'account_balance'
                        : 'bolt'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#102A43] tracking-widest text-base uppercase">
                      {template.logoType === 'dr_ait' ? 'DR. AMBEDKAR INSTITUTE OF TECHNOLOGY' : 'EVENTORA GLOBAL'}
                    </h4>
                    <p className="text-xs text-teal-700 tracking-wider uppercase font-semibold">
                      Accredited Academic Credential Authority
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    TAMPER-PROOF VERIFICATION ID
                  </span>
                  <span className="font-mono text-sm font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded border border-blue-200 inline-block mt-0.5">
                    CERT-894201-ET26
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 text-center my-auto py-4">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  {template.subtitle}
                </span>

                <h2 className="text-4xl sm:text-5xl font-serif italic font-extrabold text-[#102A43] tracking-tight mb-1">
                  {template.sampleRecipient}
                </h2>

                {template.sampleUsn && (
                  <span className="font-mono text-sm font-semibold text-teal-700 tracking-wider block mb-3">
                    USN: {template.sampleUsn}
                  </span>
                )}

                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>

                <div className="inline-block px-5 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-4">
                  <span className="text-sm font-extrabold text-[#102A43] uppercase tracking-widest">
                    {template.title}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                  {template.description}
                </p>

                <div className="mt-3 text-xs font-semibold text-slate-500">
                  Event: <strong className="text-slate-800">{template.eventName}</strong> • Issued on{' '}
                  <span className="text-slate-700">{template.issueDate}</span>
                </div>
              </div>

              {/* Signatures & QR */}
              <div className="relative z-10 grid grid-cols-3 items-end pt-6 border-t border-slate-200/80">
                <div>
                  <div className="font-serif italic font-bold text-[#102A43] text-base">
                    {template.issuerName}
                  </div>
                  <div className="w-36 h-0.5 bg-slate-300 my-1"></div>
                  <span className="text-xs text-slate-500 font-medium block">
                    {template.issuerTitle}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 flex flex-col items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[40px] text-[#102A43]">
                      qr_code_2
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">
                      Scan to Verify
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-700 font-bold mt-1 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    SHA-256 Validated
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-serif italic font-bold text-[#102A43] text-base">
                    {template.coIssuerName}
                  </div>
                  <div className="w-36 h-0.5 bg-slate-300 my-1 ml-auto"></div>
                  <span className="text-xs text-slate-500 font-medium block">
                    {template.coIssuerTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFullPreviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleDownloadPDF(modalCertCanvasRef)}
                disabled={isExportingPDF}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>{isExportingPDF ? 'Generating...' : 'Download Landscape A4 PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BATCH GENERATION RESULT SUMMARY MODAL                  */}
      {/* ======================================================== */}
      {showResultsModal && batchResultsSummary && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#102A43]">
                    Certificate Generation Results
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluated {batchResultsSummary.totalEvaluated} attendees for "{template.eventName}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResultsModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">Issued</span>
                <span className="text-2xl font-extrabold text-emerald-900">{batchResultsSummary.successfulCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Skipped</span>
                <span className="text-2xl font-extrabold text-slate-800">{batchResultsSummary.skippedCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Evaluated</span>
                <span className="text-2xl font-extrabold text-blue-900">{batchResultsSummary.totalEvaluated}</span>
              </div>
            </div>

            {/* Successful Issuances List */}
            {batchResultsSummary.results && batchResultsSummary.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  Generated & Uploaded Credentials ({batchResultsSummary.results.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {batchResultsSummary.results.map((item) => (
                    <div key={item.certificateId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.studentName}</div>
                        <div className="text-[11px] font-mono text-teal-700">{item.certificateId} • {item.usn || 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/certificates/download/${item.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>Download PDF</span>
                        </a>
                        <a
                          href={`/verify/${item.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-blue-600 font-semibold"
                        >
                          Verify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped Attendees List */}
            {batchResultsSummary.skippedDetails && batchResultsSummary.skippedDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">warning</span>
                  Skipped / Ineligible Participants ({batchResultsSummary.skippedDetails.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {batchResultsSummary.skippedDetails.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{item.studentName || item.studentId}</span>
                        <p className="text-[11px] text-amber-800">{item.reason}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-100">
                        Skipped
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Action */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-slate-900 text-white font-bold text-xs"
              >
                Done & Return to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
