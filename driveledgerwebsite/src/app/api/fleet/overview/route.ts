import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

interface CarNFT {
  id: string;
  vin: string;
}

interface CarDataRecord {
  unique_id: string;
  fault: string;
  timestamp: string;
  confidence: number;
  sensor_data: Record<string, number>;
}

interface VehicleData {
  vin: string;
  fault_count: number;
  last_fault: string | null;
  last_timestamp: string | null;
  last_confidence: number | null;
  sensor_data: Record<string, number> | null;
}

export async function GET() {
  try {
    // First get all NFTs with their VINs
    const { data: nfts } = await supabase
      .from('car_nfts')
      .select('id, vin')
      .not('vin', 'is', null);

    const nftData = (nfts || []) as CarNFT[];

    // If there are no NFTs, return an empty array
    if (nftData.length === 0) {
      return NextResponse.json([]);
    }

    // Get all fault data
    const { data: carData } = await supabase
      .from('car_data')
      .select('unique_id, fault, timestamp, confidence, sensor_data')
      .not('fault', 'is', null);

    console.log('Car data from DB:', carData);

    const carDataRecords = (carData || []) as CarDataRecord[];

    // Create a map of NFT ID to VIN
    const nftToVin = new Map(nftData.map(nft => [nft.id, nft.vin]));
    console.log('NFT to VIN mapping:', Object.fromEntries(nftToVin));

    // Process the data to get counts and latest faults
    const vehicleMap = new Map<string, VehicleData>();
    
    carDataRecords.forEach((record) => {
      const vin = nftToVin.get(record.unique_id);
      if (!vin) {
        console.log('No VIN found for record:', record.unique_id);
        return;
      }

      const existing = vehicleMap.get(vin);
      if (!existing) {
        vehicleMap.set(vin, {
          vin,
          fault_count: 1,
          last_fault: record.fault,
          last_timestamp: record.timestamp || null,
          last_confidence: record.confidence || null,
          sensor_data: record.sensor_data || null
        });
      } else {
        existing.fault_count++;
        // Update if this is a more recent fault
        if (record.timestamp && (!existing.last_timestamp || record.timestamp > existing.last_timestamp)) {
          existing.last_fault = record.fault;
          existing.last_timestamp = record.timestamp;
          existing.last_confidence = record.confidence || null;
          existing.sensor_data = record.sensor_data || null;
        }
      }
    });

    console.log('Processed vehicle map:', Object.fromEntries(vehicleMap));

    // Transform the data to match the expected format
    const fleetData = Array.from(vehicleMap.values()).map((vehicle: VehicleData) => ({
      vin: vehicle.vin,
      faultCount: vehicle.fault_count,
      lastFault: vehicle.last_fault ? {
        fault: vehicle.last_fault,
        timestamp: vehicle.last_timestamp,
        confidence: vehicle.last_confidence,
        sensor_data: vehicle.sensor_data || {}
      } : null
    }));

    console.log('Final fleet data:', fleetData);

    return NextResponse.json(fleetData);
  } catch (error) {
    console.error('Error fetching fleet overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet overview' },
      { status: 500 }
    );
  }
} 