import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

interface FleetAnalytics {
  fleetOverview: {
    totalVehicles: number;
    totalFaults: number;
    averageConfidence: number;
    faultDistribution: Record<string, number>;
  };
  vehicleStats: Array<{
    vin: string;
    faultCount: number;
    lastFault: {
      fault: string;
      timestamp: string;
      confidence: number;
      sensor_data: Record<string, number>;
    };
    averageSpeed: number;
    averageFuelRate: number;
    criticalMetrics: {
      highSpeedCount: number;
      highFuelRateCount: number;
      engineIssuesCount: number;
    };
  }>;
  trendAnalysis: {
    faultTrends: Array<{
      date: string;
      faultCount: number;
      avgConfidence: number;
    }>;
    sensorAverages: Record<string, number>;
  };
}

export async function GET() {
  try {
    // Get all NFTs with their VINs
    const { data: nfts } = await supabase
      .from('car_nfts')
      .select('vin, nfts');

    if (!nfts || nfts.length === 0) {
      return NextResponse.json({ error: 'No fleet data available' }, { status: 404 });
    }

    // Create a map of NFT IDs to VINs
    const nftToVin = new Map();
    nfts.forEach(({ vin, nfts: nftIds }) => {
      nftIds.split(',').forEach((id: string) => nftToVin.set(id.trim(), vin));
    });

    // Get all fault data
    const { data: carData } = await supabase
      .from('car_data')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!carData) {
      return NextResponse.json({ error: 'No fault data available' }, { status: 404 });
    }

    // Process data for fleet analytics
    const vehicleData = new Map();
    const faultDistribution: Record<string, number> = {};
    let totalConfidence = 0;
    let totalFaults = 0;

    carData.forEach(record => {
      const vin = nftToVin.get(record.unique_id);
      if (!vin) return;

      // Update fault distribution
      faultDistribution[record.fault] = (faultDistribution[record.fault] || 0) + 1;
      totalConfidence += record.confidence;
      totalFaults++;

      // Process vehicle-specific data
      if (!vehicleData.has(vin)) {
        vehicleData.set(vin, {
          vin,
          faultCount: 0,
          lastFault: null,
          totalSpeed: 0,
          speedReadings: 0,
          totalFuelRate: 0,
          fuelRateReadings: 0,
          criticalMetrics: {
            highSpeedCount: 0,
            highFuelRateCount: 0,
            engineIssuesCount: 0
          }
        });
      }

      const vehicleStats = vehicleData.get(vin);
      vehicleStats.faultCount++;

      // Update last fault if this is the most recent
      if (!vehicleStats.lastFault || new Date(record.timestamp) > new Date(vehicleStats.lastFault.timestamp)) {
        vehicleStats.lastFault = {
          fault: record.fault,
          timestamp: record.timestamp,
          confidence: record.confidence,
          sensor_data: record.sensor_data
        };
      }

      // Process sensor data
      if (record.sensor_data) {
        if (record.sensor_data.speed) {
          vehicleStats.totalSpeed += record.sensor_data.speed;
          vehicleStats.speedReadings++;
          if (record.sensor_data.speed > 120) { // High speed threshold
            vehicleStats.criticalMetrics.highSpeedCount++;
          }
        }
        if (record.sensor_data.fuel_rate) {
          vehicleStats.totalFuelRate += record.sensor_data.fuel_rate;
          vehicleStats.fuelRateReadings++;
          if (record.sensor_data.fuel_rate > 30) { // High fuel rate threshold
            vehicleStats.criticalMetrics.highFuelRateCount++;
          }
        }
        if (record.sensor_data.engine_load > 90 || record.sensor_data.coolant_temp > 100) {
          vehicleStats.criticalMetrics.engineIssuesCount++;
        }
      }
    });

    // Calculate fleet analytics
    const fleetAnalytics: FleetAnalytics = {
      fleetOverview: {
        totalVehicles: nfts.length,
        totalFaults,
        averageConfidence: totalFaults > 0 ? (totalConfidence / totalFaults) * 100 : 0,
        faultDistribution
      },
      vehicleStats: Array.from(vehicleData.values()).map(vehicle => ({
        vin: vehicle.vin,
        faultCount: vehicle.faultCount,
        lastFault: vehicle.lastFault,
        averageSpeed: vehicle.speedReadings > 0 ? vehicle.totalSpeed / vehicle.speedReadings : 0,
        averageFuelRate: vehicle.fuelRateReadings > 0 ? vehicle.totalFuelRate / vehicle.fuelRateReadings : 0,
        criticalMetrics: vehicle.criticalMetrics
      })),
      trendAnalysis: {
        faultTrends: processFaultTrends(carData),
        sensorAverages: calculateSensorAverages(carData)
      }
    };

    return NextResponse.json(fleetAnalytics);
  } catch (error) {
    console.error('Error fetching fleet analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet analytics' },
      { status: 500 }
    );
  }
}

function processFaultTrends(carData: any[]) {
  const dailyFaults = new Map();
  
  carData.forEach(record => {
    const date = record.timestamp.split(' ')[0];
    if (!dailyFaults.has(date)) {
      dailyFaults.set(date, { count: 0, totalConfidence: 0 });
    }
    const daily = dailyFaults.get(date);
    daily.count++;
    daily.totalConfidence += record.confidence;
  });

  return Array.from(dailyFaults.entries()).map(([date, data]) => ({
    date,
    faultCount: data.count,
    avgConfidence: (data.totalConfidence / data.count) * 100
  }));
}

function calculateSensorAverages(carData: any[]) {
  const sensorTotals: Record<string, { sum: number; count: number }> = {};
  
  carData.forEach(record => {
    if (record.sensor_data) {
      Object.entries(record.sensor_data).forEach(([sensor, value]) => {
        if (!sensorTotals[sensor]) {
          sensorTotals[sensor] = { sum: 0, count: 0 };
        }
        sensorTotals[sensor].sum += value as number;
        sensorTotals[sensor].count++;
      });
    }
  });

  const averages: Record<string, number> = {};
  Object.entries(sensorTotals).forEach(([sensor, { sum, count }]) => {
    averages[sensor] = count > 0 ? sum / count : 0;
  });

  return averages;
} 