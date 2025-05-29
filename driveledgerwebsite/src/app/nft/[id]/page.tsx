import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getOpenSeaNftUrl } from '@/app/utils/nft';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface IPFSDisplayData {
  name?: string;
  description?: string;
  image?: string;
}

function formatSelectedIPFSData(data: JSONValue): IPFSDisplayData | null {
  if (!data || typeof data !== 'object') return null;
  const ipfsData = data as Record<string, JSONValue>;
  
  return {
    name: typeof ipfsData.name === 'string' ? ipfsData.name : undefined,
    description: typeof ipfsData.description === 'string' ? ipfsData.description : undefined,
    image: typeof ipfsData.image === 'string' ? ipfsData.image : undefined,
  };
}

interface SensorData {
  [key: string]: number | string | boolean | null | Record<string, unknown>;
}

function formatSensorData(data: SensorData) {
  if (!data) return null;

  const metricRanges = {
    engine_load: { min: 0, max: 85, unit: '%' },
    fuel_pressure: { min: 30, max: 60, unit: 'psi' },
    intake_manifold_pressure: { min: 70, max: 105, unit: 'kPa' },
    vehicle_speed: { min: 0, max: 120, unit: 'mph' },
    ignition_timing_advance: { min: 5, max: 25, unit: '°' },
    intake_air_temp: { min: -10, max: 60, unit: '°C' },
    mass_air_flow: { min: 2, max: 200, unit: 'g/s' },
    throttle_position: { min: 0, max: 100, unit: '%' },
    engine_run_time: { min: 0, max: Infinity, unit: 'min' },
    fuel_level: { min: 10, max: 90, unit: '%' },
    warmups_since_clear: { min: 3, max: Infinity, unit: 'cycles' },
    barometric_pressure: { min: 90, max: 110, unit: 'kPa' },
    ambient_air_temp: { min: -30, max: 50, unit: '°C' },
    commanded_throttle: { min: 0, max: 100, unit: '%' },
    time_mil_on: { min: 0, max: 0, unit: 'min' },
    time_since_codes_cleared: { min: 0, max: Infinity, unit: 'min' },
    hybrid_battery_life: { min: 50, max: 100, unit: '%' },
    fuel_rate: { min: 0.5, max: 50, unit: 'L/h' }
  };

  const categories = {
    engine: ['engine_load', 'fuel_pressure', 'intake_manifold_pressure', 'ignition_timing_advance', 'mass_air_flow', 'engine_run_time'],
    transmission: ['vehicle_speed', 'throttle_position', 'commanded_throttle'],
    electrical: ['hybrid_battery_life'],
    sensors: ['intake_air_temp', 'ambient_air_temp', 'barometric_pressure'],
    fuel: ['fuel_level', 'fuel_rate'],
    diagnostic: ['warmups_since_clear', 'time_mil_on', 'time_since_codes_cleared']
  };

  const categorizedData: Record<string, SensorData> = {
    engine: {},
    transmission: {},
    electrical: {},
    sensors: {},
    fuel: {},
    diagnostic: {},
    other: {}
  };

  Object.entries(data).forEach(([key, value]) => {
    let categorized = false;
    for (const [category, keys] of Object.entries(categories)) {
      if (keys.some(k => key.toLowerCase().includes(k))) {
        categorizedData[category][key] = value;
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categorizedData.other[key] = value;
    }
  });

  function getValueColor(key: string, value: number): string {
    const range = metricRanges[key.toLowerCase().replace(/_/g, '_') as keyof typeof metricRanges];
    if (!range) return 'text-primary';

    if (value < range.min) return 'text-red-500';
    if (value > range.max) return 'text-red-500';
    
    // Calculate how close to the edges of the range
    const rangeSize = range.max - range.min;
    const position = (value - range.min) / rangeSize;
    
    if (position <= 0.2 || position >= 0.8) {
      return 'text-yellow-500'; // Warning zone
    }
    return 'text-green-500'; // Good zone
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(categorizedData).map(([category, values]) => {
        if (Object.keys(values).length === 0) return null;
        
        return (
          <div key={category} className="card-highlight p-6">
            <h3 className="text-lg font-semibold capitalize gradient-text mb-4">{category}</h3>
            <div className="space-y-2">
              {Object.entries(values).map(([key, value]) => {
                const metricKey = key.toLowerCase().replace(/_/g, '_') as keyof typeof metricRanges;
                const unit = metricRanges[metricKey]?.unit || '';
                const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value);

                return (
                  <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/5 hover:bg-white/10 dark:hover:bg-black/10 transition-colors">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${typeof value === 'number' ? getValueColor(key, value) : 'text-primary'}`}>
                        {displayValue}
                      </span>
                      {unit && (
                        <span className="text-sm text-muted-foreground">
                          {unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatFaultName(fault: string): string {
  const faultMappings: { [key: string]: string } = {
    'coolant_overheat': 'Coolant Overheat',
    'fuel_low': 'Fuel Low',
    'rpm_spike': 'RPM Spike',
    'speed_high': 'Speed High',
    'throttle_stuck': 'Throttle Stuck',
    'intake_temp_high': 'Intake Temp High',
    'air_flow_low': 'Air Flow Low',
    'barometric_low': 'Barometric Low',
    'ambient_high': 'Ambient High',
    'fuel_rate_high': 'Fuel Rate High'
  };

  return faultMappings[fault] || fault.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function getNFTData(id: string) {
  try {
    // Get the protocol and host for both local and production environments
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/nft/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch NFT data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    throw error;
  }
}

export default async function NFTPage({ params }: { params: { id: string } }) {
  const data = await getNFTData(params.id);

  if (!data || !data.nftData) {
    notFound();
  }

  const { nftData, ipfsData } = data;
  const selectedIPFSData = formatSelectedIPFSData(ipfsData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background/80">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link 
            href="/vehicle" 
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span>←</span>
            <span>Back to Search</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* NFT Image and Details Card */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="border-b border-white/10 dark:border-white/5">
              <CardTitle className="text-3xl font-bold gradient-text">
                {selectedIPFSData?.name || `NFT #${params.id}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {selectedIPFSData?.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-white/10 dark:border-white/5">
                  <Image
                    src={selectedIPFSData.image}
                    alt={selectedIPFSData.name || 'NFT Image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              )}
              
              <div className="space-y-4">
                {selectedIPFSData?.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-primary">Description</h3>
                    <p className="text-lg">{selectedIPFSData.description}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <a 
                    href={getOpenSeaNftUrl(params.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-lg">Open on</span>
                    <Image
                      src="/OpenSea-Full-Logo (dark).png"
                      alt="OpenSea"
                      width={120}
                      height={32}
                      className="object-contain dark:invert"
                    />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Data Card */}
          <Card className="glass-card">
            <CardHeader className="border-b border-white/10 dark:border-white/5">
              <CardTitle className="text-2xl font-bold gradient-text">Vehicle Data</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-primary">Timestamp</h3>
                  <p className="text-lg">{new Date(nftData.timestamp).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-primary">Fault</h3>
                  <p className="text-lg font-semibold">{formatFaultName(nftData.fault)}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-primary">AI Confidence Diagnosis</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                          {(nftData.confidence * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-primary/10">
                      <div
                        style={{ width: `${nftData.confidence * 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                          nftData.confidence * 100 >= 90 ? 'bg-green-500' :
                          nftData.confidence * 100 >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensor Data Card */}
        {nftData.sensor_data && (
          <Card className="glass-card">
            <CardHeader className="border-b border-white/10 dark:border-white/5">
              <CardTitle className="text-2xl font-bold gradient-text">Sensor Data</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {formatSensorData(nftData.sensor_data)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 