'use client';

import { Globe, Search, Database } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ScrapeMaster</h1>
              <p className="text-sm text-slate-400">Professional Web Scraping Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Query-Based Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Structured Data Export</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}