import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLatestFaults } from "@/lib/api"

export default async function Home() {
  // Fetch latest fault data
  const faultData = await getLatestFaults(3);

  const stakeholders = [
    { icon: '🧰', label: 'Mechanics', text: 'Faults pre-diagnosed by AI — no guesswork' },
    { icon: '👨‍👩‍👧‍👦', label: 'Customers', text: 'Resale-friendly records & transparent logs' },
    { icon: '♿', label: 'Motability', text: 'Immutable logs = less fraud, smarter pricing' }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
        <div className="glass-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 gradient-text animated-gradient">
              AI-Powered Diagnostics. Blockchain-Backed Trust.
            </h1>
            <p className="text-lg mb-8 text-foreground">
              Revolutionizing vehicle diagnostics with AI precision and blockchain security.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="default" size="lg" href="/vehicle">
                Search by VIN
              </Button>
              <Button variant="outline" size="lg" href="/fleet">
                View Fleet Insights
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Value Section */}
      <section className="py-16">
        <div className="glass-container">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stakeholders.map((item) => (
              <div key={item.label} className="glass-card p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2 gradient-text">{item.label}</h3>
                <p className="text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Fault Events Table */}
      <section className="py-16">
        <div className="glass-container">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Latest Fault Events</h2>
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead className="text-foreground">ID</TableHead>
                  <TableHead className="text-foreground">Fault</TableHead>
                  <TableHead className="text-foreground">Confidence</TableHead>
                  <TableHead className="text-foreground">Time</TableHead>
                  <TableHead className="text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faultData.map((fault) => (
                  <TableRow key={fault.unique_id} className="border-b border-border/50 hover:bg-background/5">
                    <TableCell className="font-medium text-foreground">{fault.unique_id}</TableCell>
                    <TableCell className="text-foreground">{fault.fault}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${fault.confidence >= 90 ? 'bg-green-500/20 text-green-100' : 
                          fault.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-100' : 
                          'bg-destructive/20 text-destructive-foreground'}`}>
                        {fault.confidence.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {new Date(fault.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" href={`/vehicle/${fault.unique_id}`}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Visual Charts Section */}
      <section className="py-16">
        <div className="glass-container">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 gradient-text">Fault Type Breakdown</h3>
              <div className="h-64 flex items-center justify-center bg-background/5 rounded-lg backdrop-blur-sm">
                <p className="text-foreground">Pie Chart Coming Soon</p>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 gradient-text">Sensor Trends Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-background/5 rounded-lg backdrop-blur-sm">
                <p className="text-foreground">Line Chart Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
