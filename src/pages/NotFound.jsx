import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-xl">
        <MapPin className="w-8 h-8 animate-bounce" />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest uppercase text-indigo-400 mb-2">
        Error 404 • Out of Bounds
      </span>
      <h1 className="text-3xl font-extrabold text-white mb-2">Location Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The page or attendance session coordinates you are looking for do not exist or have been moved.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="md"
          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="gradient"
          size="md"
          icon={Home}
          onClick={() => navigate('/organizer/dashboard')}
        >
          Organizer Dashboard
        </Button>
      </div>
    </div>
  );
}
