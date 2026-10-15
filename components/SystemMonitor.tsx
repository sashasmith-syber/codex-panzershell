
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Database, HardDrive, Zap } from 'lucide-react';
import { SystemStatus, Message } from '../types';

interface SystemMonitorProps {
  systemStatus: SystemStatus;
  messages: Message[];
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ systemStatus, messages }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate dummy historical metrics
    const data = Array.from({ length: 20 }, (_, i) => ({
      name: i.toString(),
      cpu: 10 + Math.random() * 40,
      memory: 30 + Math.random() * 20,
      anomaly: Math.random() * 0.2 + (systemStatus.anomalyScore * 0.8),
    }));
    setChartData(data);

    const interval = setInterval(() => {
      setChartData(prev => [
        ...prev.slice(1),
        { 
          name: Date.now().toString(), 
          cpu: 10 + Math.random() * 40, 
          memory: 30 + Math.random() * 20, 
          anomaly: Math.random() * 0.2 + (systemStatus.anomalyScore * 0.8) 
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [systemStatus.anomalyScore]);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center space-x-3">
             <Activity className="h-6 w-6 text-cyan-500" />
             <span>Subsystem Monitoring</span>
           </h2>
           <p className="text-xs text-gray-500 font-mono mt-1">Live telemetry from the Panzershell core</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Live Performance Charts */}
         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-2">
               <Zap className="h-4 w-4 text-yellow-500" />
               <span>CPU & Memory Load</span>
            </h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                    <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-2">
               <Activity className="h-4 w-4 text-red-500" />
               <span>Anomaly Delta</span>
            </h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                    />
                    <Line type="stepAfter" dataKey="anomaly" stroke="#ef4444" strokeWidth={2} dot={false} animationDuration={300} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Core Load', val: '24%', icon: Cpu, color: 'text-blue-400' },
           { label: 'IO Ops', val: '1.2k/s', icon: Database, color: 'text-green-400' },
           { label: 'Storage', val: '0.04%', icon: HardDrive, color: 'text-cyan-400' },
           { label: 'Temp Drift', val: systemStatus.temporalDrift ? `${(systemStatus.temporalDrift / 86400 / 365).toFixed(2)}y` : '0.00s', icon: Activity, color: systemStatus.temporalStatus === 'critical' ? 'text-red-400' : 'text-cyan-400' }
         ].map((stat, i) => (
           <div key={i} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center space-x-4">
              <div className={`p-2 rounded-lg bg-gray-900 ${stat.color}`}>
                 <stat.icon className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                 <p className="text-lg font-bold font-mono text-white leading-none">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Core Processing Logs</h3>
         <div className="space-y-2 font-mono text-[10px]">
            {messages.slice(-5).map((m, i) => (
               <div key={i} className="flex space-x-4 py-2 border-b border-gray-800/50 last:border-0">
                  <span className="text-cyan-500 shrink-0">[{new Date(m.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-gray-400 uppercase font-bold shrink-0">STATUS_OK:</span>
                  <span className="text-gray-500 truncate">{m.content}</span>
               </div>
            ))}
            {messages.length === 0 && <div className="text-gray-600 italic">Awaiting secure session traffic...</div>}
         </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
