'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Activity, 
  ArrowRight,
  User,
  ShieldCheck,
  Eye
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  useEffect(() => {
    async function fetchShipments() {
      try {
        const res = await fetch(`${API_URL}/api/shipments`);
        if (res.ok) {
          const data = await res.json();
          setShipments(data);
          if (data.length > 0) {
            setSelectedShipment(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load shipments from API.", err);
        // Fallback mock data
        const mock = [
          {
            _id: "SH-101", origin: "Shenzhen, China", destination: "Rotterdam, Netherlands",
            current_location: "Suez Canal", carrier: "Maersk Line", status: "Disrupted",
            cargo_value: 450000.0, sku_details: "Microchips, IoT Sensors",
            eta: new Date().toISOString(), original_eta: new Date().toISOString(),
            cost: 15200.0, carbon_emissions: 8.4, risk_score: 85.0,
            timeline: [
              { checkpoint: "Departed Origin Port", location: "Shenzhen", timestamp: new Date().toISOString(), status: "Completed" },
              { checkpoint: "Transit through Singapore", location: "Singapore Strait", timestamp: new Date().toISOString(), status: "Completed" },
              { checkpoint: "Arrival Rotterdam", location: "Rotterdam", timestamp: new Date().toISOString(), status: "Delayed" },
              { checkpoint: "Final Destination", location: "Munich, Germany", timestamp: new Date().toISOString(), status: "Pending" }
            ]
          },
          {
            _id: "SH-102", origin: "Shanghai, China", destination: "Long Beach, USA",
            current_location: "Pacific Ocean", carrier: "Ocean Network Express", status: "On Time",
            cargo_value: 820000.0, sku_details: "Automotive Electronic Sub-assemblies",
            eta: new Date().toISOString(), original_eta: new Date().toISOString(),
            cost: 21800.0, carbon_emissions: 12.2, risk_score: 10.0,
            timeline: [
              { checkpoint: "Departed Origin Port", location: "Shanghai", timestamp: new Date().toISOString(), status: "Completed" },
              { checkpoint: "Arrival Long Beach", location: "Long Beach", timestamp: new Date().toISOString(), status: "Pending" }
            ]
          }
        ];
        setShipments(mock);
        setSelectedShipment(mock[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchShipments();
  }, []);

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List Sidebar */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-white font-semibold text-md">Shipment Registry</h3>
            <p className="text-xs text-slate-400">Total active logistics operations.</p>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Syncing shipments...</p>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {shipments.map((sh) => (
                <div 
                  key={sh._id}
                  onClick={() => setSelectedShipment(sh)}
                  className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer text-xs ${
                    selectedShipment?._id === sh._id 
                      ? 'bg-indigo-600/10 border-indigo-500/30' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono font-bold text-white text-sm">{sh._id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sh.status === 'Disrupted' ? 'bg-red-600/15 text-red-400 border border-red-500/20' : 
                      sh.status === 'Delayed' ? 'bg-amber-600/15 text-amber-400 border border-amber-500/20' : 
                      'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {sh.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Carrier:</span>
                      <span className="text-white">{sh.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className="text-white font-semibold">${sh.cargo_value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Shipment View */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedShipment ? (
              <motion.div 
                key={selectedShipment._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel rounded-xl p-6 space-y-6"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono tracking-wider font-bold">SHIPMENT CONTROL</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{selectedShipment._id}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedShipment.sku_details}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Risk Mitigation Score</span>
                    <h3 className={`text-xl font-bold font-mono mt-1 ${
                      selectedShipment.risk_score > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>{selectedShipment.risk_score}%</h3>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-slate-400">Origin Port</span>
                    <p className="text-white font-medium">{selectedShipment.origin}</p>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-slate-400">Destination Port</span>
                    <p className="text-white font-medium">{selectedShipment.destination}</p>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-slate-400">Freight Cost</span>
                    <p className="text-white font-medium font-mono">${selectedShipment.cost?.toLocaleString() || '12,500'}</p>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-slate-400">Carbon Index</span>
                    <p className="text-emerald-400 font-medium font-mono">{selectedShipment.carbon_emissions} t CO2</p>
                  </div>
                </div>

                {/* Visual Shipment Timeline Checkpoints */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Milestone Timeline Tracking</h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                    {selectedShipment.timeline?.map((step: any, index: number) => (
                      <div key={index} className="relative text-xs">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 ${
                          step.status === 'Completed' ? 'bg-emerald-500 border-emerald-900' :
                          step.status === 'Delayed' ? 'bg-red-500 border-red-900 animate-pulse' :
                          'bg-slate-900 border-slate-800'
                        }`}></span>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-white">{step.checkpoint}</p>
                            <p className="text-slate-400 mt-0.5">{step.location}</p>
                          </div>
                          <div className="text-right text-slate-500">
                            <span>{new Date(step.timestamp).toLocaleDateString()}</span>
                            <span className={`block text-[10px] font-bold mt-1 ${
                              step.status === 'Completed' ? 'text-emerald-400' :
                              step.status === 'Delayed' ? 'text-red-400 font-mono' : 'text-slate-500'
                            }`}>{step.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-xs">
                Select a shipment card to inspect details.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
}
