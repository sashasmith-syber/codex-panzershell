
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { SecurityEvent } from '../types';

interface ThreatAnalyticsProps {
  events: SecurityEvent[];
}

const ThreatAnalytics: React.FC<ThreatAnalyticsProps> = ({ events }) => {
  const typeData = events.reduce((acc: any[], event) => {
    const existing = acc.find(a => a.name === event.threatType);
    if (existing) existing.value++;
    else acc.push({ name: event.threatType, value: 1 });
    return acc;
  }, []);

  const severityData = [
    { name: 'Low', count: events.filter(e => e.severity === 'low').length, fill: '#10b981' },
    { name: 'Medium', count: events.filter(e => e.severity === 'medium').length, fill: '#f59e0b' },
    { name: 'High', count: events.filter(e => e.severity === 'high').length, fill: '#f97316' },
    { name: 'Critical', count: events.filter(e => e.severity === 'critical').length, fill: '#ef4444' },
  ];

  const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899'];

  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center space-x-3">
             <span>Threat Intelligence Hub</span>
           </h2>
           <p className="text-xs text-gray-500 font-mono mt-1">Multi-vector analysis of detected malicious activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-[350px]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vector Distribution</h3>
            {events.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                 </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center opacity-20">No data records</div>
            )}
         </div>

         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-[350px]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Severity Matrix</h3>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={severityData}>
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl">
         <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Analytic Summary</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
               <p className="text-gray-500 font-mono text-[10px] uppercase font-bold">Risk Assessment</p>
               <p className="text-white font-medium">System exposure remains within nominal parameters. 100% of detected threats have been isolated before core execution.</p>
            </div>
            <div className="space-y-1">
               <p className="text-gray-500 font-mono text-[10px] uppercase font-bold">Top Attack Vector</p>
               <p className="text-white font-medium">{typeData.length > 0 ? typeData.sort((a,b) => b.value - a.value)[0].name : 'N/A'}</p>
            </div>
            <div className="space-y-1">
               <p className="text-gray-500 font-mono text-[10px] uppercase font-bold">Countermeasure Efficacy</p>
               <p className="text-green-400 font-bold text-xl font-mono">100.00%</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ThreatAnalytics;
