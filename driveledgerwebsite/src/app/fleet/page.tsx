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
  Colors,
  ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
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

export default function FleetPage() {
  const [fleetData, setFleetData] = useState<FleetAnalytics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('engine_load');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/fleet/overview');
        if (!response.ok) throw new Error('Failed to fetch fleet data');
        const data = await response.json();
        setFleetData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredVehicles = fleetData?.vehicleStats.filter(vehicle => 
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const faultTrendData = {
    labels: fleetData?.trendAnalysis.faultTrends.map(trend => trend.date) || [],
    datasets: [
      {
        label: 'Number of Faults',
        data: fleetData?.trendAnalysis.faultTrends.map(trend => trend.faultCount) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Average Confidence (%)',
        data: fleetData?.trendAnalysis.faultTrends.map(trend => trend.avgConfidence) || [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const faultDistributionData = {
    labels: Object.keys(fleetData?.fleetOverview.faultDistribution || {}),
    datasets: [{
      label: 'Fault Distribution',
      data: Object.values(fleetData?.fleetOverview.faultDistribution || {}),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 159, 64, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
      ],
      borderColor: [
        'rgb(75, 192, 192)',
        'rgb(255, 159, 64)',
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
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
    <main className="py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Fleet Overview */}
        <section className="mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Fleet Overview</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base text-black dark:text-muted-foreground">Total Vehicles</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">{fleetData?.fleetOverview.totalVehicles || 0}</p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Total number of vehicles in the fleet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base text-black dark:text-muted-foreground">Total Faults</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">{fleetData?.fleetOverview.totalFaults || 0}</p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Total faults detected across all vehicles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base text-black dark:text-muted-foreground">Average Confidence</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className={`text-3xl font-bold ${
                  (fleetData?.fleetOverview.averageConfidence || 0) >= 85 ? 'text-green-700 dark:text-green-500' :
                  (fleetData?.fleetOverview.averageConfidence || 0) >= 70 ? 'text-yellow-700 dark:text-yellow-500' :
                  'text-red-700 dark:text-red-500'
                }`}>
                  {(fleetData?.fleetOverview.averageConfidence || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Average confidence score of fault predictions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base text-black dark:text-muted-foreground">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold text-red-700 dark:text-red-500">
                  {fleetData?.vehicleStats.reduce((sum, vehicle) => 
                    sum + vehicle.criticalMetrics.engineIssuesCount, 0) || 0}
                </p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Number of critical issues requiring attention</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trend Analysis */}
        <section className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Fault Trends</h2>
          <Card>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <Line
                  data={faultTrendData}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    scales: {
                      y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: 'Number of Faults'
                        }
                      },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        grid: {
                          drawOnChartArea: false,
                        },
                        title: {
                          display: true,
                          text: 'Confidence (%)'
                        }
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fault Distribution */}
        <section className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Fault Distribution</h2>
          <Card>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <Bar
                  data={faultDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vehicle Table */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Vehicle Details</h2>
            <Input
              type="search"
              placeholder="Search VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[300px]"
            />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black dark:text-foreground">VIN</TableHead>
                      <TableHead className="text-black dark:text-foreground">Faults</TableHead>
                      <TableHead className="text-black dark:text-foreground">Last Fault</TableHead>
                      <TableHead className="text-black dark:text-foreground">Avg Speed</TableHead>
                      <TableHead className="text-black dark:text-foreground">Critical Issues</TableHead>
                      <TableHead className="text-black dark:text-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.vin}>
                        <TableCell className="font-medium text-black dark:text-foreground">{vehicle.vin}</TableCell>
                        <TableCell className="text-black dark:text-foreground">{vehicle.faultCount}</TableCell>
                        <TableCell>
                          {vehicle.lastFault && (
                            <div>
                              <span className="block text-black dark:text-foreground">{vehicle.lastFault.fault}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                vehicle.lastFault.confidence > 0.8 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                vehicle.lastFault.confidence > 0.5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {(vehicle.lastFault.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-black dark:text-foreground">
                          {vehicle.averageSpeed.toFixed(1)} mph
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            vehicle.criticalMetrics.engineIssuesCount > 0 ? 
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {vehicle.criticalMetrics.engineIssuesCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" href={`/nft/${vehicle.vin}`}>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}