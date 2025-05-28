import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriveLedger - Trusted Vehicle Insights",
  description: "AI-Powered Diagnostics with Blockchain-Backed Trust",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-background via-background/90 to-background/80`}>
        <ThemeProvider>
          {/* Glassmorphic Navigation */}
          <nav className="glass-nav">
            <div className="glass-container">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="font-bold text-xl gradient-text animated-gradient">
                  DriveLedger
                </Link>
                <div className="flex items-center gap-6">
                  <div className="flex gap-6">
                    <Link href="/" className="nav-link">
                      Home
                    </Link>
                    <Link href="/vehicle" className="nav-link">
                      Search Vehicle
                    </Link>
                    <Link href="/fleet" className="nav-link">
                      Fleet Insights
                    </Link>
                  </div>
                  <div className="bg-background/20 backdrop-blur-[4px] border border-border/50 shadow-sm px-2 py-1 rounded-full">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen pt-20">{children}</main>

          {/* Glassmorphic Footer */}
          <footer className="bg-background/20 backdrop-blur-[4px] border-t border-border/50 shadow-sm mt-20">
            <div className="glass-container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-4 gradient-text">DriveLedger</h3>
                  <p className="text-foreground/80">
                    AI-Powered Diagnostics with Blockchain-Backed Trust
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-4 gradient-text">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="nav-link">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/vehicle" className="nav-link">
                        Search Vehicle
                      </Link>
                    </li>
                    <li>
                      <Link href="/fleet" className="nav-link">
                        Fleet Insights
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-4 gradient-text">Contact</h3>
                  <p className="text-foreground/80 mb-2">
                    Have questions? Get in touch with our team.
                  </p>
                  <a 
                    href="mailto:info@driveledger.com" 
                    className="inline-block glass-button mt-2"
                  >
                    info@driveledger.com
                  </a>
                </div>
              </div>
              <div className="mt-8 pt-8 text-center text-foreground">
                © {new Date().getFullYear()} DriveLedger. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
