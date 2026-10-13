import React, { useState, useEffect, useRef } from 'react';
import { useEvent } from '../../store/EventContext';
import { soundFX } from '../../utils/audioFeedback';
import jsQR from 'jsqr';
import { 
  ScanLine, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search, 
  Zap, 
  Sparkles,
  Volume2,
  RefreshCw,
  MapPin
} from 'lucide-react';

export const LiveScanner = () => {
  const { sessions, attendees, checkInAttendee, event } = useEvent();

  const [selectedSessionId, setSelectedSessionId] = useState('S-101');
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  
  // Camera scanning state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastScannedToken = useRef('');
  const lastScanTimestamp = useRef(0);

  // Process a scanned / entered identifier
  const handleCheckInProcess = (identifier) => {
    if (!identifier || !identifier.trim()) return;
    const token = identifier.trim();

    // Prevent immediate re-triggering of the exact same code within 2 seconds
    const now = Date.now();
    if (token === lastScannedToken.current && now - lastScanTimestamp.current < 2000) {
      return;
    }
    lastScannedToken.current = token;
    lastScanTimestamp.current = now;

    const res = checkInAttendee(token, selectedSessionId);

    if (res.status === 'SUCCESS') {
      soundFX.playSuccess();
      setScanResult({
        type: 'SUCCESS',
        attendee: res.attendee,
        session: res.session,
        message: res.message
      });
      setRecentScans(prev => [{
        id: res.attendee.id,
        name: res.attendee.name,
        tier: res.attendee.tier,
        status: 'SUCCESS',
        time: new Date().toLocaleTimeString(),
        session: res.session.title
      }, ...prev.slice(0, 7)]);
    } else if (res.status === 'ALREADY_CHECKED_IN') {
      soundFX.playWarning();
      setScanResult({
        type: 'DUPLICATE',
        attendee: res.attendee,
        session: res.session,
        checkedInAt: res.checkedInAt,
        message: res.message
      });
      setRecentScans(prev => [{
        id: res.attendee.id,
        name: res.attendee.name,
        tier: res.attendee.tier,
        status: 'DUPLICATE',
        time: new Date().toLocaleTimeString(),
        session: res.session.title
      }, ...prev.slice(0, 7)]);
    } else {
      soundFX.playError();
      setScanResult({
        type: 'ERROR',
        attendee: null,
        session: null,
        message: res.message
      });
    }

    setManualInput('');
  };

  // Hardware Scanner / Keyboard Listener (e.g. USB handheld barcode readers)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Don't capture when typing inside the manual input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = ''; // timeout indicates manual typing or fresh barcode
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          handleCheckInProcess(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSessionId]);

  // Camera QR Scanner loop
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access not permitted or webcam not found. Use manual entry or test buttons below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraActive(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleCheckInProcess(code.data);
        }
      }
    }
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(tickScan);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider mb-1">
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span>High-Speed Contactless Gate Check-In</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Live QR Scanner & Gate Terminal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time duplicate check-in protection • Audio cues • Hardware scanner ready
          </p>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
          <MapPin className="w-4 h-4 text-emerald-400 ml-1.5" />
          <span className="text-slate-400 font-medium">Scan Gate:</span>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-transparent text-indigo-300 font-bold focus:outline-none cursor-pointer pr-2"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.id}: {s.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera Viewfinder & Manual Input */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scanner Viewport Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Webcam / Mobile Camera Feed</span>
              </span>

              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera Scanner</span>
                </button>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative w-full h-64 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Target Aiming Box Overlay */}
              {isCameraActive ? (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-52 border-2 border-dashed border-accent-cyan/80 rounded-2xl animate-pulse relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-cyan"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-cyan"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-cyan"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-cyan"></div>
                  </div>
                  <div className="absolute bottom-4 bg-slate-900/80 px-3 py-1 rounded-full text-[10px] text-cyan-300 border border-cyan-500/30">
                    Align attendee QR code inside frame
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Camera is idle. Click "Start Camera Scanner" or enter an Attendee ID / Token below.
                  </p>
                  {cameraError && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Manual Rapid Search / Barcode Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Manual Check-In or Handheld Barcode Input
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckInProcess(manualInput);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter Attendee ID (e.g. EVT-80921), Email, or Token..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {manualInput && (
                    <button
                      type="button"
                      onClick={() => setManualInput('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Check In</span>
                </button>
              </form>
            </div>

            {/* Quick 1-Click Test Scans */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">
                ⚡ 1-Click Verification Test Scenarios:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Scenario 1: Fresh Attendee (Not checked in yet) */}
                <button
                  type="button"
                  onClick={() => handleCheckInProcess("EVT-80925")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition-colors"
                >
                  Marcus Sterling (Fresh Check-in &rarr; Green)
                </button>

                {/* Scenario 2: Already Checked-in (Duplicate Alert) */}
                <button
                  type="button"
                  onClick={() => handleCheckInProcess("EVT-80921")}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition-colors"
                >
                  Alex Morgan (Duplicate &rarr; Amber Alert)
                </button>

                {/* Scenario 3: Fake/Invalid Token */}
                <button
                  type="button"
                  onClick={() => handleCheckInProcess("EVT-FAKE-9999")}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono transition-colors"
                >
                  Fake Pass (Invalid &rarr; Red Buzz)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Scan Result & Real-Time Log */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Scan Result Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Terminal Scan Feedback</span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </h3>

            {scanResult ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                {scanResult.type === 'SUCCESS' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 shadow-glow-emerald space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          Entry Verified & Granted
                        </div>
                        <h4 className="text-lg font-black text-white">
                          {scanResult.attendee.name}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Badge Tier:</span>
                        <span className="uppercase font-bold text-emerald-300">{scanResult.attendee.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Organization:</span>
                        <span className="text-slate-200 font-medium">{scanResult.attendee.organization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gate / Session:</span>
                        <span className="text-indigo-300">{scanResult.session.title.substring(0, 24)}...</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-200">
                      ⚡ Automated welcome SMS & floorplan triggered automatically.
                    </p>
                  </div>
                )}

                {scanResult.type === 'DUPLICATE' && (
                  <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 shadow-lg space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Duplicate Entry Alert
                        </div>
                        <h4 className="text-lg font-black text-white">
                          {scanResult.attendee.name}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/30 text-xs space-y-1 text-amber-200">
                      <p className="font-semibold text-amber-300">
                        Attendee was already checked in at {new Date(scanResult.checkedInAt).toLocaleTimeString()}.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Prevents pass reuse or badge-sharing fraud at security gates.
                      </p>
                    </div>
                  </div>
                )}

                {scanResult.type === 'ERROR' && (
                  <div className="p-5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                          Access Denied / Unrecognized Pass
                        </div>
                        <p className="text-xs text-rose-200 mt-0.5">{scanResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                Awaiting next attendee scan...
              </div>
            )}
          </div>

          {/* Recent Gate Scans Stream */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Terminal Activity Log
            </h4>
            {recentScans.length > 0 ? (
              <div className="space-y-2">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-200 truncate">{scan.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{scan.id} • {scan.tier.toUpperCase()}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        scan.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {scan.status === 'SUCCESS' ? 'VALID' : 'DUPLICATE'}
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{scan.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No scans recorded in this session yet.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
