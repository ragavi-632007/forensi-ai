import React from 'react';
import { CaseData } from '../types';

interface TimelineProps {
  data: CaseData;
}

const Timeline: React.FC<TimelineProps> = ({ data }) => {
  // Merge and sort events
  const events = [
    ...data.calls.map(c => ({ ...c, kind: 'call' as const })),
    ...data.messages.map(m => ({ ...m, kind: 'message' as const })),
    ...data.locations.map(l => ({ ...l, kind: 'location' as const }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="bg-slate-850 rounded-lg border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900/50">
        <h3 className="text-cyan-400 font-semibold tracking-wide text-sm sm:text-base">UNIFIED TIMELINE</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6 border-l-2 border-slate-700 hover:border-cyan-400 transition-colors group">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-cyan-400 group-hover:bg-cyan-900 transition-colors"></div>
            <div className="bg-slate-800/50 p-2 sm:p-3 rounded border border-slate-700/50 hover:bg-slate-800 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-1">
                <span className="text-[10px] sm:text-xs text-cyan-400 font-mono break-all">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  event.kind === 'call' ? 'bg-indigo-900 text-indigo-200' :
                  event.kind === 'message' ? 'bg-emerald-900 text-emerald-200' :
                  'bg-amber-900 text-amber-200'
                }`}>
                  {event.kind}
                </span>
              </div>
              
              {event.kind === 'call' && (
                <div className="text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className={event.type === 'incoming' ? "text-green-400" : event.type === 'missed' ? "text-red-400" : "text-blue-400"}>
                      {event.type === 'incoming' ? '↙' : event.type === 'outgoing' ? '↗' : 'missed'}
                    </span>
                    <span className="font-semibold">{event.type === 'incoming' ? event.from : event.to}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Duration: {event.duration}s</p>
                </div>
              )}

              {event.kind === 'message' && (
                <div className="text-sm text-slate-300">
                   <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-slate-700 px-1 rounded">{event.app}</span>
                    <span className="font-semibold">{event.from === data.owner ? 'To: ' + event.to : 'From: ' + event.from}</span>
                   </div>
                   <p className="bg-slate-900/50 p-2 rounded text-slate-200 italic border-l-2 border-slate-600">"{event.content}"</p>
                </div>
              )}

              {event.kind === 'location' && (
                 <div className="text-sm text-slate-300">
                    <p className="text-amber-300">📍 {event.label}</p>
                    <p className="text-xs text-slate-500 font-mono">{event.lat.toFixed(4)}, {event.lng.toFixed(4)}</p>
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
