// Analytics and visitor tracking utilities

export interface VisitorData {
  id?: string;
  ipAddress: string;
  isp?: string;
  city?: string;
  country?: string;
  region?: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
  page: string;
}

export interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  timezone?: string;
}

// Get visitor's IP address and location data
export async function getVisitorInfo(): Promise<{
  ipAddress: string;
  location: LocationData;
  userAgent: string;
  referrer: string;
}> {
  try {
    // Get IP address and location data from ipapi.co (free tier: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      ipAddress: data.ip || 'unknown',
      location: {
        city: data.city,
        region: data.region,
        country: data.country_name,
        isp: data.org,
        timezone: data.timezone
      },
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof window !== 'undefined' ? document.referrer : ''
    };
  } catch (error) {
    console.error('Error getting visitor info:', error);
    
    // Fallback: try to get IP from a different service
    try {
      const fallbackResponse = await fetch('https://api.ipify.org?format=json');
      const fallbackData = await fallbackResponse.json();
      
      return {
        ipAddress: fallbackData.ip || 'unknown',
        location: {
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          isp: 'Unknown'
        },
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : ''
      };
    } catch (fallbackError) {
      console.error('Fallback IP service also failed:', fallbackError);
      
      return {
        ipAddress: 'unknown',
        location: {
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          isp: 'Unknown'
        },
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : ''
      };
    }
  }
}

// Track a page visit
export async function trackPageVisit(page: string): Promise<void> {
  try {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if we've already tracked this session to avoid duplicate entries
    const sessionKey = `tracked_${page}_${Date.now().toString().slice(0, -5)}`; // 5-minute window
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    
    const visitorInfo = await getVisitorInfo();
    
    const visitorData: VisitorData = {
      ipAddress: visitorInfo.ipAddress,
      isp: visitorInfo.location.isp,
      city: visitorInfo.location.city,
      country: visitorInfo.location.country,
      timestamp: new Date(),
      userAgent: visitorInfo.userAgent,
      referrer: visitorInfo.referrer,
      page: page
    };
    
    // Store the visitor data in Firebase
    await storeVisitorData(visitorData);
    
    // Mark this session as tracked
    sessionStorage.setItem(sessionKey, 'true');
    
    console.log('Page visit tracked:', page);
  } catch (error) {
    console.error('Error tracking page visit:', error);
    // Fail silently to not disrupt user experience
  }
}

// Store visitor data in Firebase
async function storeVisitorData(visitorData: VisitorData): Promise<void> {
  try {
    // Import Firebase functions dynamically to avoid SSR issues
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    await addDoc(collection(db, 'visitor_analytics'), {
      ...visitorData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error storing visitor data:', error);
    throw error;
  }
}

// Get visitor analytics data (for admin panel)
export async function getVisitorAnalytics(filters?: {
  startDate?: Date;
  endDate?: Date;
  page?: string;
  limit?: number;
}): Promise<VisitorData[]> {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    // Simple query to get all visitor analytics
    const querySnapshot = await getDocs(collection(db, 'visitor_analytics'));
    
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as VisitorData[];
    
    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply filters client-side
    if (filters?.startDate) {
      results = results.filter(visitor => visitor.timestamp >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      results = results.filter(visitor => visitor.timestamp <= filters.endDate!);
    }
    
    if (filters?.page) {
      results = results.filter(visitor => visitor.page === filters.page);
    }
    
    // Apply limit
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  } catch (error) {
    console.error('Error getting visitor analytics:', error);
    throw error;
  }
}

// Get analytics summary
export async function getAnalyticsSummary(days: number = 30): Promise<{
  totalVisits: number;
  uniqueVisitors: number;
  topPages: { page: string; visits: number }[];
  topCountries: { country: string; visits: number }[];
  topCities: { city: string; visits: number }[];
}> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const visitors = await getVisitorAnalytics({
      startDate,
      endDate,
      limit: 1000 // Adjust based on your needs
    });
    
    const uniqueIPs = new Set(visitors.map(v => v.ipAddress));
    
    // Count page visits
    const pageVisits = visitors.reduce((acc, visitor) => {
      acc[visitor.page] = (acc[visitor.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count country visits
    const countryVisits = visitors.reduce((acc, visitor) => {
      const country = visitor.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count city visits
    const cityVisits = visitors.reduce((acc, visitor) => {
      const city = visitor.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalVisits: visitors.length,
      uniqueVisitors: uniqueIPs.size,
      topPages: Object.entries(pageVisits)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([page, visits]) => ({ page, visits })),
      topCountries: Object.entries(countryVisits)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([country, visits]) => ({ country, visits })),
      topCities: Object.entries(cityVisits)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([city, visits]) => ({ city, visits }))
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
} 