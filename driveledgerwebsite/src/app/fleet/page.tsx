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
import { Bar } from 'react-chartjs-2';

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

        console.log('Fleet Stats:', statsData);
        console.log('Fleet Overview:', fleetOverview);

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
    if (!fleetData || fleetData.length === 0) {
      console.log('No fleet data available');
      return {
        availableMetrics: [],
        metricAverages: {}
      };
    }

    // Get all sensor data that exists
    const allSensorData = fleetData
      .filter(vehicle => {
        const hasSensorData = vehicle.lastFault?.sensor_data;
        if (!hasSensorData) {
          console.log('Vehicle missing sensor data:', vehicle.vin);
        }
        return hasSensorData;
      })
      .map(vehicle => vehicle.lastFault!.sensor_data);

    console.log('All sensor data:', allSensorData);

    if (allSensorData.length === 0) {
      console.log('No sensor data found in any vehicle');
      return {
        availableMetrics: [],
        metricAverages: {}
      };
    }

    // Get all available metrics from the first data point
    const availableMetrics = Object.keys(allSensorData[0] || {});
    console.log('Available metrics:', availableMetrics);

    // Calculate average values for each metric
    const metricAverages = availableMetrics.reduce((acc, metric) => {
      const values = allSensorData
        .map(data => data[metric])
        .filter(val => val !== undefined && val !== null);
      
      acc[metric] = values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
      return acc;
    }, {} as Record<string, number>);

    console.log('Metric averages:', metricAverages);

    return {
      availableMetrics,
      metricAverages
    };
  };

  const chartData = processChartData();
  console.log('Chart data:', chartData);

  const metricBarData = {
    labels: fleetData
      .filter(v => v.lastFault?.sensor_data && v.lastFault.sensor_data[selectedMetric] !== undefined)
      .map(v => v.vin.slice(-6)),
    datasets: [{
      label: selectedMetric.replace(/_/g, ' ').toUpperCase(),
      data: fleetData
        .filter(v => v.lastFault?.sensor_data && v.lastFault.sensor_data[selectedMetric] !== undefined)
        .map(v => v.lastFault!.sensor_data[selectedMetric]),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };
  console.log('Metric bar data:', metricBarData);

  const faultDistributionData = {
    labels: ['High Confidence (>80%)', 'Medium Confidence (50-80%)', 'Low Confidence (<50%)'],
    datasets: [{
      label: 'Number of Faults',
      data: [
        fleetData.filter(v => v.lastFault?.confidence && v.lastFault.confidence > 0.8).length,
        fleetData.filter(v => v.lastFault?.confidence && v.lastFault.confidence > 0.5 && v.lastFault.confidence <= 0.8).length,
        fleetData.filter(v => v.lastFault?.confidence && v.lastFault.confidence <= 0.5).length,
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
  console.log('Fault distribution data:', faultDistributionData);

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
        {/* Global Stats */}
        <section className="mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Fleet Insights</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-muted-foreground">Vehicles Monitored</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-3xl sm:text-4xl font-bold">{stats?.totalVehicles || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-muted-foreground">Most Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-lg sm:text-xl break-words">
                  {stats?.mostCommonFault ? 
                    `${stats.mostCommonFault.fault} (${stats.mostCommonFault.percentage}%)` :
                    'No faults recorded'}
                </p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-muted-foreground">Average Fault Confidence</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-3xl sm:text-4xl font-bold">{stats?.averageConfidence || 0}%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-6 sm:mb-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Fleet-wide Sensor Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <Select 
                  value={selectedMetric} 
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
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
              <div className="h-[250px] sm:h-[300px]">
                {metricBarData.labels.length > 0 ? (
                  <Bar 
                    data={metricBarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: selectedMetric.replace(/_/g, ' ').toUpperCase(),
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm sm:text-base">No sensor data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Fault Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-[250px] sm:h-[300px]">
                {faultDistributionData.datasets[0].data.some(d => d > 0) ? (
                  <Bar 
                    data={faultDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Faults',
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm sm:text-base">No fault data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vehicle Table */}
        <section className="mb-6 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Vehicle Overview</h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
              <Input
                type="search"
                placeholder="Search VIN..."
                className="w-full sm:w-[200px] lg:w-[300px]"
              />
              <Button variant="secondary" className="w-full sm:w-auto">Filter</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">VIN</TableHead>
                      <TableHead className="min-w-[100px]">Total Faults</TableHead>
                      <TableHead className="min-w-[200px]">Last Fault</TableHead>
                      <TableHead className="min-w-[120px]">Last Confidence</TableHead>
                      <TableHead className="min-w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fleetData.map((vehicle) => (
                      <TableRow key={vehicle.vin}>
                        <TableCell className="font-medium">{vehicle.vin}</TableCell>
                        <TableCell>{vehicle.faultCount}</TableCell>
                        <TableCell className="break-words">
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
                          <Button variant="outline" size="sm" href={`/vehicle/${vehicle.vin}`} className="w-full sm:w-auto">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Export Data */}
        <section>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Export Data</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Select>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full sm:w-auto">Export Data</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
} 