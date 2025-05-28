import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Types for our database tables
export interface CarData {
  timestamp: string;
  fault: string;
  confidence: number;
  sensor_data: Record<string, any>;
  unique_id: string;
}

export interface CarNFT {
  vin: string;
  nfts: string;
}

// API Functions for Car Data
export async function getCarData(uniqueId?: string) {
  if (uniqueId) {
    const { data, error } = await supabase
      .from('car_data')
      .select('*')
      .eq('unique_id', uniqueId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data as CarData[];
  }

  const { data, error } = await supabase
    .from('car_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data as CarData[];
}

export async function getLatestFaults(limit = 10) {
  const { data, error } = await supabase
    .from('car_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as CarData[];
}

export async function getCarDataByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('car_data')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: true });
  
  if (error) throw error;
  return data as CarData[];
}

// API Functions for Car NFTs
export async function getCarNFTs(vin?: string) {
  if (vin) {
    const { data, error } = await supabase
      .from('car_nfts')
      .select('*')
      .eq('vin', vin)
      .single();
    
    if (error) throw error;
    return data as CarNFT;
  }

  const { data, error } = await supabase
    .from('car_nfts')
    .select('*');
  
  if (error) throw error;
  return data as CarNFT[];
}

export async function searchCarData(searchTerm: string) {
  const { data, error } = await supabase
    .from('car_data')
    .select('*')
    .or(`fault.ilike.%${searchTerm}%,unique_id.ilike.%${searchTerm}%`)
    .order('timestamp', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data as CarData[];
} 