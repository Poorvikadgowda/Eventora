import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, Database, ShieldCheck } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';

export const BackendStatusBadge = () => {
  const [status, setStatus] = useState({
    online: false,
    loading: true,
    details: null
  });
  const [modalOpen, setModalOpen] = useState(false);

  const verifyHealth = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await checkBackendHealth();
      setStatus({
        online: true,
        loading: false,
        details: data
      });
    } catch {
      setStatus({
        online: false,
        loading: false,
        details: null
      });
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title="View Backend API & Relational Database Connection Status"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          status.online
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-sm'
            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 shadow-sm'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${
            status.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <span className="hidden sm:inline">
          {status.online ? 'Live Backend API' : 'Standalone Mode'}
        </span>
        <span className="sm:hidden font-mono text-[10px]">
          {status.online ? 'API' : 'LOCAL'}
        </span>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    status.online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Backend Connection Status</h3>
                  <p className="text-xs text-slate-500">FastAPI + Relational SQLite Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  status.online
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                {status.online ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {status.online
                      ? 'Connected to FastAPI Backend Server'
                      : 'Running in Standalone Fallback Mode'}
                  </div>
                  <div className="text-[11px] mt-0.5 text-slate-600">
                    {status.online
                      ? 'Vision OCR, OpenCV preprocessing, and SQLite pharmacy stock queries are served live at http://localhost:8000.'
                      : 'FastAPI server at http://localhost:8000 is unreachable. Using verified local fallback datasets.'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Database className="w-3.5 h-3.5 text-teal-600" /> Database Engine
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">SQLite (genericswap.db)</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Server className="w-3.5 h-3.5 text-teal-600" /> API Gateway
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">http://localhost:8000</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Non-Diagnostic Guard
                  </span>
                  <span className="text-emerald-700 font-bold">ENFORCED</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={verifyHealth}
                disabled={status.loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
                Test Connection
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
