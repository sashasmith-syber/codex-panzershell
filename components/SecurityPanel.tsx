
import React from 'react';
import { Shield, AlertTriangle, XCircle, CheckCircle, Clock, Info, RefreshCw } from 'lucide-react';
import { SecurityEvent, Severity } from '../types';

interface SecurityPanelProps {
  events: SecurityEvent[];
  onResetAnomaly?: () => void;
}

const getSeverityStyles = (severity: Severity) => {
  switch (severity) {
    case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50', icon: XCircle };
    case 'high': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/50', icon: AlertTriangle };
    case 'medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/50', icon: Clock };
    case 'low': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/50', icon: CheckCircle };
  }
};

const SecurityPanel: React.FC<SecurityPanelProps> = ({ events, onResetAnomaly }) => {
  return (
    <div className="h-full flex flex-col p-4 sm:p-6 space-y-5 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight flex items-center space-x-2.5 sm:space-x-3">
             <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-500" />
             <span>Threat Containment Log</span>
           </h2>
           <p className="text-xs text-gray-400 font-mono mt-0.5">Real-time audit of neutralized injection vectors</p>
        </div>
        <div className="flex items-center space-x-2">
           {onResetAnomaly && (
             <button
               onClick={onResetAnomaly}
               className="flex items-center space-x-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 rounded-lg text-xs font-mono transition-colors shadow-sm"
               title="Purge Anomaly Buffer"
             >
               <RefreshCw className="h-3.5 w-3.5" />
               <span className="hidden sm:inline">Purge Buffer</span>
             </button>
           )}
           <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-[10px] font-bold uppercase text-gray-400 border border-gray-700 font-mono">
             Events: {events.length}
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <Shield className="h-16 w-16 mb-4" />
             <p className="font-mono text-sm uppercase tracking-widest">No Active Threat Signatures Detected</p>
          </div>
        ) : (
          events.map((event) => {
            const styles = getSeverityStyles(event.severity);
            const Icon = styles.icon;
            return (
              <div 
                key={event.id} 
                className={`p-5 rounded-2xl border ${styles.border} ${styles.bg} transition-all hover:scale-[1.01] duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                         <Icon className="h-5 w-5" />
                      </div>
                      <div>
                         <h4 className="font-bold text-white uppercase text-xs tracking-wider">{event.threatType}</h4>
                         <p className="text-[10px] text-gray-400 font-mono">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${styles.border} ${styles.text}`}>
                      {event.severity}
                   </span>
                </div>
                
                <div className="space-y-3">
                   <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-300 leading-relaxed"><span className="text-gray-500 font-bold uppercase mr-2">Vector:</span>{event.description}</p>
                   </div>
                   
                   <div className="flex items-center space-x-3 text-[10px]">
                      <div className="flex items-center space-x-1 text-green-400">
                         <CheckCircle className="h-3 w-3" />
                         <span className="font-bold uppercase tracking-wider">Status: Neutered</span>
                      </div>
                      <div className="h-1 w-1 bg-gray-700 rounded-full" />
                      <div className="text-gray-500 italic">Action: {event.actionTaken}</div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
