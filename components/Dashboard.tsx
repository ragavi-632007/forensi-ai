import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CaseData, ActivityLog } from '../types';
import { MOCK_OFFICERS } from '../data';

interface DashboardProps {
  data: CaseData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Aggregate data for charts
  const appUsage = data.messages.reduce((acc, curr) => {
    acc[curr.app] = (acc[curr.app] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(appUsage).map(key => ({ name: key, value: appUsage[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const callActivity = [
    { name: 'Incoming', value: data.calls.filter(c => c.type === 'incoming').length },
    { name: 'Outgoing', value: data.calls.filter(c => c.type === 'outgoing').length },
    { name: 'Missed', value: data.calls.filter(c => c.type === 'missed').length },
  ];

  // Media Counts
  const mediaCounts = data.media.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, { image: 0, video: 0, audio: 0 } as Record<string, number>);

  const activityLog = data.activityLog || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in pb-10">
      {/* Overview Card */}
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg col-span-1 lg:col-span-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10 flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
             <span className="truncate">{data.name}</span>
             <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 font-mono whitespace-nowrap">ACTIVE CASE</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm break-words">Device: {data.device} | Owner: <span className="text-cyan-400">{data.owner}</span></p>
        </div>
        <div className="text-left sm:text-right relative z-10 shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Extraction Date</p>
          <p className="text-slate-200 font-mono text-sm">{new Date(data.extractionDate).toLocaleDateString()}</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Metrics */}
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center justify-center">
        <h3 className="text-slate-400 text-xs sm:text-sm uppercase mb-2">Total Messages</h3>
        <p className="text-3xl sm:text-4xl font-bold text-emerald-400">{data.messages.length}</p>
      </div>
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center justify-center">
        <h3 className="text-slate-400 text-xs sm:text-sm uppercase mb-2">Total Calls</h3>
        <p className="text-3xl sm:text-4xl font-bold text-blue-400">{data.calls.length}</p>
      </div>
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center justify-center">
        <h3 className="text-slate-400 text-xs sm:text-sm uppercase mb-2">Foreign Contacts</h3>
        <p className="text-3xl sm:text-4xl font-bold text-amber-400">2</p>
        <span className="text-xs text-amber-600/70 mt-1">Anomaly Detected</span>
      </div>
      
      {/* Active Team Widget */}
      <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 shadow-lg flex flex-col">
        <h3 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
           <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
           Assigned Team
        </h3>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
           {MOCK_OFFICERS.map(officer => (
             <div key={officer.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 transition-colors">
                <div className="relative">
                   <img src={officer.avatar} alt={officer.name} className="w-8 h-8 rounded-full bg-slate-700" />
                   <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-850 ${officer.online ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-200">{officer.name}</p>
                   <p className="text-[10px] text-slate-500">{officer.role}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 shadow-lg col-span-1 lg:col-span-2 h-[280px] sm:h-[320px] flex flex-col">
        <h3 className="text-slate-300 font-semibold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Case Activity Stream
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
           {activityLog.length === 0 ? (
             <p className="text-sm text-slate-500 text-center py-4">No recent activity recorded.</p>
           ) : (
             activityLog.map(log => (
               <div key={log.id} className="flex gap-3 text-sm">
                 <div className="min-w-[60px] text-xs text-slate-500 font-mono text-right pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </div>
                 <div className="w-2 relative">
                    <div className="absolute top-2 left-0.5 w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                    <div className="absolute top-4 left-[3.5px] w-px h-full bg-slate-700/50"></div>
                 </div>
                 <div className="pb-2">
                    <p className="text-slate-300">
                      <span className="font-semibold text-cyan-400">{log.userName}</span>
                      <span className="text-slate-400"> {log.action} </span>
                      <span className="text-slate-200 font-medium">"{log.target}"</span>
                    </p>
                    {log.type === 'flag' && <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 rounded mt-1 inline-block">Flagged</span>}
                 </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg col-span-1 lg:col-span-2 h-[280px] sm:h-[320px]">
        <h3 className="text-slate-300 font-semibold mb-4 text-sm sm:text-base">Communication Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={callActivity}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart (Restored) */}
      <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg col-span-1 lg:col-span-2 h-[280px] sm:h-[320px]">
        <h3 className="text-slate-300 font-semibold mb-4 text-sm sm:text-base">App Usage Analysis</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
       {/* Media Evidence Breakdown */}
       <div className="bg-slate-850 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg col-span-1 lg:col-span-4">
        <h3 className="text-slate-300 font-semibold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Extracted Media Evidence
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-indigo-900/30 text-indigo-400 rounded-lg">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <div>
               <p className="text-2xl font-bold text-white">{mediaCounts.image}</p>
               <p className="text-xs text-slate-400 uppercase font-semibold">Images Analyzed</p>
             </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-cyan-900/30 text-cyan-400 rounded-lg">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
             </div>
             <div>
               <p className="text-2xl font-bold text-white">{mediaCounts.video}</p>
               <p className="text-xs text-slate-400 uppercase font-semibold">Videos Extracted</p>
             </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-pink-900/30 text-pink-400 rounded-lg">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             </div>
             <div>
               <p className="text-2xl font-bold text-white">{mediaCounts.audio}</p>
               <p className="text-xs text-slate-400 uppercase font-semibold">Audio Clips</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;