'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardShell from '@/components/dashboard-shell';
import { motion } from 'framer-motion';
import { Send, Cpu, User, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [convId] = useState(`demo-session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    "Show today's critical shipments.",
    "Which customer is at highest risk?",
    "Summarize all incidents.",
    "Draft email for delayed shipment.",
    "How much money can we save by rerouting?"
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from DB on startup
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API_URL}/api/chat/history/${convId}`);
        if (res.ok) {
          setMessages(await res.json());
        }
      } catch (err) {
        console.log("No previous chat history found or server offline.");
      }
    }
    loadHistory();
  }, [convId]);

  const handleSendMessage = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery('');
    
    // Add user message locally for immediate UI update
    const userMsg = { sender: 'user', message: searchQuery, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: convId, query: searchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', message: data.answer, timestamp: data.timestamp }]);
      }
    } catch (err) {
      console.error(err);
      // Fallback answers for instant offline testing
      let fallback = "I am currently offline. Please launch the backend FastAPI service to use my full capabilities.";
      const queryLower = searchQuery.toLowerCase();
      
      if (queryLower.includes("critical") || queryLower.includes("today")) {
        fallback = "Sentinel scan completed: 2 shipments carrying IoT sensors and automotive hardware from Shenzhen/Hanoi are flagged as 'Disrupted' due to the active Rotterdam strike (INC-201).";
      } else if (queryLower.includes("risk") || queryLower.includes("customer")) {
        fallback = "The customer waiting for Shipment SH-101 (valued at $450,000) is at the highest risk due to a strike-related delay at the Rotterdam terminal.";
      } else if (queryLower.includes("summarize") || queryLower.includes("incident")) {
        fallback = "Incident Summary:\n1. INC-201 (Rotterdam Port Strike) - Severity: Critical, status: Active. Affecting SH-101 and SH-104.\n2. INC-202 (Customs System Outage) - Severity: Medium, status: Resolved. Affected SH-102.";
      } else if (queryLower.includes("save") || queryLower.includes("reroute") || queryLower.includes("money")) {
        fallback = "By executing alternate path REC-301 via Trieste Port + Rail, you recover 48 hours of transit delay. This prevents a 2% SLA penalty ($9,000) and $9,000 in holding costs. Surcharge is +$4,800. Total net savings: **$13,200**.";
      } else if (queryLower.includes("email") || queryLower.includes("draft")) {
        fallback = "Subject: Action Required: Alternate Route customs documentation for SH-101\n\nDear Partner,\n\nWe are rerouting SH-101 through Trieste to bypass the Rotterdam strike. Please submit updated invoices.";
      }
      
      setMessages(prev => [...prev, { sender: 'ai', message: fallback, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        
        {/* Presets Sidebar */}
        <div className="glass-panel rounded-xl p-5 space-y-4 hidden lg:block h-fit">
          <h3 className="text-white font-semibold text-sm">Suggested Queries</h3>
          <p className="text-xs text-slate-400">Ask the AI assistant about your active shipments and incidents.</p>
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handleSendMessage(preset)}
                className="w-full text-left p-2.5 bg-slate-900/40 border border-slate-850 hover:border-indigo-500/30 hover:bg-indigo-950/10 rounded-lg text-xs text-slate-300 transition-all duration-150"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 glass-panel rounded-xl flex flex-col justify-between h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/15 rounded-lg border border-indigo-500/20 glow-indigo">
                <Cpu className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Sentinel Logistics Assistant</h3>
                <span className="text-[10px] text-slate-400">Agent memory & context loaded.</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Sync Status: Ready</span>
            </div>
          </div>

          {/* Messages scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-12 space-y-2 max-w-sm mx-auto">
                <Cpu className="h-8 w-8 text-indigo-500/40 mx-auto" />
                <p>Hello! I am Sentinel AI. Ask me about cargo status, delays, alternate ports, or how to recover today&apos;s shipments.</p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2.5 max-w-[80%] items-start ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-lg border ${
                      isUser ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      {isUser ? <User className="h-4 w-4 text-indigo-400" /> : <Cpu className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-900/40 border border-slate-800/80 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex space-x-2.5 items-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <Cpu className="h-4 w-4 text-emerald-400 animate-spin" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Agent reasoning...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
            <div className="flex items-center space-x-3">
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(query)}
                placeholder="Ask Sentinel..." 
                className="flex-1 p-3 rounded-xl glass-input text-xs"
                disabled={loading}
              />
              <button 
                onClick={() => handleSendMessage(query)}
                disabled={loading || !query.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white rounded-xl transition-all duration-150"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
