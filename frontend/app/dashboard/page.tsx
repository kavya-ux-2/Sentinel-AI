'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

// API URL (configurable)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function Dashboard() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [shRes, incRes] = await Promise.all([
          fetch(`${API_URL}/api/shipments`),
          fetch(`${API_URL}/api/incidents`)
        ]);
        if (shRes.ok && incRes.ok) {
          const shData = await shRes.json();
          const incData = await incRes.json();
          setShipments(shData);
          setIncidents(incData);
        }
      } catch (err) {
        console.error("Failed to connect to backend, running with fallback mock data.", err);
        // Fallback mock data in case local server isn't running yet
        setShipments([
          { _id: "SH-101", origin: "Shenzhen, China", destination: "Rotterdam, Netherlands", carrier: "Maersk", status: "Disrupted", cargo_value: 450000, risk_score: 85, eta: new Date().toISOString() },
          { _id: "SH-102", origin: "Shanghai, China", destination: "Long Beach, USA", carrier: "ONE", status: "On Time", cargo_value: 820000, risk_score: 10, eta: new Date().toISOString() },
          { _id: "SH-104", origin: "Hanoi, Vietnam", destination: "Hamburg, Germany", carrier: "MSC", status: "Disrupted", cargo_value: 310000, risk_score: 75, eta: new Date().toISOString() }
        ]);
        setIncidents([
          { _id: "INC-201", title: "Rotterdam Port Strike", type: "Strike", severity: "Critical", status: "Active", location: "Rotterdam, Netherlands", date_detected: new Date().toISOString(), impact_score: 85 }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Risk ports for Heatmap
  const ports = [
    { name: "Rotterdam Port", x: 260, y: 150, risk: "Critical", score: 85, color: "bg-red-500", glow: "glow-danger" },
    { name: "Shenzhen Port", x: 620, y: 310, risk: "Low", score: 12, color: "bg-emerald-500", glow: "glow-emerald" },
    { name: "Shanghai Port", x: 640, y: 280, risk: "Low", score: 10, color: "bg-emerald-500", glow: "glow-emerald" },
    { name: "Long Beach Port", x: 80, y: 200, risk: "Low", score: 15, color: "bg-emerald-500", glow: "glow-emerald" },
    { name: "Singapore Hub", x: 590, y: 360, risk: "Medium", score: 38, color: "bg-amber-500", glow: "glow-amber" }
  ];

  const disruptedCount = shipments.filter(s => s.status === 'Disrupted').length;

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">SLA Adherence</p>
            <h3 className="text-2xl font-bold text-white">95.4%</h3>
            <span className="text-[10px] text-emerald-400 flex items-center font-mono">
              <TrendingUp className="h-3 w-3 mr-1" /> +0.8% MoM
            </span>
          </div>
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 rounded-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Disrupted Cargo Value</p>
            <h3 className="text-2xl font-bold text-white">
              ${((shipments.filter(s => s.status === 'Disrupted').reduce((acc, curr) => acc + curr.cargo_value, 0)) / 1000).toFixed(0)}k
            </h3>
            <span className="text-[10px] text-red-400 font-mono">
              {disruptedCount} Shipments Affected
            </span>
          </div>
          <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 rounded-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Active Recovery Savings</p>
            <h3 className="text-2xl font-bold text-white">$13,200</h3>
            <span className="text-[10px] text-indigo-400 font-mono">
              Net savings compared to delays
            </span>
          </div>
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 rounded-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Mean Time to Recover</p>
            <h3 className="text-2xl font-bold text-white">4.8 Hours</h3>
            <span className="text-[10px] text-indigo-400 flex items-center font-mono">
              98% Agent Decision Confidence
            </span>
          </div>
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-white font-semibold text-md mb-1">Global Incident Heatmap</h3>
            <p className="text-xs text-slate-400">Hover over active port nodes to scan real-time risk index levels.</p>
          </div>

          {/* SVG World Map */}
          <div className="relative w-full h-[280px] mt-4 rounded-lg bg-slate-950/40 border border-slate-900 flex items-center justify-center">
            {/* Dynamic Grid Overlay */}
            <div className="absolute inset-0 grid-bg opacity-30"></div>
            
            {/* SVG outline representing raw stylized world vectors */}
            <svg className="w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 450">
              <path fill="currentColor" className="text-indigo-400" d="M150,150 L200,120 L250,130 L280,180 L350,150 L380,220 L400,280 L420,290 L480,260 L520,310 L580,280 L620,320 L680,270 L720,220 L750,250 L770,280 L750,320 L700,350 L650,380 L600,340 L550,380 L500,350 L450,370 L400,340 L350,320 L300,360 L250,330 L200,350 L150,280 Z" />
            </svg>

            {/* Ports Nodes */}
            {ports.map((port) => (
              <div 
                key={port.name}
                className="absolute cursor-pointer group"
                style={{ left: `${port.x}px`, top: `${port.y}px` }}
                onMouseEnter={() => setHoveredPort(port.name)}
                onMouseLeave={() => setHoveredPort(null)}
              >
                <span className="relative flex h-4 w-4">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${port.color}`}></span>
                  <span className={`relative inline-flex rounded-full h-4 w-4 border border-white/20 shadow-md ${port.color}`}></span>
                </span>

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {(hoveredPort === port.name || true) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: hoveredPort === port.name ? 1 : 0 }}
                      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-48 p-3 bg-slate-900/95 border border-slate-800 rounded-lg text-xs pointer-events-none z-50 shadow-xl"
                    >
                      <p className="font-semibold text-white">{port.name}</p>
                      <div className="flex justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">Risk Severity:</span>
                        <span className={port.risk === 'Critical' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{port.risk} ({port.score}%)</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents feed */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-md">Active Incidents</h3>
              <Link href="/incidents">
                <span className="text-xs text-indigo-400 hover:underline flex items-center cursor-pointer">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </Link>
            </div>
            
            {loading ? (
              <p className="text-xs text-slate-400">Loading active disruptions...</p>
            ) : incidents.length === 0 ? (
              <p className="text-xs text-slate-400">All routes cleared. No active disruptions.</p>
            ) : (
              <div className="space-y-4">
                {incidents.map((inc) => (
                  <div key={inc._id} className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{inc.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        inc.severity === 'Critical' ? 'bg-red-600/15 border border-red-500/30 text-red-400' : 'bg-amber-600/15 border border-amber-500/30 text-amber-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{inc.description}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-indigo-400 font-mono">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{inc.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-800/60 pt-4 mt-4">
            <Link href="/incidents">
              <button className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 font-semibold rounded-lg text-xs transition-all duration-150">
                Generate Simulated Incident
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Disrupted Shipments list */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-white font-semibold text-md mb-4">Critical Action Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5">Shipment ID</th>
                <th>Origin / Destination</th>
                <th>Cargo / Value</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">Loading logistics registry...</td>
                </tr>
              ) : shipments.filter(s => s.status === 'Disrupted').map((sh) => (
                <tr key={sh._id} className="text-slate-300">
                  <td className="py-3.5 font-mono text-white font-bold">{sh._id}</td>
                  <td>
                    <div>{sh.origin}</div>
                    <div className="text-[10px] text-slate-500">to {sh.destination}</div>
                  </td>
                  <td>
                    <div>{sh.sku_details || 'Cargo Item'}</div>
                    <div className="text-[10px] text-slate-500">${sh.cargo_value.toLocaleString()} USD</div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      <span className="font-mono font-bold text-red-400">{sh.risk_score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-600/10 border border-red-500/20 text-red-400">
                      Disrupted
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href={`/incidents`}>
                      <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-all duration-150">
                        View Recovery Plan
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
