import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  AlertCircle,
  VideoOff,
  Video,
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { Button } from '../../components/common/Button';

export function Scan() {
  const navigate = useNavigate();
  const { events: eventsList } = useEvents();

  // State for camera and scanning
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [targetFound, setTargetFound] = useState(false);
  const [detectedEventTitle, setDetectedEventTitle] = useState('');

  // State for sandbox simulator fallback
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // Sync active event for simulator
  useEffect(() => {
    if (eventsList.length > 0 && !selectedEventId) {
      const active = eventsList.find((e) => e.status === 'Active') || eventsList[0];
      setSelectedEventId(active.id);
    }
  }, [eventsList, selectedEventId]);

  const selectedEvent = eventsList.find((e) => e.id === selectedEventId) || eventsList[0] || {
    id: 'default',
    title: 'Loading Session...',
    venue: 'Campus Venue',
    location: { radius: 80 },
  };

  // Helper to extract eventId from decoded QR string
  const parseEventId = useCallback(
    (raw) => {
      if (!raw || typeof raw !== 'string') return null;
      const text = raw.trim();

      // 1. Full or relative URL parsing (e.g., /attendee/location?eventId=xyz or https://domain/attendee/location?eventId=xyz)
      try {
        const url = new URL(text, window.location.origin);
        const evId = url.searchParams.get('eventId');
        if (evId) return evId;
      } catch (_) {}

      // 2. Query param regex match
      const paramMatch = text.match(/[?&]eventId=([a-zA-Z0-9_-]+)/i);
      if (paramMatch && paramMatch[1]) return paramMatch[1];

      // 3. JSON payload (e.g. {"eventId": "abc"})
      try {
        const json = JSON.parse(text);
        if (json && json.eventId) return String(json.eventId);
      } catch (_) {}

      // 4. Exact match against known event ID or code
      const matched = eventsList.find((e) => e.id === text || e.code === text);
      if (matched) return matched.id;

      // 5. Direct UUID format
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) {
        return text;
      }

      return null;
    },
    [eventsList]
  );

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Handle successful QR detection
  const handleDetectedCode = useCallback(
    (extractedId) => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      const matchedEv = eventsList.find((e) => e.id === extractedId);
      setDetectedEventTitle(matchedEv?.title || 'Session QR Detected');
      setTargetFound(true);
      stopCamera();

      setTimeout(() => {
        navigate(`/attendee/location?eventId=${encodeURIComponent(extractedId)}`);
      }, 700);
    },
    [eventsList, navigate, stopCamera]
  );

  // Frame processing loop for QR decoding
  const processFrame = useCallback(() => {
    if (isNavigatingRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const { videoWidth, videoHeight } = video;
      if (videoWidth > 0 && videoHeight > 0) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
          const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const detectedId = parseEventId(code.data);
            if (detectedId) {
              handleDetectedCode(detectedId);
              return;
            }
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [parseEventId, handleDetectedCode]);

  // Start real browser camera
  const startCamera = useCallback(async () => {
    if (isNavigatingRef.current) return;
    setCameraLoading(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Please use the simulator below.');
      setCameraLoading(false);
      return;
    }

    try {
      stopCamera();

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (_) {
        // Fallback to any available video stream
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    } catch (err) {
      console.warn('Camera initialization failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can test with the simulator below.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please check device permissions.');
      }
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, [processFrame, stopCamera]);

  // Mount/unmount lifecycle for camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Development sandbox simulator
  const handleSimulateScan = () => {
    if (!selectedEvent?.id || selectedEvent.id === 'default') return;
    setIsSimulating(true);
    setTimeout(() => {
      setTargetFound(true);
      setTimeout(() => {
        navigate(`/attendee/location?eventId=${selectedEvent.id}`);
      }, 700);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden off-screen canvas for frame analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Container */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Step 1: Real Camera Scanner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Scan Lecture QR Code</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Point your device camera at the projection screen in your classroom to capture the session token.
          </p>
        </div>

        {/* Live Camera Viewport */}
        <div className="relative w-full aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-2xl flex flex-col items-center justify-center group">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Grid texture overlay if camera is off or loading */}
          {!cameraActive && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
          )}

          {/* Viewfinder Corner Brackets */}
          <div className="absolute inset-8 pointer-events-none z-10">
            {/* Top-Left */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl shadow-sm" />
            {/* Top-Right */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl shadow-sm" />
            {/* Bottom-Left */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl shadow-sm" />
            {/* Bottom-Right */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl shadow-sm" />

            {/* Laser Line */}
            {cameraActive && !targetFound && (
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#818CF8] animate-scan-laser" />
            )}
          </div>

          {/* Target Found Indicator / Status Overlay */}
          <div className="relative z-20 flex flex-col items-center gap-3 p-4 text-center">
            {targetFound ? (
              <div className="flex flex-col items-center animate-bounce bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-2">QR Token Acquired!</span>
                {detectedEventTitle && (
                  <span className="text-[11px] text-slate-300 max-w-[180px] truncate mt-0.5">
                    {detectedEventTitle}
                  </span>
                )}
              </div>
            ) : cameraLoading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                <span className="text-xs font-semibold text-indigo-300">Opening Camera...</span>
              </div>
            ) : cameraError ? (
              <div className="flex flex-col items-center gap-2 max-w-[220px]">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <VideoOff className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-rose-300 text-center leading-snug">
                  {cameraError}
                </span>
                <button
                  onClick={startCamera}
                  className="mt-1 px-3 py-1 bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Camera</span>
                </button>
              </div>
            ) : !cameraActive ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shadow-md">
                  <QrCode className="w-7 h-7 text-indigo-400" />
                </div>
                <button
                  onClick={startCamera}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Live indicator badge */}
          {cameraActive && !targetFound && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Camera Live</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-[11px] text-center text-slate-400">
          Hold the organizer's QR code steadily in front of the lens. The app will detect the session token automatically.
        </p>

        {/* Secondary Sandbox / Development Simulator */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Development Sandbox / Manual Testing</span>
            </span>
            <span className="text-[10px] text-slate-500">Secondary Option</span>
          </div>

          {/* Event Selector */}
          <div className="space-y-1.5">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.code}: {evt.title} ({evt.venue})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Session Info Card */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="text-white font-semibold truncate">{selectedEvent.title}</div>
              <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{selectedEvent.venue}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
              {selectedEvent.location?.radius || 80}m Geofence
            </span>
          </div>

          {/* Simulate Button */}
          <Button
            variant="outline"
            size="md"
            className="w-full text-xs font-bold border-white/20 hover:bg-white/10 text-white"
            loading={isSimulating}
            disabled={targetFound}
            onClick={handleSimulateScan}
            icon={ArrowRight}
            iconPosition="right"
          >
            {targetFound ? 'Redirecting...' : 'Simulate Scan & Verify GPS'}
          </Button>
        </div>
      </div>
    </div>
  );
}
