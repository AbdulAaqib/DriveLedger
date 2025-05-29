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
}

export async function GET() {
  try {
    // First get all NFTs with their VINs
    const { data: nfts } = await supabase
      .from('car_nfts')
      .select('id, vin')
      .not('vin', 'is', null);

    const nftData = (nfts || []) as CarNFT[];
    const totalVehicles = new Set(nftData.map(nft => nft.vin)).size;

    // Get all fault data
    const { data: faultData } = await supabase
      .from('car_data')
      .select('unique_id, fault')
      .not('fault', 'is', null);

    const faultRecords = (faultData || []) as CarData[];

    let mostCommonFault = null;
    if (faultRecords.length > 0) {
      const faultCounts = faultRecords.reduce((acc: Record<string, number>, curr) => {
        if (curr.fault) {
          acc[curr.fault] = (acc[curr.fault] || 0) + 1;
        }
        return acc;
      }, {});

      if (Object.keys(faultCounts).length > 0) {
        const [fault, count] = Object.entries(faultCounts).reduce((a, b) => 
          b[1] > a[1] ? b : a
        );

        mostCommonFault = {
          fault,
          percentage: ((count / faultRecords.length) * 100).toFixed(1)
        };
      }
    }

    // Get confidence data
    const { data: confidenceData } = await supabase
      .from('car_data')
      .select('unique_id, confidence')
      .not('confidence', 'is', null);

    const confidenceRecords = (confidenceData || []) as CarData[];

    const averageConfidence = confidenceRecords.length > 0
      ? (confidenceRecords.reduce((sum, curr) => sum + (curr.confidence || 0), 0) / confidenceRecords.length * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      totalVehicles,
      mostCommonFault,
      averageConfidence
    });
  } catch (error) {
    console.error('Error fetching fleet statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet statistics' },
      { status: 500 }
    );
  }
} 