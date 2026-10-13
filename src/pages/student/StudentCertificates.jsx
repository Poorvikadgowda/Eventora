import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import { CertificateViewerModal } from '../../components/event/CertificateViewerModal';
import { getMyCertificates } from '../../services/certificateService';

export const StudentCertificates = () => {
  const { currentUser } = useAuth();
  const { certificates: globalCerts } = useEvents();
  const { addToast } = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'excellence' | 'completion' | 'participation' | 'merit'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | '30days' | 'this_year'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Fetch real certificate records from Supabase for authenticated student
  useEffect(() => {
    let isMounted = true;

    async function loadCertificates() {
      setLoading(true);
      try {
        const studentId = currentUser?.id || 'usr_alex_01';
        const studentEmail = currentUser?.email || 'poorvikagowda030@gmail.com';
        const studentUsn = currentUser?.usn || '1DA22CS042';

        const myCerts = await getMyCertificates(studentId, studentEmail, studentUsn);
        if (isMounted) {
          // Merge with any globally loaded certificates that match this student
          const matchedGlobal = globalCerts.filter(
            (c) =>
              c.studentId === studentId ||
              c.recipientId === studentId ||
              c.recipientEmail?.toLowerCase() === studentEmail.toLowerCase() ||
              c.usn === studentUsn
          );

          // Deduplicate by certificateId
          const map = new Map();
          [...myCerts, ...matchedGlobal].forEach((c) => {
            if (c.certificateId) {
              map.set(c.certificateId.toUpperCase(), c);
            }
          });

          const combined = Array.from(map.values());
          setCertificates(combined);
        }
      } catch (err) {
        console.error('Error fetching student certificates:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCertificates();

    return () => {
      isMounted = false;
    };
  }, [currentUser, globalCerts]);

  // Filtered and Sorted Certificates
  const filteredCerts = useMemo(() => {
    let result = [...certificates];

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.eventName.toLowerCase().includes(q) ||
          c.certificateId.toLowerCase().includes(q) ||
          (c.issuer && c.issuer.toLowerCase().includes(q))
      );
    }

    // 2. Certificate Type Filter
    if (selectedType !== 'all') {
      result = result.filter((c) => {
        const type = (c.certificateType || c.certificate_type || '').toLowerCase();
        const award = (c.awardTitle || c.award_title || '').toLowerCase();
        if (selectedType === 'winner') return type === 'winner' || award.includes('place') || award.includes('winner');
        if (selectedType === 'achievement') return type === 'achievement' || award.includes('best') || award.includes('distinction');
        if (selectedType === 'participation') return type === 'participation';
        return type.includes(selectedType) || award.includes(selectedType);
      });
    }

    // 3. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter((c) => {
        const d = new Date(c.issueDate);
        if (isNaN(d.getTime())) return true;
        if (dateFilter === '30days') {
          return (now - d) / (1000 * 60 * 60 * 24) <= 30;
        }
        if (dateFilter === 'this_year') {
          return d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // 4. Sort By
    result.sort((a, b) => {
      const dateA = new Date(a.issueDate).getTime() || 0;
      const dateB = new Date(b.issueDate).getTime() || 0;
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [certificates, search, selectedType, dateFilter, sortBy]);

  // Quick Action Handlers
  const handleCopyVerifyLink = (certId) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    addToast('Public verification link copied to clipboard!', 'success');
  };

  const handleLinkedInShare = (cert) => {
    const text = encodeURIComponent(
      `Earned my verified credential for "${cert.eventName}" on Eventora! Verify authenticity: ${window.location.origin}/verify/${cert.certificateId}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${text}`, '_blank');
  };

  // Metrics
  const totalEarned = certificates.length;
  const verifiedCount = certificates.filter((c) => c.status !== 'Revoked').length;
  const latestCert = certificates[0];

  return (
    <div className="flex flex-col w-full space-y-6 pb-20 font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HERO & METRICS ROW                                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#102A43] text-teal-300">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Academic Credential Vault
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SHA-256 Authenticated
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#102A43] tracking-tight">
            My Earned Certificates
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
            All credentials awarded for verified dynamic QR check-in and active symposium engagement. Tamper-evident and instantly verifiable.
          </p>
        </div>

        {/* Live Metrics Counter Cards */}
        <div className="flex items-center gap-3">
          {/* Metric 1: Total Earned */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Earned
            </span>
            <span className="text-3xl font-black text-[#102A43]">{totalEarned}</span>
          </div>

          {/* Metric 2: Verified Active */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Verified
            </span>
            <span className="text-3xl font-black text-emerald-800">{verifiedCount}</span>
          </div>

          {/* Metric 3: Student Profile Pill */}
          <div className="hidden sm:flex bg-blue-50 border border-blue-200 p-4 rounded-2xl flex-col justify-center">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Holder
            </span>
            <span className="text-xs font-bold text-blue-950 truncate max-w-[140px]">
              {currentUser?.name || 'Poorvika Gowda'}
            </span>
            <span className="text-[10px] font-mono text-blue-600">
              {currentUser?.usn || '1DA22CS042'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH, MULTI-FILTER, & SORT CONTROLS BAR              */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex-1 max-w-lg">
          <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2.5">search</span>
          <input
            type="text"
            placeholder="Search by event name, certificate title, or verification ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 justify-start lg:justify-end">
          {/* Certificate Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'participation', label: 'Participation' },
              { id: 'winner', label: 'Winner' },
              { id: 'achievement', label: 'Achievement' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  selectedType === t.id
                    ? 'bg-white text-[#102A43] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Issue Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
          >
            <option value="all">All Dates</option>
            <option value="30days">Past 30 Days</option>
            <option value="this_year">This Year (2026)</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CERTIFICATES GRID OR EMPTY STATE                       */}
      {/* ======================================================== */}
      {loading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 h-80 space-y-4">
              <div className="h-6 bg-slate-100 rounded-lg w-1/3"></div>
              <div className="h-8 bg-slate-100 rounded-lg w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-100 rounded-xl w-full mt-6"></div>
            </div>
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        /* ======================================================== */
        /* HELPFUL EMPTY STATE                                      */
        /* ======================================================== */
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[44px]">workspace_premium</span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-[#102A43]">
              {search || selectedType !== 'all' ? 'No Matching Certificates' : 'No Certificates Earned Yet'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {search || selectedType !== 'all'
                ? 'Try adjusting your search terms or filters to find your credential.'
                : 'Certificates are automatically awarded when you attend campus events and check in using the Dynamic QR scanner. Register for upcoming events to start earning credentials.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {search || selectedType !== 'all' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedType('all');
                  setDateFilter('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Clear Search Filters
              </button>
            ) : (
              <Link
                to="/student/explore"
                className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Explore Upcoming Events</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* CERTIFICATE CARDS GRID                                   */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const isRevoked = cert.status === 'Revoked';
            const certType = cert.certificateType || cert.certificate_type || 'Excellence';

            return (
              <div
                key={cert.id || cert.certificateId}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isRevoked ? 'bg-red-500' : 'bg-gradient-to-r from-[#102A43] via-[#2563EB] to-[#0D9488]'
                  }`}
                ></div>

                <div>
                  {/* Top Bar: Verification ID & Type Pill */}
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {cert.certificateId}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Certificate Type Pill */}
                      {certType.toLowerCase() === 'winner' || cert.rank ? (
                        <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[13px] text-amber-600">military_tech</span>
                          {cert.rank ? `${cert.rank === 1 ? '1st' : cert.rank === 2 ? '2nd' : cert.rank === 3 ? '3rd' : `#${cert.rank}`} Place` : 'Winner'}
                        </span>
                      ) : certType.toLowerCase() === 'achievement' ? (
                        <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[13px] text-purple-600">award_star</span>
                          {cert.awardTitle || 'Achievement'}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-teal-600">school</span>
                          Participation
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isRevoked
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isRevoked ? 'cancel' : 'verified'}
                        </span>
                        {cert.status || 'Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Award Title Ribbon if Winner / Achievement */}
                  {(cert.awardTitle || cert.teamName) && (
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      {cert.awardTitle && (
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Honor: {cert.awardTitle}
                        </span>
                      )}
                      {cert.teamName && (
                        <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">groups</span>
                          Team: {cert.teamName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Event Title */}
                  <h3 className="text-lg font-bold text-[#102A43] group-hover:text-[#2563EB] transition-colors leading-snug mb-2 line-clamp-2">
                    {cert.eventName}
                  </h3>

                  {/* Description / Citation */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {cert.description || 'For verified participation and demonstrated excellence.'}
                  </p>

                  {/* Metadata Row */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Recipient:</span>
                      <strong className="text-slate-800 font-semibold">{cert.recipientName}</strong>
                    </div>
                    {cert.usn && (
                      <div className="flex justify-between items-center text-slate-500">
                        <span>USN:</span>
                        <span className="font-mono text-teal-700 font-bold">{cert.usn}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Issued:</span>
                      <span className="text-slate-700 font-medium">{cert.issueDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Signatory:</span>
                      <span className="text-slate-700 truncate max-w-[150px]">{cert.issuer}</span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 4 WORKING ACTION BUTTONS                                 */}
                {/* ======================================================== */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {/* Primary: View Certificate Modal */}
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#102A43] hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[17px] text-teal-300">visibility</span>
                    <span>View Certificate</span>
                  </button>

                  {/* Secondary Buttons Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Download PDF (Direct ReportLab landscape A4 download) */}
                    <a
                      href={`/api/certificates/download/${cert.certificateId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-blue-200"
                      title="Download authentic ReportLab landscape A4 PDF"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>PDF</span>
                    </a>

                    {/* 2. Verify Certificate (Public authenticity check) */}
                    <a
                      href={`/verify/${cert.certificateId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                      title="Open public verification page"
                    >
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>Verify</span>
                    </a>

                    {/* 3. Share / Copy Link */}
                    <button
                      onClick={() => handleCopyVerifyLink(cert.certificateId)}
                      className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 border border-slate-200"
                      title="Copy public verification link"
                    >
                      <span className="material-symbols-outlined text-[15px]">share</span>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. HIGH-RESOLUTION CERTIFICATE VIEWER MODAL              */}
      {/* ======================================================== */}
      <CertificateViewerModal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </div>
  );
};
