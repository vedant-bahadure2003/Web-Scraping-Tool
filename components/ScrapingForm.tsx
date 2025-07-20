'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Link, Settings, Play, Square } from 'lucide-react';
import { CompanyData, ScrapingProgress, ScrapingRequest } from '@/types/scraping';
import { toast } from 'sonner';

interface ScrapingFormProps {
  onStart: () => void;
  onComplete: (data: CompanyData[]) => void;
  onProgress: (progress: Partial<ScrapingProgress>) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

export function ScrapingForm({ onStart, onComplete, onProgress, onError, isActive }: ScrapingFormProps) {
  const [activeTab, setActiveTab] = useState('query');
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState('');
  const [maxResults, setMaxResults] = useState('10');
  const [extractionLevel, setExtractionLevel] = useState<'1' | '2' | '3'>('2');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isActive) {
      // Stop scraping
      try {
        await fetch('/api/scrape/stop', { method: 'POST' });
        toast.success('Scraping stopped');
      } catch (error) {
        toast.error('Failed to stop scraping');
      }
      return;
    }

    // Validate input
    if (activeTab === 'query' && !query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (activeTab === 'urls' && !urls.trim()) {
      toast.error('Please enter at least one URL');
      return;
    }

    const urlList = urls.split('\n').filter(url => url.trim());
    if (activeTab === 'urls') {
      const invalidUrls = urlList.filter(url => {
        try {
          new URL(url.trim());
          return false;
        } catch {
          return true;
        }
      });

      if (invalidUrls.length > 0) {
        toast.error(`Invalid URLs found: ${invalidUrls.join(', ')}`);
        return;
      }
    }

    const request: ScrapingRequest = {
      type: activeTab as 'query' | 'urls',
      query: activeTab === 'query' ? query : undefined,
      urls: activeTab === 'urls' ? urlList : undefined,
      options: {
        maxResults: parseInt(maxResults),
        extractionLevel: parseInt(extractionLevel) as 1 | 2 | 3,
        timeout: 30000
      }
    };

    onStart();
    toast.info('Starting scraping operation...');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                onProgress(data.progress);
              } else if (data.type === 'complete') {
                onComplete(data.results);
                toast.success(`Scraping completed! Found ${data.results.length} companies`);
              } else if (data.type === 'error') {
                onError(data.error);
                toast.error(`Scraping error: ${data.error}`);
              }
            } catch (error) {
              console.error('Failed to parse progress data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Scraping failed. Please try again.');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Scraping Configuration
        </CardTitle>
        <CardDescription className="text-slate-300">
          Configure your scraping parameters and start data extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="query" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Search Query
              </TabsTrigger>
              <TabsTrigger value="urls" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Seed URLs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="query" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Search Query
                </label>
                <Input
                  placeholder="e.g., cloud computing startups in Europe"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  disabled={isActive}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter keywords to discover companies matching your criteria
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="urls" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Seed URLs
                </label>
                <Textarea
                  placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 min-h-[100px]"
                  disabled={isActive}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter one URL per line. Each URL will be scraped for company information.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Max Results
              </label>
              <Select value={maxResults} onValueChange={setMaxResults} disabled={isActive}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Extraction Level
              </label>
              <Select value={extractionLevel} onValueChange={(value) => setExtractionLevel(value as '1' | '2' | '3')} disabled={isActive}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 - Basic</SelectItem>
                  <SelectItem value="2">Level 2 - Enhanced</SelectItem>
                  <SelectItem value="3">Level 3 - Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-300">
              <Settings className="w-3 h-3 mr-1" />
              Rate Limited
            </Badge>
            <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
              <Link className="w-3 h-3 mr-1" />
              Dynamic Content
            </Badge>
          </div>

          <Button 
            type="submit" 
            className={`w-full ${isActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white font-medium py-3`}
            disabled={false}
          >
            {isActive ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Scraping
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Scraping
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}