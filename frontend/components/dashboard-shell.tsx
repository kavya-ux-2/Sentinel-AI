'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Shuffle, 
  MessageSquare, 
  Settings, 
  SlidersHorizontal,
  Bell,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  Truck
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: SidebarProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipment Operations', path: '/shipments', icon: Truck },
    { name: 'Incident Center', path: '/incidents', icon: ShieldAlert },
    { name: 'What-If Simulation', path: '/simulation', icon: SlidersHorizontal },
    { name: 'Sentinel AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#07080d] text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-slate-800/60 p-5 flex flex-col justify-between hidden md:flex z-20">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/40 glow-indigo">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">Sentinel AI</h1>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest">AUTONOMOUS RECOVERY</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600/15 border border-indigo-500/20 text-white font-medium shadow-md shadow-indigo-500/5' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Health / Demo User info */}
        <div className="space-y-4">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">Sentinel Core Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Autonomous monitoring running via LLM Agents.</p>
          </div>

          <div className="flex items-center space-x-3 border-t border-slate-800/80 pt-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold shadow-inner">
              DU
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Demo Administrator</p>
              <p className="text-xs text-indigo-400">demo@sentinel.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-slate-800/60 px-6 flex items-center justify-between z-10">
          <div>
            {/* Contextual Title */}
            <h2 className="text-white font-semibold text-lg">
              {menuItems.find(item => pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path)))?.name || 'Operations Control'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick stats banner */}
            <div className="hidden lg:flex items-center space-x-4 text-xs font-mono mr-4">
              <div className="bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-md flex items-center space-x-2">
                <span className="text-slate-400">SLA:</span>
                <span className="text-emerald-400 font-bold">95.4%</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-md flex items-center space-x-2">
                <span className="text-slate-400">Active Incidents:</span>
                <span className="text-red-400 font-bold">1</span>
              </div>
              <div className="bg-indigo-950/20 border border-indigo-900/40 px-3 py-1.5 rounded-md flex items-center space-x-2">
                <span className="text-indigo-300">Recovery Confidence:</span>
                <span className="text-indigo-400 font-bold">98%</span>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-150 text-slate-400"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-[#07080d] glow-indigo animate-pulse"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 glass-panel border border-slate-800 shadow-2xl rounded-xl p-4 z-50"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-sm font-semibold text-white">Active Sentinel Alerts</span>
                      <span className="text-xs text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex space-x-3">
                        <Activity className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-white font-medium">Incident Detected: Port Strike</p>
                          <p className="text-[10px] text-slate-400 mt-1">INC-201 Rotterdam Port strike is affecting Shipment SH-101 and SH-104.</p>
                          <p className="text-[9px] text-indigo-400 font-mono mt-1">1 hour ago</p>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex space-x-3">
                        <TrendingUp className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-white font-medium">Auto-Recovery Recommendation</p>
                          <p className="text-[10px] text-slate-400 mt-1">Trieste Rail recovery scenario has a 98% execution feasibility score.</p>
                          <p className="text-[9px] text-emerald-400 font-mono mt-1">45 mins ago</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
