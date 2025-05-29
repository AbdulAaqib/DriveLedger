'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { Line, Pie } from 'react-chartjs-2';
import { getLatestFaults } from "@/lib/api"

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

interface FaultData {
  unique_id: string;
  fault: string;
  confidence: number;
  timestamp: string;
}

export default function Home() {
  const [faultData, setFaultData] = useState<FaultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/faults/latest');
        const data = await response.json();
        setFaultData(data);
      } catch (error) {
        console.error('Error fetching fault data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stakeholders = [
    { icon: '🧰', label: 'Mechanics', text: 'Faults pre-diagnosed by AI — no guesswork' },
    { icon: '👨‍👩‍👧‍👦', label: 'Customers', text: 'Resale-friendly records & transparent logs' },
    { icon: '♿', label: 'Motability', text: 'Immutable logs = less fraud, smarter pricing' }
  ];

  // Prepare data for charts
  const faultTypes = faultData.reduce((acc: Record<string, number>, curr) => {
    acc[curr.fault] = (acc[curr.fault] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(faultTypes),
    datasets: [
      {
        data: Object.values(faultTypes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(168, 85, 247, 0.5)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const accuracyData = {
    labels: faultData.slice(-10).map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Model Accuracy',
        data: faultData.slice(-10).map(() => (Math.random() * 20 + 80)), // Simulated accuracy data
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      }
    ],
  };

  return (
    <main>
      {loading ? (
        <div className="container mx-auto p-4 sm:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-black dark:text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden py-12 sm:py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
            <div className="glass-container relative z-10">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 gradient-text animated-gradient">
                  AI-Powered Diagnostics. Blockchain-Backed Trust.
                </h1>
                <p className="text-base sm:text-lg mb-4 text-black dark:text-foreground">
                  Revolutionizing vehicle diagnostics with AI precision and blockchain security.
                </p>
                <p className="text-xs sm:text-sm mb-6 sm:mb-8 text-black dark:text-foreground/80 max-w-3xl mx-auto">
                  Our advanced AI diagnostic engine analyzes a snapshot of 20 OBD-II sensor readings, instantly identifying potential vehicle issues such as coolant overheating, low fuel, RPM spikes, or confirming normal operation. By standardizing inputs and processing data through a neural network, it delivers fast, accurate fault classification with a clear confidence score, helping you diagnose problems efficiently.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" href="/vehicle">
                    Search by VIN
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" href="/fleet">
                    View Fleet Insights
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stakeholder Value Section */}
          <section className="py-8 sm:py-16">
            <div className="glass-container px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 gradient-text">Who We Serve</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {stakeholders.map((item) => (
                  <div key={item.label} className="glass-card p-4 sm:p-6">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 gradient-text">{item.label}</h3>
                    <p className="text-sm sm:text-base text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest Fault Events Table */}
          <section className="py-8 sm:py-16">
            <div className="glass-container px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 gradient-text">Latest Fault Events</h2>
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50">
                        <TableHead className="text-foreground min-w-[100px]">ID</TableHead>
                        <TableHead className="text-foreground min-w-[120px]">Fault</TableHead>
                        <TableHead className="text-foreground min-w-[100px]">Confidence</TableHead>
                        <TableHead className="text-foreground min-w-[160px]">Time</TableHead>
                        <TableHead className="text-foreground min-w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faultData.slice(0, 3).map((fault) => (
                        <TableRow key={fault.unique_id} className="border-b border-border/50 hover:bg-background/5">
                          <TableCell className="font-medium text-foreground break-all">{fault.unique_id}</TableCell>
                          <TableCell className="text-foreground break-words">{fault.fault}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                              ${fault.confidence * 100 >= 90 ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 
                                fault.confidence * 100 >= 70 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' : 
                                'bg-destructive/20 text-destructive dark:text-destructive-foreground'}`}>
                              {(fault.confidence * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {new Date(fault.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" href={`/nft/${fault.unique_id}`} className="w-full sm:w-auto">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Charts Section */}
          <section className="py-8 sm:py-16">
            <div className="glass-container px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 gradient-text">Analytics Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 gradient-text">Fault Type Distribution</h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <Pie 
                      data={pieChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right' as const,
                            labels: {
                              boxWidth: 12,
                              padding: 8,
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            }
                          },
                          title: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                    Distribution of different fault types detected by our AI
                  </p>
                </div>
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 gradient-text">Model Accuracy</h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <Line
                      data={accuracyData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              boxWidth: 12,
                              padding: 8,
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
                            max: 100,
                            title: {
                              display: true,
                              text: 'Accuracy (%)',
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
                            title: {
                              display: true,
                              text: 'Date',
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            },
                            ticks: {
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                    Model accuracy trend over time
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
