'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { ScrapingProgress } from '@/types/scraping';

interface ProgressTrackerProps {
  progress: ScrapingProgress;
}

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  const progressPercentage = progress.totalUrls > 0 ? (progress.processedUrls / progress.totalUrls) * 100 : 0;

  const getStatusColor = (status: ScrapingProgress['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-600';
      case 'completed': return 'bg-emerald-600';
      case 'error': return 'bg-red-600';
      case 'paused': return 'bg-amber-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status: ScrapingProgress['status']) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'paused': return <Clock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Scraping Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Overall Progress</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300 text-sm">Total URLs</span>
              <span className="text-white font-medium">{progress.totalUrls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 text-sm">Processed</span>
              <span className="text-white font-medium">{progress.processedUrls}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-emerald-300 text-sm">Successful</span>
              <span className="text-emerald-300 font-medium">{progress.successfulExtractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-300 text-sm">Errors</span>
              <span className="text-red-300 font-medium">{progress.errors}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(progress.status)} text-white border-0`}>
              {getStatusIcon(progress.status)}
              {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
            </Badge>
          </div>
          
          {progress.currentUrl && (
            <div className="space-y-1">
              <span className="text-slate-300 text-sm">Currently processing:</span>
              <div className="bg-black/20 rounded p-2 break-all text-xs text-slate-400">
                {progress.currentUrl}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}