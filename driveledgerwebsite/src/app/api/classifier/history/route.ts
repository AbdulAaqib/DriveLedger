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

interface CarData {
  unique_id: string;
  fault: string;
  confidence: number;
  timestamp: string;
  sensor_data: Record<string, number>;
}

export async function GET(request: Request) {
  try {
    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate the start date based on time range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        // For 'all', don't filter by date
        startDate = new Date(0);
    }

    // First get all NFTs with their VINs
    const { data: nfts } = await supabase
      .from('car_nfts')
      .select('id, vin')
      .not('vin', 'is', null);

    const nftData = (nfts || []) as CarNFT[];
    const nftToVin = new Map(nftData.map(nft => [nft.id, nft.vin]));

    // Get fault data with time range filter
    const { data: carData } = await supabase
      .from('car_data')
      .select('unique_id, fault, confidence, timestamp, sensor_data')
      .not('fault', 'is', null)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    const faultRecords = (carData || []) as CarData[];

    // Transform the data to include VIN information
    const history = faultRecords
      .map(record => {
        const vin = nftToVin.get(record.unique_id);
        if (!vin) return null;

        return {
          vin,
          timestamp: record.timestamp,
          predictedFault: record.fault,
          actualFault: null, // In a real system, this would be populated from verified data
          confidence: record.confidence,
          sensor_data: record.sensor_data
        };
      })
      .filter(record => record !== null);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching classification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classification history' },
      { status: 500 }
    );
  }
} 