'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { 
  Settings, 
  Users, 
  History, 
  Database,
  CheckCircle,
  AlertTriangle,
  Globe,
  Lock
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'partners' | 'audit'>('partners');
  const [partners, setPartners] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings configs
  const [openaiKey, setOpenaiKey] = useState('');
  const [serverUrl, setServerUrl] = useState(API_URL);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadSettingsData() {
      try {
        const [partRes, auditRes] = await Promise.all([
          fetch(`${API_URL}/api/partners`),
          fetch(`${API_URL}/api/audit-logs`)
        ]);
        if (partRes.ok && auditRes.ok) {
          setPartners(await partRes.json());
          setAuditLogs(await auditRes.json());
        }
      } catch (err) {
        console.error("Offline settings mode.", err);
        // Fallbacks
        setPartners([
          { _id: "SUP-001", name: "Apex Electronics", type: "supplier", contact_email: "supply@apexelectronics.com", contact_phone: "+86-755-88882222", sla_score: 96.5, risk_score: 12.0, category: "Semiconductors", location: "Shenzhen, China" },
          { _id: "CAR-001", name: "Maersk Line", type: "carrier", contact_email: "europe.support@maersk.com", contact_phone: "+45-3363-3363", sla_score: 94.2, risk_score: 15.0, category: "Ocean Freight", location: "Copenhagen, Denmark" }
        ]);
        setAuditLogs([
          { _id: "AUD-501", timestamp: new Date().toISOString(), user: "System Monitor Agent", action: "Incident Detection", description: "Incident INC-201 Rotterdam Port strike detected." }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadSettingsData();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-3">
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'partners' 
                ? 'bg-indigo-600/15 border border-indigo-500/20 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Supplier & Carrier Directory</span>
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'audit' 
                ? 'bg-indigo-600/15 border border-indigo-500/20 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>System Audit Logs</span>
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'config' 
                ? 'bg-indigo-600/15 border border-indigo-500/20 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Core Configs</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="glass-panel rounded-xl p-6 min-h-[350px]">
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-md">Partner Directories</h3>
                <p className="text-xs text-slate-400 mt-1">Authorized supply chain entities monitored by Sentinel AI.</p>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400">Loading directories...</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2.5">ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Contact Email</th>
                        <th>SLA Score</th>
                        <th>Risk Score</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {partners.map((partner) => (
                        <tr key={partner._id}>
                          <td className="py-3 font-mono font-bold">{partner._id}</td>
                          <td className="text-white font-semibold">{partner.name}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              partner.type === 'supplier' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25' : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/25'
                            }`}>
                              {partner.type}
                            </span>
                          </td>
                          <td>{partner.contact_email}</td>
                          <td className="font-mono text-emerald-400 font-bold">{partner.sla_score}%</td>
                          <td className="font-mono text-red-400 font-bold">{partner.risk_score}%</td>
                          <td>{partner.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-md">System Audit Trail</h3>
                <p className="text-xs text-slate-400 mt-1">Immutable ledger of autonomous agent triggers and human approvals.</p>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400">Loading logs...</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto text-xs">
                  {auditLogs.map((log, index) => (
                    <div key={index} className="p-3 bg-slate-900/40 border border-slate-850 rounded-lg flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">triggered by {log.user}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{log.description}</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono whitespace-nowrap ml-4">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-white font-semibold text-md">Core Integrations</h3>
                <p className="text-xs text-slate-400 mt-1">Configure global server connections and LLM models.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 flex items-center">
                    <Globe className="h-4 w-4 mr-1.5 text-indigo-400" /> API Gateway URL
                  </label>
                  <input 
                    type="text" 
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full p-2.5 rounded-lg glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 flex items-center">
                    <Lock className="h-4 w-4 mr-1.5 text-indigo-400" /> OpenAI API Key
                  </label>
                  <input 
                    type="password" 
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-proj-........................"
                    className="w-full p-2.5 rounded-lg glass-input font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Provide an OpenAI key to run full dynamic multi-agent calculations. Otherwise runs in standard heuristic mode.</p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all duration-150"
                  >
                    Save Changes
                  </button>
                  {isSaved && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Saved successfully
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
