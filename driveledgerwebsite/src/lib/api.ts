import type { CarData, CarNFT } from './supabase';

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  // Server should use full URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Local development
  return `http://localhost:${process.env.PORT || 3000}`;
}

export async function getCarData(uniqueId?: string): Promise<CarData[]> {
  const params = new URLSearchParams();
  if (uniqueId) {
    params.append('uniqueId', uniqueId);
  }
  
  const response = await fetch(`${getBaseUrl()}/api/car-data?${params}`, {
    // Required for server-side requests
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch car data');
  }
  
  return response.json();
}

export async function getLatestFaults(limit = 10): Promise<CarData[]> {
  const params = new URLSearchParams({
    limit: limit.toString()
  });
  
  const response = await fetch(`${getBaseUrl()}/api/car-data?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch latest faults');
  }
  
  return response.json();
}

export async function getCarDataByDateRange(startDate: string, endDate: string): Promise<CarData[]> {
  const params = new URLSearchParams({
    startDate,
    endDate
  });
  
  const response = await fetch(`${getBaseUrl()}/api/car-data?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch car data by date range');
  }
  
  return response.json();
}

export async function searchCarData(searchTerm: string): Promise<CarData[]> {
  const params = new URLSearchParams({
    search: searchTerm
  });
  
  const response = await fetch(`${getBaseUrl()}/api/car-data?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to search car data');
  }
  
  return response.json();
}

export async function getCarNFTs(vin?: string): Promise<CarNFT | CarNFT[]> {
  const params = new URLSearchParams();
  if (vin) {
    params.append('vin', vin);
  }
  
  const response = await fetch(`${getBaseUrl()}/api/car-nfts?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch car NFTs');
  }
  
  return response.json();
} 