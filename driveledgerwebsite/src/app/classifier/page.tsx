'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Image from 'next/image';
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
import { Bar, Line } from 'react-chartjs-2';

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

interface ClassifierStats {
  totalClassifications: number;
  accuracyRate: string;
  topFaults: Array<{
    fault: string;
    count: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    fault: string;
    confidence: number;
    accuracy: boolean;
  }>;
}

interface TrainingData {
  validationAccuracy: number[][];
  trainingAccuracy: number[][];
  trainingLoss: number[][];
  validationLoss: number[][];
}

export default function ClassifierPage() {
  const [stats, setStats] = useState<ClassifierStats | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch classifier statistics
        const statsResponse = await fetch('/api/classifier/stats');
        const statsData = await statsResponse.json();

        // Fetch training data
        const [validationAccuracy, trainingAccuracy, trainingLoss, validationLoss] = await Promise.all([
          fetch('/data/run_1_validation evaluation_accuracy_vs_iterations.json').then(res => res.json()),
          fetch('/data/run_1_train epoch_accuracy.json').then(res => res.json()),
          fetch('/data/run_1_train epoch loss.json').then(res => res.json()),
          fetch('/data/run_1_validation epoch loss.json').then(res => res.json())
        ]);

        setStats(statsData);
        setTrainingData({
          validationAccuracy,
          trainingAccuracy,
          trainingLoss,
          validationLoss
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const accuracyChartData = {
    labels: stats?.topFaults.map(f => f.fault) || [],
    datasets: [
      {
        label: 'Accuracy Rate (%)',
        data: stats?.topFaults.map(f => f.accuracy) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const confidenceDistributionData = {
    labels: ['90-100%', '80-90%', '70-80%', '60-70%', '<60%'],
    datasets: [
      {
        label: 'Number of Classifications',
        data: stats?.recentActivity.reduce((acc, curr) => {
          const confidence = curr.confidence * 100;
          if (confidence >= 90) acc[0]++;
          else if (confidence >= 80) acc[1]++;
          else if (confidence >= 70) acc[2]++;
          else if (confidence >= 60) acc[3]++;
          else acc[4]++;
          return acc;
        }, [0, 0, 0, 0, 0]) || [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',  // Green for highest confidence
          'rgba(34, 197, 94, 0.4)',  // Lighter green
          'rgba(234, 179, 8, 0.5)',  // Yellow
          'rgba(234, 179, 8, 0.4)',  // Lighter yellow
          'rgba(239, 68, 68, 0.5)',  // Red for lowest confidence
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Training metrics chart data
  const trainingMetricsData = {
    labels: trainingData?.validationAccuracy.map(point => point[1]) || [],
    datasets: [
      {
        label: 'Validation Accuracy',
        data: trainingData?.validationAccuracy.map(point => point[2]) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1
      },
      {
        label: 'Training Accuracy',
        data: trainingData?.trainingAccuracy.map(point => point[2]) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };

  const lossMetricsData = {
    labels: trainingData?.trainingLoss.map(point => point[1]) || [],
    datasets: [
      {
        label: 'Training Loss',
        data: trainingData?.trainingLoss.map(point => point[2]) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1
      },
      {
        label: 'Validation Loss',
        data: trainingData?.validationLoss.map(point => point[2]) || [],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading classifier data...</p>
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
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">AI Classifier Performance</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-muted-foreground">Total Classifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.totalClassifications || 0}</p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Total number of vehicle faults analyzed by our AI system</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-muted-foreground">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${
                  parseFloat(stats?.accuracyRate || '0') >= 85 ? 'text-green-700 dark:text-green-500' :
                  parseFloat(stats?.accuracyRate || '0') >= 70 ? 'text-yellow-700 dark:text-yellow-500' :
                  'text-red-700 dark:text-red-500'
                }`}>{stats?.accuracyRate || '0'}%</p>
                <p className="text-sm text-black dark:text-muted-foreground mt-2">Percentage of correct fault predictions made by the AI</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-muted-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.recentActivity.slice(0, 3).map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-black dark:text-foreground">{activity.fault}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activity.accuracy ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {(activity.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-black dark:text-muted-foreground mt-4">Latest fault predictions with confidence scores</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-black dark:text-muted-foreground mt-6">
            These metrics show the overall performance of our AI system in identifying vehicle faults. Higher accuracy and confidence scores indicate more reliable predictions.
          </p>
        </section>

        {/* Charts Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Fault Type Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-muted-foreground">Accuracy by Fault Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar
                      data={accuracyChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
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
                              color: 'text-black dark:text-foreground'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-black dark:text-muted-foreground mt-4">Accuracy rates broken down by different types of faults</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-muted-foreground">Confidence Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar
                      data={confidenceDistributionData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Classifications',
                              color: 'text-black dark:text-foreground'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-black dark:text-muted-foreground mt-4">Distribution of confidence scores across all predictions</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Training Metrics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-muted-foreground">Model Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line
                      data={trainingMetricsData}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 1,
                            title: {
                              display: true,
                              text: 'Accuracy',
                              color: 'text-black dark:text-foreground'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-black dark:text-muted-foreground mt-4">Training and validation accuracy over time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-muted-foreground">Loss Curves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line
                      data={lossMetricsData}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            title: {
                              display: true,
                              text: 'Loss',
                              color: 'text-black dark:text-foreground'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-black dark:text-muted-foreground mt-4">Training and validation loss over time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Model Analysis Section */}
        <section className="mt-16 mb-12">
          <h2 className="text-2xl font-bold mb-6">Model Analysis</h2>
          <p className="text-sm text-black dark:text-muted-foreground mb-6">
            Detailed analysis of how the AI model makes decisions and distributes its predictions across different fault types.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-muted-foreground">Confusion Matrix</CardTitle>
                <p className="text-sm text-black dark:text-muted-foreground">
                  This matrix shows how well the model distinguishes between different types of faults. Darker squares along the diagonal indicate better performance.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative h-[400px] w-full">
                  <Image
                    src="/data/confusion matrix.png"
                    alt="Confusion Matrix"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-muted-foreground">Parameter Distributions</CardTitle>
                <p className="text-sm text-black dark:text-muted-foreground">
                  These histograms show how the model&apos;s internal parameters are distributed, helping us understand its decision-making process.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-black dark:text-muted-foreground mb-2">Beta Distribution: Shows how the model weighs different input features</p>
                    <div className="relative h-[200px] w-full">
                      <Image
                        src="/data/beta histogram.png"
                        alt="Beta Distribution"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-muted-foreground mb-2">Bias Distribution: Shows the model&apos;s baseline predictions before considering input data</p>
                    <div className="relative h-[200px] w-full">
                      <Image
                        src="/data/bais histogram.png"
                        alt="Bias Distribution"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
} 