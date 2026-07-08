'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  MapPin, 
  ArrowRight, 
  Users, 
  DollarSign, 
  Mail, 
  CheckSquare, 
  Play, 
  Award,
  PlusCircle,
  FileText
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New simulated incident inputs
  const [newTitle, setNewTitle] = useState('Rotterdam Terminal Congestion');
  const [newType, setNewType] = useState('Port Congestion');
  const [newSeverity, setNewSeverity] = useState('High');
  const [newLoc, setNewLoc] = useState('Rotterdam, Netherlands');
  const [newDesc, setNewDesc] = useState('Critical crane maintenance delays unloading by 4-5 days.');
  const [triggering, setTriggering] = useState(false);

  // Email draft edits
  const [customerEmail, setCustomerEmail] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [managerName, setManagerName] = useState('Sarah Jenkins (Director of Logistics)');

  async function loadData() {
    try {
      const [incRes, plansRes] = await Promise.all([
        fetch(`${API_URL}/api/incidents`),
        fetch(`${API_URL}/api/recovery-plans`)
      ]);
      if (incRes.ok && plansRes.ok) {
        const incData = await incRes.json();
        const plansData = await plansRes.json();
        setIncidents(incData);
        setPlans(plansData);
        
        if (incData.length > 0) {
          const firstInc = incData.find((i: any) => i.status === 'Active') || incData[0];
          setSelectedIncident(firstInc);
          const relatedPlan = plansData.find((p: any) => p.incident_id === firstInc._id);
          setActivePlan(relatedPlan || null);
          if (relatedPlan) {
            setCustomerEmail(relatedPlan.customer_email_draft || '');
            setSupplierEmail(relatedPlan.supplier_email_draft || '');
          }
        }
      }
    } catch (err) {
      console.error("API error loading incidents, using mock fallbacks.", err);
      // Fallback mocks
      const mockInc = [
        {
          _id: "INC-201", title: "Rotterdam Port Strike", type: "Strike",
          severity: "Critical", status: "Active", impact_score: 85,
          location: "Rotterdam, Netherlands", description: "Union labor strike halting terminal unloading.",
          affected_shipment_ids: ["SH-101", "SH-104"], date_detected: new Date().toISOString()
        }
      ];
      const mockPlan = [
        {
          _id: "REC-301", shipment_id: "SH-101", incident_id: "INC-201",
          original_route: "Shenzhen -> Rotterdam -> Munich",
          proposed_route: "Shenzhen -> Trieste Port -> Rail to Munich",
          cost_diff: 4800, time_diff_hours: -48, emission_diff: -0.6,
          status: "Draft",
          steps: [
            { step_number: 1, title: "Reroute Ship to Trieste", description: "Divert container to Italy", assigned_to: "Maersk", status: "Pending" },
            { step_number: 2, title: "Book Rail Freight", description: "Secure rail slot", assigned_to: "Procurement Agent", status: "Pending" },
            { step_number: 3, title: "Prepare Customs Docs", description: "Customs pre-alert", assigned_to: "Customs Clerk", status: "Pending" }
          ],
          customer_email_draft: "Subject: Sentinel AI Shipment Update - SH-101 Rerouting\n\nDear Customer, we are diverting SH-101 via Trieste to avoid Rotterdam strike delays.",
          supplier_email_draft: "Subject: Expedite Request: Invoice Documents - SH-101\n\nDear Supplier, please expedite docs to support Trieste customs entry."
        }
      ];
      setIncidents(mockInc);
      setPlans(mockPlan);
      setSelectedIncident(mockInc[0]);
      setActivePlan(mockPlan[0]);
      setCustomerEmail(mockPlan[0].customer_email_draft);
      setSupplierEmail(mockPlan[0].supplier_email_draft);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectIncident = (inc: any) => {
    setSelectedIncident(inc);
    const relatedPlan = plans.find(p => p.incident_id === inc._id);
    setActivePlan(relatedPlan || null);
    if (relatedPlan) {
      setCustomerEmail(relatedPlan.customer_email_draft || '');
      setSupplierEmail(relatedPlan.supplier_email_draft || '');
    } else {
      setCustomerEmail('');
      setSupplierEmail('');
    }
  };

  const handleSimulateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);
    try {
      const res = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          severity: newSeverity,
          description: newDesc,
          location: newLoc
        })
      });
      if (res.ok) {
        await loadData();
        // Reset form
        setNewTitle('Suez Canal Congestion Event');
        setNewDesc('Container pile-up causing standard canal delay.');
      }
    } catch (err) {
      alert("Error triggering simulated incident: " + err);
    } finally {
      setTriggering(false);
    }
  };

  const handleApprove = async () => {
    if (!activePlan) return;
    try {
      const res = await fetch(`${API_URL}/api/recovery-plans/${activePlan._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_name: managerName })
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local status
        setActivePlan(updated);
        // Refresh full plan registry
        const refreshedPlansRes = await fetch(`${API_URL}/api/recovery-plans`);
        if (refreshedPlansRes.ok) {
          setPlans(await refreshedPlansRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecute = async () => {
    if (!activePlan) return;
    try {
      const res = await fetch(`${API_URL}/api/recovery-plans/${activePlan._id}/execute`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setActivePlan(updated);
        // Refresh plans & incident logs
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Feed & Generator Panel */}
        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Disruption Incidents</h3>
            
            {loading ? (
              <p className="text-xs text-slate-400">Loading feed...</p>
            ) : (
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div 
                    key={inc._id}
                    onClick={() => selectIncident(inc)}
                    className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer text-xs space-y-1.5 ${
                      selectedIncident?._id === inc._id 
                        ? 'bg-indigo-600/10 border-indigo-500/30' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{inc.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        inc.status === 'Active' ? 'bg-red-500/15 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>{inc.status}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{inc.description}</p>
                    <div className="flex justify-between text-[10px] text-indigo-400 font-mono">
                      <span>{inc.location}</span>
                      <span>Impact: {inc.impact_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trigger Simulation Incident */}
          <div className="glass-panel rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm flex items-center space-x-2">
              <PlusCircle className="h-4 w-4 text-indigo-400" />
              <span>Simulate Local Incident</span>
            </h3>
            
            <form onSubmit={handleSimulateIncident} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Incident Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input text-xs" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">Disruption Type</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    <option value="Weather">Weather</option>
                    <option value="Port Congestion">Port Congestion</option>
                    <option value="Strike">Strike</option>
                    <option value="Customs">Customs</option>
                    <option value="Geopolitical">Geopolitical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Severity</label>
                  <select 
                    value={newSeverity} 
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Location</label>
                <input 
                  type="text" 
                  value={newLoc} 
                  onChange={(e) => setNewLoc(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input text-xs" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input text-xs h-16" 
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={triggering}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-lg text-xs transition-all duration-150"
              >
                {triggering ? 'Triggering...' : 'Trigger Recovery Pipeline'}
              </button>
            </form>
          </div>
        </div>

        {/* Recovery Pipeline Flow */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              <motion.div 
                key={selectedIncident._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Active Recovery Flow Pipeline */}
                <div className="glass-panel rounded-xl p-6 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest uppercase">Autonomous Agent Recovery Action</span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedIncident.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedIncident.description}</p>
                  </div>

                  {activePlan ? (
                    <div className="space-y-6">
                      {/* Step Timeline Graph */}
                      <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Orchestration Steps</h4>
                        <div className="grid grid-cols-4 gap-2 relative">
                          <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-800 -z-10"></div>
                          
                          <div className="text-center">
                            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto text-xs font-bold font-mono">1</span>
                            <p className="text-[10px] text-white font-semibold mt-2">Detected</p>
                          </div>
                          
                          <div className="text-center">
                            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto text-xs font-bold font-mono">2</span>
                            <p className="text-[10px] text-white font-semibold mt-2">Analyzed</p>
                          </div>
                          
                          <div className="text-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold font-mono ${
                              activePlan.status === 'Draft' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-emerald-500 text-slate-950'
                            }`}>3</span>
                            <p className="text-[10px] text-white font-semibold mt-2">Approve</p>
                          </div>

                          <div className="text-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold font-mono ${
                              activePlan.status === 'Executed' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-850 text-slate-500'
                            }`}>4</span>
                            <p className="text-[10px] text-white font-semibold mt-2">Execute</p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Impact Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-lg text-xs space-y-1">
                          <span className="text-red-400">Reroute Cost Difference</span>
                          <p className="text-white font-bold text-lg font-mono">+${activePlan.cost_diff.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded-lg text-xs space-y-1">
                          <span className="text-emerald-400">Transit Recovery time</span>
                          <p className="text-white font-bold text-lg font-mono">-{Math.abs(activePlan.time_diff_hours)} Hours</p>
                        </div>
                      </div>

                      {/* Communications drafts (Editable) */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Stakeholder Communications</h4>
                        
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-mono flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1" /> Customer Email Draft
                          </label>
                          <textarea 
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-[11px] h-28 font-mono leading-relaxed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-mono flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1" /> Supplier Email Draft
                          </label>
                          <textarea 
                            value={supplierEmail}
                            onChange={(e) => setSupplierEmail(e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-[11px] h-28 font-mono leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Decision Control Dashboard */}
                      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg space-y-4 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-slate-400">Plan Status</span>
                            <p className="text-white font-semibold">{activePlan.status}</p>
                          </div>
                          {activePlan.status === 'Approved' && (
                            <div className="text-right space-y-1">
                              <span className="text-slate-400">Authorized by</span>
                              <p className="text-emerald-400 font-semibold">{activePlan.approved_by}</p>
                            </div>
                          )}
                        </div>

                        {activePlan.status === 'Draft' && (
                          <div className="flex items-center space-x-3 pt-2">
                            <input 
                              type="text" 
                              value={managerName} 
                              onChange={(e) => setManagerName(e.target.value)}
                              className="flex-1 p-2.5 rounded-lg glass-input text-xs" 
                            />
                            <button 
                              onClick={handleApprove}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all duration-150 flex items-center space-x-1.5"
                            >
                              <CheckSquare className="h-4 w-4" />
                              <span>Authorize Plan</span>
                            </button>
                          </div>
                        )}

                        {activePlan.status === 'Approved' && (
                          <button 
                            onClick={handleExecute}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all duration-150 flex items-center justify-center space-x-2 border border-emerald-500/40 shadow-lg glow-emerald"
                          >
                            <Play className="h-4 w-4" />
                            <span>Orchestrate Live Recovery Workflow</span>
                          </button>
                        )}

                        {activePlan.status === 'Executed' && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg flex items-center space-x-2">
                            <Award className="h-5 w-5" />
                            <span>Workflow Executed. Recovery signals running at 100% success monitoring.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Scanning shipment delays... No alternate recovery plans drafted yet.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-xs">
                Select an incident card to view recovery details.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </DashboardShell>
  );
}
