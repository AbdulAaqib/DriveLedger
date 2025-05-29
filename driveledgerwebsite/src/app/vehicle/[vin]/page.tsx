import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

interface VehiclePageProps {
  params: {
    vin: string;
  };
}

export default function VehiclePage({ params }: VehiclePageProps) {
  const { vin } = params;

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        {/* Vehicle Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vehicle Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">VIN</label>
                  <p className="text-lg font-semibold">{vin}</p>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">Last Fault</label>
                  <p className="text-lg font-semibold">Engine Misfire</p>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">Confidence</label>
                  <p className="text-lg">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                      98%
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">Blockchain Token ID</label>
                  <p className="text-lg font-mono">#1234</p>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">IPFS Link</label>
                  <a 
                    href="#" 
                    className="text-primary hover:text-primary/80 block"
                  >
                    ipfs://Qm...
                  </a>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-muted-foreground">NFT Preview</label>
                  <div className="mt-2 w-32 h-32 bg-muted rounded flex items-center justify-center">
                    <p className="text-black dark:text-muted-foreground">NFT Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic History Timeline */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Diagnostic History</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">Engine Misfire</h3>
                      <p className="text-black dark:text-muted-foreground">Cylinder 2</p>
                    </div>
                    <div>
                      <p className="text-sm text-black dark:text-muted-foreground">Confidence</p>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                        98%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-black dark:text-muted-foreground">Timestamp</p>
                      <p>2024-03-20 14:30:00</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-black dark:text-muted-foreground">Key Sensors</p>
                      <p>RPM: 3200, Coolant: 90°C</p>
                    </div>
                    <div className="flex gap-4">
                      <a href="#" className="text-primary hover:text-primary/80">IPFS Link</a>
                      <a href="#" className="text-primary hover:text-primary/80">Etherscan</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sensor Graphs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Sensor Data</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <Button variant="secondary">RPM</Button>
                <Button variant="secondary">Speed</Button>
                <Button variant="secondary">Coolant Temp</Button>
                <Button variant="secondary">More...</Button>
              </div>
              <div className="h-96 bg-muted rounded flex items-center justify-center">
                <p className="text-muted-foreground">Interactive Graph Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
} 