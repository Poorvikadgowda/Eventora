import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { verifyCertificate } from '../../services/certificateService';

export const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(certificateId || '');
  const [activeLookupId, setActiveLookupId] = useState(certificateId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Securely query backend whenever lookup ID changes
  useEffect(() => {
    if (!activeLookupId) {
      setResult(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    // Call secure backend endpoint - never trusting client-provided details
    verifyCertificate(activeLookupId)
      .then((data) => {
        if (isMounted) {
          setResult(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResult({
            status: 'Not Found',
            isValid: false,
            certificateId: activeLookupId,
          });
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeLookupId]);

  // Sync route param changes
  useEffect(() => {
    if (certificateId) {
      setSearchId(certificateId);
      setActiveLookupId(certificateId);
    }
  }, [certificateId]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const clean = searchId.trim().toUpperCase();
    if (!clean) return;
    navigate(`/verify/${clean}`);
    setActiveLookupId(clean);
  };

  const handleQuickTest = (id) => {
    setSearchId(id);
    navigate(`/verify/${id}`);
    setActiveLookupId(id);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const status = result?.status;
  const isValid = result?.isValid && status === 'Valid';
  const isRevoked = status === 'Revoked';
  const isNotFound = status === 'Not Found';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#102A43] flex items-center justify-center text-teal-300 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <span className="font-bold text-[#102A43] text-lg block leading-tight">Eventora Trust Vault</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Public Credential Verification
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/student/certificates"
            className="hidden sm:flex text-xs font-bold text-slate-600 hover:text-[#2563EB] items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Student Vault</span>
          </Link>
          <Link
            to="/login"
            className="text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors"
          >
            <span>Sign In</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Verification Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Verification Hero Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[15px]">security</span>
            <span>Authoritative Academic Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
            Certificate Authenticity Checker
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Directly verified against the Eventora Global Credential Registry.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full mb-6 flex items-center bg-white rounded-2xl p-2 border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <div className="flex items-center flex-1 px-3">
            <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-030190-ET26)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm font-mono text-slate-800 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>Verify</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Quick Testing Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Quick Test:</span>
          <button
            type="button"
            onClick={() => handleQuickTest('CERT-030190-ET26')}
            className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            title="Test Valid Certificate"
          >
            Valid: CERT-030190-ET26
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest('CERT-REVOKED-DEMO')}
            className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
            title="Test Revoked Certificate"
          >
            Revoked: CERT-REVOKED-DEMO
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest('CERT-INVALID-9999')}
            className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            title="Test Nonexistent Certificate"
          >
            Not Found: CERT-INVALID-9999
          </button>
        </div>

        {/* -------------------------------------------------------- */}
        {/* STATE A: LOADING SKELETON                                */}
        {/* -------------------------------------------------------- */}
        {isLoading && (
          <div className="w-full bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center animate-pulse space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200">
              <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#102A43]">
                Querying Secure Credential Registry...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Retrieving verified status for <span className="font-mono font-bold text-slate-700">{activeLookupId}</span>
              </p>
            </div>
            <div className="space-y-3 max-w-sm mx-auto pt-2">
              <div className="h-3.5 bg-slate-100 rounded-full w-full"></div>
              <div className="h-3.5 bg-slate-100 rounded-full w-4/5 mx-auto"></div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* STATE B: VALID CERTIFICATE (SUCCESS DESIGN)               */}
        {/* -------------------------------------------------------- */}
        {!isLoading && isValid && result && (
          <div className="w-full bg-white rounded-3xl p-6 sm:p-9 shadow-lg border border-slate-200 relative overflow-hidden space-y-6">
            {/* Header Badge */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h3 className="text-teal-950 font-bold text-base">
                    Valid Certificate
                  </h3>
                  <p className="text-teal-800 text-xs">
                    Officially verified and active in Eventora Registry
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-600 text-white shadow-xs">
                Valid
              </span>
            </div>

            {/* Approved Fields Grid */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3.5 divide-y divide-slate-200/60">
              {/* 1. Certificate ID */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 first:pt-0">
                <span className="text-xs text-slate-500 font-semibold">Certificate ID</span>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <span className="font-mono text-sm font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {result.certificateId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(result.certificateId)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Copy Certificate ID"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedId ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Recipient Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Approved Recipient</span>
                <span className="text-base font-extrabold text-[#102A43] mt-0.5 sm:mt-0">
                  {result.recipientName}
                </span>
              </div>

              {/* 3. Event Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Event Name</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 sm:mt-0 text-right">
                  {result.eventName}
                </span>
              </div>

              {/* 3b. Credential Type & Award Distinction */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Credential Classification</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 sm:mt-0 justify-end">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                    (result.certificateType || '').toLowerCase() === 'winner'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : (result.certificateType || '').toLowerCase() === 'achievement'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-teal-100 text-teal-900 border border-teal-300'
                  }`}>
                    {result.certificateType || 'Participation'}
                  </span>
                  {result.awardTitle && (
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {result.awardTitle}
                    </span>
                  )}
                  {result.teamName && (
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Team: {result.teamName}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Issuing Organization */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Issuing Organization</span>
                <span className="text-xs font-bold text-[#0D9488] mt-0.5 sm:mt-0 text-right">
                  {result.issuingOrganization}
                </span>
              </div>

              {/* 5. Issue Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Issue Date</span>
                <span className="text-xs font-semibold text-slate-700 mt-0.5 sm:mt-0">
                  {result.issueDate}
                </span>
              </div>
            </div>

            {/* Verification Assurance Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-teal-600">lock</span>
                <span>Tamper-evident verification via secure Eventora ledger</span>
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* STATE C: REVOKED CERTIFICATE (NEVER DISPLAYED AS VALID)   */}
        {/* -------------------------------------------------------- */}
        {!isLoading && isRevoked && result && (
          <div className="w-full bg-white rounded-3xl p-6 sm:p-9 shadow-lg border border-rose-300 relative overflow-hidden space-y-6">
            {/* Revoked Banner */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">gpp_bad</span>
                </div>
                <div>
                  <h3 className="text-rose-950 font-extrabold text-base">
                    Revoked Certificate
                  </h3>
                  <p className="text-rose-800 text-xs">
                    This credential was formally revoked and is invalid
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                Revoked
              </span>
            </div>

            {/* Critical Warning Box */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1 text-rose-800">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Notice of Invalidation
              </div>
              <p className="text-rose-700 leading-relaxed">
                This credential was revoked by the issuing institution. It is no longer valid, recognized, or authorized for academic, verification, or employment credentials.
              </p>
              {result.revocationReason && (
                <div className="pt-2 border-t border-rose-200/80 flex items-start gap-1">
                  <span className="font-bold text-rose-800">Reason:</span>
                  <span className="text-rose-700">{result.revocationReason}</span>
                </div>
              )}
            </div>

            {/* Approved Fields Grid with VOID Styling */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3.5 divide-y divide-slate-200/60 opacity-70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 first:pt-0">
                <span className="text-xs text-slate-500 font-semibold">Certificate ID</span>
                <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {result.certificateId} (VOID)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Original Recipient</span>
                <span className="text-base font-bold text-slate-800 line-through">
                  {result.recipientName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Event Name</span>
                <span className="text-sm font-semibold text-slate-700 text-right">
                  {result.eventName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Issuing Organization</span>
                <span className="text-xs font-semibold text-slate-700 text-right">
                  {result.issuingOrganization}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3">
                <span className="text-xs text-slate-500 font-semibold">Original Issue Date</span>
                <span className="text-xs text-slate-600">
                  {result.issueDate}
                </span>
              </div>
            </div>

            {/* Revoked Footer Notice */}
            <div className="pt-1 text-center text-xs text-rose-600 font-semibold">
              Revoked credentials cannot be exported, downloaded, or shared.
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* STATE D: NOT FOUND (INVALID CERTIFICATE DESIGN)           */}
        {/* -------------------------------------------------------- */}
        {!isLoading && (isNotFound || (!result && activeLookupId)) && (
          <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 text-center space-y-5">
            {/* Not Found Badge */}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-200 text-slate-700 inline-block mb-3">
                Not Found
              </span>
              <h3 className="text-2xl font-bold text-[#102A43]">
                Certificate Not Found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                The identifier <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{activeLookupId}</span> could not be found or has not been issued in the Eventora registry.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto text-left space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-blue-600">help</span>
                Possible Reasons:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Check for typos or extra spaces in the certificate ID.</li>
                <li>The organizer has not finalized certificate generation for the event.</li>
                <li>The QR code or link was modified or invalid.</li>
              </ul>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* STATE E: STANDALONE INTRO (NO ID LOOKED UP YET)           */}
        {/* -------------------------------------------------------- */}
        {!isLoading && !activeLookupId && (
          <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200">
              <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#102A43]">
                Verify an Eventora Credential
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                Scan the QR code printed on any Eventora certificate or enter the certificate code above to verify its authenticity and current status.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Eventora Global Credential Registry. Tamper-evident academic credential verification.
      </footer>
    </div>
  );
};
