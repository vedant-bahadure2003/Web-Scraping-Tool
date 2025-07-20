import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScrapeMaster - Professional Web Scraping Tool',
  description: 'Advanced web scraping tool for extracting company data with real-time progress tracking and professional export capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          theme="dark" 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  );
}