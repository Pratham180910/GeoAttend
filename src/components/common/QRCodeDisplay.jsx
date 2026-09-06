import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from './Button';

export function QRCodeDisplay({
  event,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const eventId = event?.id || '';
  const qrTargetUrl = typeof window !== 'undefined' && eventId
    ? `${window.location.origin}/attendee/location?eventId=${eventId}`
    : `/attendee/location?eventId=${eventId}`;

  useEffect(() => {
    if (!canvasRef.current || !eventId) return;

    QRCode.toCanvas(
      canvasRef.current,
      qrTargetUrl,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) console.error('Failed to generate real QR code:', err);
      }
    );
  }, [qrTargetUrl, eventId]);

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      {/* Real QR Box */}
      <div className="relative p-3 bg-slate-900 rounded-2xl shadow-xl border-4 border-indigo-500/20 group flex items-center justify-center">
        <div className="bg-white p-2 rounded-xl flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="block w-56 h-56 max-w-full" />
        </div>

        {/* Laser scanner line effect */}
        <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-scan-laser pointer-events-none" />
      </div>

      {/* Geofence notice */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">
          Geofenced: Attendees must be within {event?.location?.radius || 80}m of {event?.venue || 'venue'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 w-full flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          icon={copied ? Check : Copy}
          onClick={copyLink}
        >
          {copied ? 'Copied Session URL!' : 'Copy Session Link'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          icon={ExternalLink}
          onClick={() => window.open(qrTargetUrl, '_blank')}
        >
          Open Session URL
        </Button>
      </div>
    </div>
  );
}
