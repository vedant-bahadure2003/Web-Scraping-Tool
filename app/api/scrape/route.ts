import { NextRequest } from 'next/server';
import { ScrapingRequest, CompanyData, ScrapingProgress } from '@/types/scraping';
import { scrapeCompanyData } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const scrapingRequest: ScrapingRequest = await request.json();
    
    // Create a readable stream for real-time updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const sendUpdate = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          let urlsToProcess: string[] = [];

          if (scrapingRequest.type === 'query') {
            // For query-based scraping, we'll generate some demo URLs
            // In a real implementation, you would use search engines or directories
            urlsToProcess = await generateUrlsFromQuery(scrapingRequest.query || '');
          } else {
            urlsToProcess = scrapingRequest.urls || [];
          }

          const maxResults = scrapingRequest.options?.maxResults || 10;
          urlsToProcess = urlsToProcess.slice(0, maxResults);

          const progress: ScrapingProgress = {
            totalUrls: urlsToProcess.length,
            processedUrls: 0,
            successfulExtractions: 0,
            errors: 0,
            currentUrl: '',
            status: 'running'
          };

          sendUpdate({ type: 'progress', progress });

          const results: CompanyData[] = [];

          for (let i = 0; i < urlsToProcess.length; i++) {
            const url = urlsToProcess[i];
            progress.currentUrl = url;
            progress.processedUrls = i + 1;
            
            sendUpdate({ type: 'progress', progress });

            try {
              // Add realistic delay to simulate scraping
              await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
              
              const companyData = await scrapeCompanyData(url, scrapingRequest.options?.extractionLevel || 2);
              
              if (companyData) {
                results.push(companyData);
                progress.successfulExtractions++;
              }
            } catch (error) {
              console.error(`Error scraping ${url}:`, error);
              progress.errors++;
            }

            sendUpdate({ type: 'progress', progress });
          }

          progress.status = 'completed';
          progress.currentUrl = '';
          
          sendUpdate({ type: 'complete', results, progress });
          controller.close();

        } catch (error) {
          console.error('Scraping error:', error);
          sendUpdate({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return Response.json(
      { success: false, error: 'Failed to process scraping request' },
      { status: 500 }
    );
  }
}

async function generateUrlsFromQuery(query: string): Promise<string[]> {
  // In a real implementation, you would:
  // 1. Use search engines (Google Custom Search API, Bing API)
  // 2. Query business directories (Yellow Pages, Yelp, etc.)
  // 3. Use domain discovery tools
  
  // For demo purposes, return some realistic company URLs
  const demoUrls = [
    'https://stripe.com',
    'https://shopify.com',
    'https://notion.so',
    'https://figma.com',
    'https://vercel.com',
    'https://supabase.com',
    'https://linear.app',
    'https://framer.com',
    'https://loom.com',
    'https://miro.com'
  ];

  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return demoUrls.slice(0, 5 + Math.floor(Math.random() * 5));
}