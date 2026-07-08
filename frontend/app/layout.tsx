import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentinel AI | Autonomous Supply Chain Recovery',
  description: 'Predict, analyze, and recover from supply chain disruptions autonomously.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="grid-bg min-h-screen text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
