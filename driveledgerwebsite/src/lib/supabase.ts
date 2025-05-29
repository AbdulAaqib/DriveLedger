import { createClient } from '@supabase/supabase-js';

// Get environment variables, with fallbacks for edge functions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing Supabase key environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

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

interface FaultFrequency {
  [key: string]: number;
}

interface FleetStatistics {
  totalVehicles: number;
  mostCommonFault: {
    fault: string;
    percentage: string;
  } | null;
  averageConfidence: string;
}

interface VehicleOverview {
  vin: string;
  faultCount: number;
  lastFault: CarData | null;
}

// Fleet Statistics Functions
export async function getFleetStatistics(): Promise<FleetStatistics> {
  // Get total number of unique vehicles
  const { data: vehicleData, error: countError } = await supabase
    .from('car_data')
    .select('unique_id');

  if (countError) throw countError;

  // Count unique vehicle IDs
  const uniqueVehicles = new Set(vehicleData.map(d => d.unique_id));

  // Get most common faults
  const { data: faultStats, error: faultError } = await supabase
    .from('car_data')
    .select('fault')
    .order('timestamp', { ascending: false });

  if (faultError) throw faultError;

  // Calculate fault frequency
  const faultFrequency = faultStats?.reduce((acc: FaultFrequency, curr) => {
    acc[curr.fault] = (acc[curr.fault] || 0) + 1;
    return acc;
  }, {});

  const totalFaults = faultStats?.length || 0;
  const mostCommonFault = Object.entries(faultFrequency || {})
    .sort(([, a], [, b]) => b - a)[0];

  // Get average confidence
  const { data: confidenceData, error: confidenceError } = await supabase
    .from('car_data')
    .select('confidence');

  if (confidenceError) throw confidenceError;

  const avgConfidence = confidenceData?.reduce((sum, curr) => sum + curr.confidence, 0) / 
    (confidenceData?.length || 1);

  return {
    totalVehicles: uniqueVehicles.size,
    mostCommonFault: mostCommonFault ? {
      fault: mostCommonFault[0],
      percentage: ((mostCommonFault[1] / totalFaults) * 100).toFixed(1)
    } : null,
    averageConfidence: avgConfidence.toFixed(1)
  };
}

export async function getFleetOverview(): Promise<VehicleOverview[]> {
  // Get all vehicle data
  const { data: allData, error: dataError } = await supabase
    .from('car_data')
    .select('*')
    .order('timestamp', { ascending: false });

  if (dataError) throw dataError;

  // Group by unique_id and create overview
  const vehicleMap = new Map<string, VehicleOverview>();
  
  allData.forEach(data => {
    if (!vehicleMap.has(data.unique_id)) {
      vehicleMap.set(data.unique_id, {
        vin: data.unique_id,
        faultCount: 1,
        lastFault: data
      });
    } else {
      const vehicle = vehicleMap.get(data.unique_id)!;
      vehicle.faultCount++;
    }
  });

  return Array.from(vehicleMap.values());
} 