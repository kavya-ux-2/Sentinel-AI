'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingLoginPage() {
  const router = useRouter();

  const handleBypass = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07080d] overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px]"></div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl relative z-10 mx-4"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-indigo-600/15 p-4 rounded-full border border-indigo-500/30 shadow-lg glow-indigo">
            <Cpu className="h-10 w-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Sentinel AI</h1>
            <p className="text-sm text-indigo-400 font-mono tracking-widest uppercase mt-1">Autonomous Supply Chain Recovery</p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Predict, analyze, and recover from global logistics disruptions autonomously.
          </p>

          <div className="w-full space-y-3 pt-4">
            <button 
              onClick={handleBypass}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center space-x-2 border border-indigo-500/40"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Enter Control Console</span>
            </button>
            <p className="text-[11px] text-slate-500 font-mono">DEMO BYPASS AUTHENTICATION ENABLED</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
