'use client';

import React, { useState } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  DollarSign, 
  Leaf, 
  Inbox, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SimulationPage() {
  const [query, setQuery] = useState('If I reroute via Singapore?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const presets = [
    "If I reroute via Singapore?",
    "What if we switch to Air Freight?",
    "If we redirect through Trieste Rail?",
    "What if we take no recovery action?"
  ];

  const handleSimulate = async (searchQuery: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok) {
        setResult(await res.json());
      }
    } catch (err) {
      console.error(err);
      // Fallback
      if (searchQuery.toLowerCase().includes('singapore')) {
        setResult({
          arrival_time: "July 15, 2026 (ETA +1 day, recovering 4 days delay)",
          freight_cost: "+$3,500 USD (Moderate freight surcharge)",
          carbon_emission: "-0.4 tons CO2 (optimized vessel route)",
          inventory_impact: "Safety stock buffer stabilized at 82% capacity",
          risk_score: "15% (Low risk of secondary custom congestion)",
          recommended_action: "Highly Recommended if Munich production can absorb a 24-hour delay. Standard ocean transfer is available."
        });
      } else {
        setResult({
          arrival_time: "July 18, 2026 (No recovery, full 7 days delay)",
          freight_cost: "+$0 USD (No surcharge)",
          carbon_emission: "+0.0 tons CO2",
          inventory_impact: "Critical line stoppage at assembly plant (0% buffer)",
          risk_score: "95% (Extreme SLA breach penalty risk)",
          recommended_action: "Not Recommended. Doing nothing leads to critical production shutdown and high customer penalties."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Panel */}
        <div className="glass-panel rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-white font-semibold text-md">What-If Route Simulator</h3>
            <p className="text-xs text-slate-400">Evaluate impact of diversion paths prior to execution.</p>
          </div>

          {/* Presets */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-medium">Scenario Presets</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setQuery(preset); handleSimulate(preset); }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-150 text-[11px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="space-y-1 text-xs">
              <label className="text-slate-400">Custom Scenario Query</label>
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask e.g. If I reroute via Rotterdam?"
                className="w-full p-3 rounded-lg glass-input text-xs"
              />
            </div>

            <button
              onClick={() => handleSimulate(query)}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Analyzing Path...' : 'Execute Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-xl p-6 space-y-6"
            >
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-white font-bold text-lg">Simulated Scenario Output</h3>
                <p className="text-xs text-indigo-400 mt-1">Simulating: &ldquo;{query}&rdquo;</p>
              </div>

              {/* Comparative Parameters Card list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Arrival Time</span>
                    <p className="text-white font-semibold mt-1">{result.arrival_time}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Freight Cost</span>
                    <p className="text-white font-semibold mt-1">{result.freight_cost}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <Leaf className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Carbon Emission</span>
                    <p className="text-white font-semibold mt-1">{result.carbon_emission}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <Inbox className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Inventory Impact</span>
                    <p className="text-white font-semibold mt-1">{result.inventory_impact}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <ShieldAlert className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Secondary Risk Index</span>
                    <p className="text-white font-semibold mt-1">{result.risk_score}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Recommended Action</span>
                    <p className="text-white font-semibold mt-1">{result.recommended_action}</p>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <HelpCircle className="h-10 w-10 text-indigo-500/60" />
              <p>Type or select a scenario query to run the What-If simulation engine.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
