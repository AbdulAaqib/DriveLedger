import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FleetPage() {
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
                <p className="text-4xl font-bold">1,234</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Most Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">Engine Misfire (23%)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Average Fault Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">94%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* VIN Table */}
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
                    <TableHead>Faults</TableHead>
                    <TableHead>Last Fault</TableHead>
                    <TableHead>NFT Minted?</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((item) => (
                    <TableRow key={item}>
                      <TableCell className="font-medium">1HGCM82633A123456</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>Engine Misfire (2h ago)</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          Yes
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" href={`/vehicle/1HGCM82633A123456`}>
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