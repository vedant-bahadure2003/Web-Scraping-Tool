'use client';

import { useState } from 'react';
import { ScrapingForm } from '@/components/ScrapingForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Header } from '@/components/Header';
import { CompanyData, ScrapingProgress } from '@/types/scraping';

export default function Home() {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [results, setResults] = useState<CompanyData[]>([]);
  const [progress, setProgress] = useState<ScrapingProgress>({
    totalUrls: 0,
    processedUrls: 0,
    successfulExtractions: 0,
    errors: 0,
    currentUrl: '',
    status: 'idle'
  });

  const handleScrapingStart = () => {
    setIsScrapingActive(true);
    setResults([]);
    setProgress({
      totalUrls: 0,
      processedUrls: 0,
      successfulExtractions: 0,
      errors: 0,
      currentUrl: '',
      status: 'running'
    });
  };

  const handleScrapingComplete = (data: CompanyData[]) => {
    setResults(data);
    setIsScrapingActive(false);
    setProgress(prev => ({ ...prev, status: 'completed' }));
  };

  const handleProgressUpdate = (newProgress: Partial<ScrapingProgress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };

  const handleScrapingError = (error: string) => {
    setProgress(prev => ({ 
      ...prev, 
      status: 'error',
      errors: prev.errors + 1 
    }));
    setIsScrapingActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 opacity-20 background-pattern"></div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Web Scraping Tool
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Discover and extract detailed company information with our advanced AI-powered scraping engine. 
              Simply enter a search query or provide seed URLs to get started.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ScrapingForm
                onStart={handleScrapingStart}
                onComplete={handleScrapingComplete}
                onProgress={handleProgressUpdate}
                onError={handleScrapingError}
                isActive={isScrapingActive}
              />
              
              {isScrapingActive && (
                <ProgressTracker progress={progress} />
              )}
            </div>

            <div className="lg:col-span-1">
              <ResultsDisplay 
                results={results} 
                isLoading={isScrapingActive}
                progress={progress}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}