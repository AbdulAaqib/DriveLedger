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
}

export async function GET() {
  try {
    // Get all fault data with NFT information
    const { data: carData } = await supabase
      .from('car_data')
      .select('unique_id, fault, confidence, timestamp')
      .not('fault', 'is', null)
      .order('timestamp', { ascending: false });

    const faultRecords = (carData || []) as CarData[];

    // Calculate total classifications
    const totalClassifications = faultRecords.length;

    // Calculate accuracy rate (for now, we'll assume all predictions are correct)
    // In a real system, you would compare with actual faults
    const accuracyRate = '85.5'; // Placeholder

    // Get top faults with their accuracy
    const faultCounts = faultRecords.reduce((acc: Record<string, { count: number, correct: number }>, curr) => {
      if (!acc[curr.fault]) {
        acc[curr.fault] = { count: 0, correct: 0 };
      }
      acc[curr.fault].count++;
      // Assuming high confidence predictions are correct (this should be replaced with actual comparison)
      if (curr.confidence > 0.8) {
        acc[curr.fault].correct++;
      }
      return acc;
    }, {});

    const topFaults = Object.entries(faultCounts)
      .map(([fault, data]) => ({
        fault,
        count: data.count,
        accuracy: (data.correct / data.count) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = faultRecords.slice(0, 10).map(record => ({
      timestamp: record.timestamp,
      fault: record.fault,
      confidence: record.confidence,
      accuracy: record.confidence > 0.8 // Placeholder, should be compared with actual results
    }));

    return NextResponse.json({
      totalClassifications,
      accuracyRate,
      topFaults,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching classifier statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classifier statistics' },
      { status: 500 }
    );
  }
} 