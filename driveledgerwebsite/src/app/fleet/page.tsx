'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

interface FleetStats {
  totalVehicles: number;
  mostCommonFault: {
    fault: string;
    percentage: string;
  } | null;
  averageConfidence: string;
}

interface VehicleData {
  vin: string;
  faultCount: number;
  lastFault: {
    fault: string;
    timestamp: string;
    confidence: number;
    sensor_data: Record<string, number>;
  } | null;
}

export default function FleetPage() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [fleetData, setFleetData] = useState<VehicleData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('engine_load');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fleet statistics
        const statsData = await fetch('/api/fleet/stats').then(res => {
          if (!res.ok) throw new Error('Failed to fetch fleet statistics');
          return res.json();
        });

        // Fetch fleet overview
        const fleetOverview = await fetch('/api/fleet/overview').then(res => {
          if (!res.ok) throw new Error('Failed to fetch fleet overview');
          return res.json();
        });

        setStats(statsData);
        setFleetData(fleetOverview);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for charts
  const processChartData = () => {
    if (!fleetData || fleetData.length === 0) return null;

    const allSensorData = fleetData.flatMap(vehicle => 
      vehicle.lastFault?.sensor_data ? [vehicle.lastFault.sensor_data] : []
    );

    // Get all available metrics from the first data point
    const availableMetrics = allSensorData.length > 0 
      ? Object.keys(allSensorData[0])
      : [];

    // Calculate average values for each metric
    const metricAverages = availableMetrics.reduce((acc, metric) => {
      const values = allSensorData
        .map(data => data[metric])
        .filter(val => val !== undefined);
      
      acc[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      availableMetrics,
      metricAverages
    };
  };

  const chartData = processChartData();

  const metricBarData = {
    labels: fleetData.map(v => v.vin.slice(-6)),
    datasets: [{
      label: selectedMetric.replace(/_/g, ' ').toUpperCase(),
      data: fleetData
        .filter(v => v.lastFault && v.lastFault.sensor_data && selectedMetric in v.lastFault.sensor_data)
        .map(v => v.lastFault!.sensor_data[selectedMetric]),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };

  const faultDistributionData = {
    labels: ['High Confidence', 'Medium Confidence', 'Low Confidence'],
    datasets: [{
      label: 'Fault Distribution by Confidence',
      data: [
        fleetData.filter(v => v.lastFault && v.lastFault.confidence > 0.8).length,
        fleetData.filter(v => v.lastFault && v.lastFault.confidence > 0.5 && v.lastFault.confidence <= 0.8).length,
        fleetData.filter(v => v.lastFault && v.lastFault.confidence <= 0.5).length,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.5)',
        'rgba(234, 179, 8, 0.5)',
        'rgba(239, 68, 68, 0.5)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        {/* Global Stats */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-8">Fleet Insights</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Vehicles Monitored</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.totalVehicles || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Most Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">
                  {stats?.mostCommonFault ? 
                    `${stats.mostCommonFault.fault} (${stats.mostCommonFault.percentage}%)` :
                    'No faults recorded'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Average Fault Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.averageConfidence || 0}%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet-wide Sensor Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select 
                  value={selectedMetric} 
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartData?.availableMetrics.map(metric => (
                      <SelectItem key={metric} value={metric}>
                        {metric.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px]">
                <Bar 
                  data={metricBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fault Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar 
                  data={faultDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vehicle Table */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Vehicle Overview</h2>
            <div className="flex gap-4">
              <Input
                type="search"
                placeholder="Search VIN..."
                className="max-w-[300px]"
              />
              <Button variant="secondary">Filter</Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Total Faults</TableHead>
                    <TableHead>Last Fault</TableHead>
                    <TableHead>Last Confidence</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetData.map((vehicle) => (
                    <TableRow key={vehicle.vin}>
                      <TableCell className="font-medium">{vehicle.vin}</TableCell>
                      <TableCell>{vehicle.faultCount}</TableCell>
                      <TableCell>
                        {vehicle.lastFault ? 
                          `${vehicle.lastFault.fault} (${new Date(vehicle.lastFault.timestamp).toLocaleString()})` :
                          'No faults'}
                      </TableCell>
                      <TableCell>
                        {vehicle.lastFault && (
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            vehicle.lastFault.confidence > 0.8 ? 
                              'bg-green-100 text-green-700' : 
                              vehicle.lastFault.confidence > 0.5 ?
                                'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                          }`}>
                            {(vehicle.lastFault.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" href={`/vehicle/${vehicle.vin}`}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Export Data */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Export Data</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
} 