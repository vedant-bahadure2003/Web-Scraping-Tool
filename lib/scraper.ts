import puppeteer from "puppeteer";
import { CompanyData } from "@/types/scraping";

export async function scrapeCompanyData(
  url: string,
  extractionLevel: number = 2
): Promise<CompanyData | null> {
  try {
    const urlObj = new URL(url);

    const browser = await puppeteer.launch({ headless: true }); // use 'new' for modern Puppeteer headless mode
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const companyData = await page.evaluate(
      (url, extractionLevel) => {
        const getMetaContent = (name: string): string => {
          return (
            document
              .querySelector(`meta[name="${name}"]`)
              ?.getAttribute("content") ||
            document
              .querySelector(`meta[property="${name}"]`)
              ?.getAttribute("content") ||
            ""
          );
        };

        const companyName =
          document.title?.split("|")[0].trim() || new URL(url).hostname;
        const description =
          getMetaContent("description") ||
          getMetaContent("og:description") ||
          "";
        const emailMatch = document.body.innerText.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
        );
        const phoneMatch = document.body.innerText.match(
          /(\+?\d{1,3})?[-.\s]?\(?\d+\)?[-.\s]?\d+[-.\s]?\d+/
        );

        const data: Partial<CompanyData> = {
          companyName,
          websiteUrl: url,
          extractedAt: new Date().toISOString(),
          sourceUrl: url,
          confidence: 0.9,
        };

        if (extractionLevel >= 1) {
          data.email = emailMatch ? emailMatch[0] : "";
          data.phone = phoneMatch ? phoneMatch[0] : "";
        }

        if (extractionLevel >= 2) {
          data.description = description;
          data.industry = "Technology"; // Can be enhanced with AI/ML/NLP
          data.location = "";
          data.foundedYear = "";
          data.employeeSize = "";
          data.socialMedia = {
            linkedin:
              Array.from(
                document.querySelectorAll('a[href*="linkedin.com"]')
              )[0]?.getAttribute("href") || "",
            twitter:
              Array.from(
                document.querySelectorAll('a[href*="twitter.com"]')
              )[0]?.getAttribute("href") || "",
          };
        }

        if (extractionLevel >= 3) {
          const techKeywords = [
            "React",
            "Node.js",
            "TypeScript",
            "GraphQL",
            "Python",
            "AWS",
            "PostgreSQL",
            "MongoDB",
          ];
          const bodyText = document.body.innerText;
          data.techStack = techKeywords.filter((keyword) =>
            bodyText.includes(keyword)
          );
        }

        return data;
      },
      url,
      extractionLevel
    );

    await browser.close();

    const finalData: CompanyData = {
      id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName: companyData.companyName || "Unknown Company",
      websiteUrl: companyData.websiteUrl!,
      extractedAt: companyData.extractedAt!,
      sourceUrl: companyData.sourceUrl!,
      confidence: companyData.confidence!,
      email: companyData.email,
      phone: companyData.phone,
      description: companyData.description,
      industry: companyData.industry,
      location: companyData.location,
      foundedYear: companyData.foundedYear,
      employeeSize: companyData.employeeSize,
      socialMedia: companyData.socialMedia,
      techStack: companyData.techStack,
    };

    return finalData;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function checkUrlReachability(url: string): Promise<boolean> {
  try {
    // You can make a HEAD request using fetch here in a real-world server
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Math.random() > 0.1; // Simulated 90% reachability
  } catch {
    return false;
  }
}

// import { CompanyData } from '@/types/scraping';

// export async function scrapeCompanyData(url: string, extractionLevel: number = 2): Promise<CompanyData | null> {
//   try {
//     // Validate URL
//     const urlObj = new URL(url);

//     // In a real implementation, you would:
//     // 1. Use puppeteer/playwright for dynamic content
//     // 2. Parse HTML with cheerio
//     // 3. Extract structured data
//     // 4. Handle different page layouts
//     // 5. Implement error handling and retries

//     // For demo purposes, generate realistic mock data
//     const companyData = await generateMockCompanyData(url, extractionLevel);

//     return companyData;
//   } catch (error) {
//     console.error(`Error scraping ${url}:`, error);
//     return null;
//   }
// }

// async function generateMockCompanyData(url: string, extractionLevel: number): Promise<CompanyData> {
//   // Extract domain name for company name
//   const domain = new URL(url).hostname.replace('www.', '');
//   const companyName = domain.split('.')[0];

//   const companies = {
//     'stripe': {
//       name: 'Stripe',
//       industry: 'FinTech',
//       description: 'Online payment processing platform for internet businesses',
//       location: 'San Francisco, CA',
//       foundedYear: '2010',
//       employeeSize: '1000-5000',
//       email: 'contact@stripe.com',
//       phone: '+1-888-963-8477'
//     },
//     'shopify': {
//       name: 'Shopify',
//       industry: 'E-commerce',
//       description: 'Multinational e-commerce company that provides a platform for online stores',
//       location: 'Ottawa, Canada',
//       foundedYear: '2006',
//       employeeSize: '5000-10000',
//       email: 'support@shopify.com',
//       phone: '+1-888-746-7439'
//     },
//     'notion': {
//       name: 'Notion',
//       industry: 'Productivity Software',
//       description: 'All-in-one workspace for notes, tasks, wikis, and databases',
//       location: 'San Francisco, CA',
//       foundedYear: '2016',
//       employeeSize: '500-1000',
//       email: 'team@makenotion.com'
//     },
//     'figma': {
//       name: 'Figma',
//       industry: 'Design Software',
//       description: 'Collaborative web application for interface design',
//       location: 'San Francisco, CA',
//       foundedYear: '2012',
//       employeeSize: '1000-5000',
//       email: 'support@figma.com'
//     },
//     'vercel': {
//       name: 'Vercel',
//       industry: 'Cloud Computing',
//       description: 'Platform for frontend frameworks and static sites',
//       location: 'San Francisco, CA',
//       foundedYear: '2015',
//       employeeSize: '100-500',
//       email: 'support@vercel.com'
//     }
//   };

//   const companyInfo = companies[companyName as keyof typeof companies] || {
//     name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
//     industry: 'Technology',
//     description: `Innovative technology company focused on digital solutions`,
//     location: 'Remote',
//     foundedYear: '2020',
//     employeeSize: '10-50',
//     email: `contact@${domain}`
//   };

//   const baseData: CompanyData = {
//     id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//     companyName: companyInfo.name,
//     websiteUrl: url,
//     extractedAt: new Date().toISOString(),
//     sourceUrl: url,
//     confidence: 0.8 + Math.random() * 0.2
//   };

//   // Level 1: Basic data
//   if (extractionLevel >= 1) {
//     baseData.email = companyInfo.email;
//     if (companyInfo.phone) {
//       baseData.phone = companyInfo.phone;
//     }
//   }

//   // Level 2: Enhanced data
//   if (extractionLevel >= 2) {
//     baseData.description = companyInfo.description;
//     baseData.industry = companyInfo.industry;
//     baseData.location = companyInfo.location;
//     baseData.foundedYear = companyInfo.foundedYear;
//     baseData.employeeSize = companyInfo.employeeSize;

//     baseData.socialMedia = {
//       linkedin: `https://linkedin.com/company/${companyName}`,
//       twitter: `https://twitter.com/${companyName}`
//     };
//   }

//   // Level 3: Advanced data
//   if (extractionLevel >= 3) {
//     baseData.techStack = [
//       'React',
//       'Node.js',
//       'TypeScript',
//       'AWS',
//       'PostgreSQL'
//     ].slice(0, 2 + Math.floor(Math.random() * 3));
//   }

//   return baseData;
// }

// export function validateUrl(url: string): boolean {
//   try {
//     new URL(url);
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function checkUrlReachability(url: string): Promise<boolean> {
//   try {
//     // In a real implementation, you would make a HEAD request
//     // For demo purposes, simulate reachability check
//     await new Promise(resolve => setTimeout(resolve, 100));
//     return Math.random() > 0.1; // 90% success rate
//   } catch {
//     return false;
//   }
// }
