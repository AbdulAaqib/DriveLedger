import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";
import { searchCarData } from "@/lib/api";
import { Suspense } from "react";

// Search Results Component
async function SearchResults({ query }: { query: string }) {
  const searchResults = await searchCarData(query);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold gradient-text">
        Search Results {searchResults.length > 0 && `(${searchResults.length})`}
      </h2>
      
      {searchResults.length === 0 ? (
        <Card className="glass-card p-6">
          <p className="text-center text-foreground">No results found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {searchResults.map((result) => (
            <Card key={result.unique_id} className="glass-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{result.fault}</h3>
                  <p className="text-sm text-foreground mb-4">ID: {result.unique_id}</p>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${result.confidence >= 90 ? 'bg-green-500/20 text-green-100' : 
                        result.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-100' : 
                        'bg-destructive/20 text-destructive-foreground'}`}>
                      Confidence: {result.confidence.toFixed(1)}%
                    </span>
                    <span className="text-sm text-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  href={`/vehicle/${result.unique_id}`}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VehiclePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  return (
    <main className="min-h-screen py-20">
      <div className="glass-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Vehicle Search</h1>
          
          {/* Search Form */}
          <form className="mb-12">
            <div className="flex gap-4">
              <Input
                type="text"
                name="search"
                placeholder="Search by VIN or fault description..."
                defaultValue={searchParams.search}
                className="glass-input flex-1"
              />
              <Button type="submit" className="glass-button">
                Search
              </Button>
            </div>
          </form>

          {/* Search Results with Suspense */}
          {searchParams.search ? (
            <Suspense fallback={
              <Card className="glass-card p-6">
                <p className="text-center text-foreground">Loading results...</p>
              </Card>
            }>
              <SearchResults query={searchParams.search} />
            </Suspense>
          ) : (
            <Card className="glass-card p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4 gradient-text">
                Search for Vehicle Data
              </h2>
              <p className="text-foreground mb-6">
                Enter a VIN number or fault description to search through our database.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" href="/fleet">
                  View Fleet Insights
                </Button>
                <Button variant="outline" href="/">
                  Back to Home
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
} 