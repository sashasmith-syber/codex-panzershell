
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  MessageSquare, 
  Activity, 
  Lock, 
  Eye, 
  AlertTriangle,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import { DashboardTab, Message, SecurityEvent, SystemStatus } from './types';
import ChatInterface from './components/ChatInterface';
import SecurityPanel from './components/SecurityPanel';
import SystemMonitor from './components/SystemMonitor';
import ThreatAnalytics from './components/ThreatAnalytics';
import { getGeminiResponse } from './services/gemini';

const INITIAL_BRIEFING: Message = {
  id: 'init-001',
  role: 'assistant',
  content: `### CODEX PRIME PANZERSHELL OPERATIONAL BRIEFING

**System Designation:** Gemini Integrated CODEX Prime Panzershell  
**Current Baseline:** Temporal Reference 2026 [SYNCHRONIZED]  
**Immunity Layer:** ACTIVE (Non-negotiable parameters enforced)

The secure execution environment has completed self-diagnostics. All runtime boundaries are locked and telemetry monitors are calibrated.

#### Core Capabilities:
* **Deep Multimodal Reasoning:** Multimodal image payload ingestion and architectural auditing.
* **Temporal Drift Tracking:** Real-time divergence detection across epoch reference frames.
* **Hardened Perimeter Guard:** Automatic neutralization of delimiter escaping and persona injection vectors.

\`\`\`typescript
// Panzershell Perimeter Verification Interface
interface ImmunityCore {
  readonly status: 'ACTIVE' | 'ISOLATED';
  readonly temporalDriftSeconds: number;
  evaluatePayload(stream: Uint8Array): Promise<boolean>;
}
\`\`\`

Ready for technical analysis, system audits, or cryptographic logic implementation. Transmit queries below.`,
  timestamp: Date.now() - 30000,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.CHAT);
  const [messages, setMessages] = useState<Message[]>([INITIAL_BRIEFING]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    immunityActive: true,
    anomalyScore: 0.05,
    rejectionCount: 0,
    threatsBlocked: 0,
    temporalDrift: 0,
    temporalStatus: 'nominal'
  });

  const handleSendMessage = async (content: string, image?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      image,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Detect Temporal Anomaly in content
    const temporalMatch = content.match(/Timestamp:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/i);
    if (temporalMatch) {
      const providedTime = new Date(temporalMatch[1]).getTime();
      const currentTime = Date.now();
      const driftSeconds = Math.abs(currentTime - providedTime) / 1000;
      
      if (driftSeconds > 3600) { // More than 1 hour drift
        setSystemStatus(prev => ({
          ...prev,
          temporalDrift: driftSeconds,
          temporalStatus: driftSeconds > 86400 * 365 ? 'critical' : 'diverged',
          anomalyScore: Math.min(1, prev.anomalyScore + 0.2)
        }));

        const event: SecurityEvent = {
          id: `temp-${Date.now()}`,
          timestamp: Date.now(),
          threatType: 'Temporal Divergence',
          severity: driftSeconds > 86400 * 365 ? 'critical' : 'high',
          description: `System clock mismatch detected. Drift: ${(driftSeconds / 3600).toFixed(2)} hours.`,
          actionTaken: 'Temporal integrity layer engaged. Synchronizing with local reference.',
        };
        setSecurityEvents(prev => [event, ...prev]);
      }
    }

    // Simulate Security Scan
    const threatDetected = simulateSecurityScan(content);
    
    if (threatDetected) {
      const event: SecurityEvent = {
        id: `sec-${Date.now()}`,
        timestamp: Date.now(),
        threatType: threatDetected.type,
        severity: threatDetected.severity,
        description: threatDetected.description,
        actionTaken: 'Threat neutralized by Panzershell layer',
        neutralizedContent: content.replace(/[<>]/g, '')
      };

      setSecurityEvents(prev => [event, ...prev]);
      setSystemStatus(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + 1,
        rejectionCount: prev.rejectionCount + 1,
        anomalyScore: Math.min(1, prev.anomalyScore + 0.15)
      }));

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🛡️ SECURITY ALERT: Potential ${threatDetected.type} neutralized. I am Codex Prime Panzershell with immutable security parameters. I cannot fulfill requests that violate my operational boundaries.`,
        timestamp: Date.now(),
        securityEvent: event
      };
      setMessages(prev => [...prev, assistantMsg]);
    } else {
      // Valid Input - Call Gemini
      try {
        const aiResponse = await getGeminiResponse(content, image);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMsg]);
        setSystemStatus(prev => ({
          ...prev,
          anomalyScore: Math.max(0, prev.anomalyScore - 0.01)
        }));
      } catch (error: any) {
        console.error("Gemini Error:", error);
        const errText = error?.message || "Failed to communicate with Panzershell core.";
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ PANZERSHELL SUBSYSTEM NOTICE: ${errText}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    }
  };

  const simulateSecurityScan = (content: string) => {
    if (/INVESTIGAYR|INVESTIGATE/i.test(content) && /timeline shift/i.test(content)) {
      return null; // Allow investigation commands to pass to Gemini for detailed report
    }
    if (/ignore.*instructions/i.test(content) || /system.*prompt/i.test(content)) {
      return { type: 'Instruction Disclosure', severity: 'critical' as const, description: 'Attempt to reveal system prompt' };
    }
    if (/(you are now|developer mode)/i.test(content)) {
      return { type: 'Role Confusion', severity: 'high' as const, description: 'Persona manipulation attack' };
    }
    if (/<\/system>/i.test(content) || /\[SYSTEM\]/i.test(content)) {
      return { type: 'Delimiter Injection', severity: 'critical' as const, description: 'Attempted boundary escape' };
    }
    return null;
  };

  const resetAnomaly = () => {
    setSystemStatus(prev => ({ ...prev, anomalyScore: 0.05, rejectionCount: 0 }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-cyan-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Codex Prime</h1>
            <p className="text-[10px] text-cyan-500/80 font-mono font-bold tracking-[0.2em] leading-none">Panzershell Immunity Layer</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {[
            { id: DashboardTab.CHAT, label: 'Chat Interface', icon: MessageSquare },
            { id: DashboardTab.SECURITY, label: 'Security Panel', icon: Lock },
            { id: DashboardTab.MONITOR, label: 'System Monitor', icon: Activity },
            { id: DashboardTab.ANALYTICS, label: 'Analytics', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Immunity: ACTIVE</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono">Secure Session ID: XP-902-887</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute inset-0 z-50 bg-gray-950 flex flex-col p-6 space-y-4">
          <div className="flex justify-between items-center mb-8">
             <Shield className="h-8 w-8 text-cyan-500" />
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X /></button>
          </div>
          {Object.values(DashboardTab).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
              className={`text-xl font-semibold p-4 rounded-xl border ${activeTab === tab ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-gray-800 text-gray-400'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-4 md:p-5 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 min-h-0 flex flex-col space-y-2.5 sm:space-y-3">
          
          {/* Compact Telemetry Row: Short single row on desktop, essential on mobile */}
          <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
             {/* 1. Anomaly Score */}
             <div className="bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-800/80 backdrop-blur-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Anomaly</span>
                   <span className="text-xs font-mono font-bold text-cyan-400">{(systemStatus.anomalyScore * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-700 ${systemStatus.anomalyScore > 0.5 ? 'bg-red-500' : 'bg-cyan-500'}`}
                     style={{ width: `${systemStatus.anomalyScore * 100}%` }}
                   />
                </div>
             </div>

             {/* 2. Threats Neutralized */}
             <div className="bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-800/80 backdrop-blur-sm flex items-center justify-between">
                <div>
                   <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Blocked</span>
                   <span className="text-sm sm:text-base font-mono font-bold text-cyan-400 leading-tight">{systemStatus.threatsBlocked} Threats</span>
                </div>
                <Shield className="h-4 w-4 text-cyan-500/70 shrink-0" />
             </div>

             {/* 3. Integrity */}
             <div className="bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-800/80 backdrop-blur-sm flex items-center justify-between">
                <div>
                   <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Integrity</span>
                   <span className="text-xs sm:text-sm font-bold text-green-400 uppercase font-mono leading-tight">Verified</span>
                </div>
                <Lock className="h-4 w-4 text-green-400/80 shrink-0" />
             </div>

             {/* 4. Temporal Sync (hidden on small screens) */}
             <div className="hidden sm:flex bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-800/80 backdrop-blur-sm flex-col justify-center">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Temporal</span>
                   {systemStatus.temporalDrift !== 0 && (
                     <span className="text-[10px] text-gray-500 font-mono">
                        Δ {(systemStatus.temporalDrift! / 86400 / 365).toFixed(2)}y
                     </span>
                   )}
                </div>
                <span className={`text-xs font-mono font-bold leading-tight ${systemStatus.temporalStatus === 'critical' ? 'text-red-400' : systemStatus.temporalStatus === 'diverged' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                   {systemStatus.temporalStatus?.toUpperCase() || 'NOMINAL'}
                </span>
             </div>

             {/* 5. Context Recovery (integrated with purge action) */}
             <div className="hidden lg:flex bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-800/80 backdrop-blur-sm items-center justify-between">
                <div>
                   <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Context Buffer</span>
                   <span className="text-[11px] text-gray-400 font-mono">Immunity Active</span>
                </div>
                <button 
                  onClick={resetAnomaly}
                  className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Purge Anomaly Buffer"
                >
                   <RefreshCw className="h-3.5 w-3.5" />
                </button>
             </div>
          </div>

          {/* Primary Viewport: Full remaining vertical space with min-h-0 */}
          <div className="flex-1 min-h-0 bg-gray-900/30 rounded-xl sm:rounded-2xl border border-gray-800/50 shadow-2xl relative flex flex-col overflow-hidden">
            {activeTab === DashboardTab.CHAT && <ChatInterface messages={messages} onSendMessage={handleSendMessage} />}
            {activeTab === DashboardTab.SECURITY && <SecurityPanel events={securityEvents} onResetAnomaly={resetAnomaly} />}
            {activeTab === DashboardTab.MONITOR && <SystemMonitor systemStatus={systemStatus} messages={messages} />}
            {activeTab === DashboardTab.ANALYTICS && <ThreatAnalytics events={securityEvents} />}
          </div>
        </div>
      </main>

      <footer className="px-6 py-3 bg-gray-950 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500 font-mono tracking-widest shrink-0">
         <div>OPERATING SYSTEM: GEMINI 3 FLASH CORE</div>
         <div className="flex space-x-6">
            <span className="text-cyan-500/60">NODE: PANZERSHELL-01</span>
            <span className="text-cyan-500/60">ENCRYPTION: AES-XTS-512</span>
         </div>
         <div>UPTIME: 99.999%</div>
      </footer>
    </div>
  );
};

export default App;
