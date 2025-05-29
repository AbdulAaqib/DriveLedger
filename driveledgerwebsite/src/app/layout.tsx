import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Linkedin } from "lucide-react";

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
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="text-xl font-bold text-foreground">
                  DriveLedger
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/vehicle" className="text-sm font-medium text-foreground/80 hover:text-primary">
                    Search Vehicle
                  </Link>
                  <Link href="/fleet" className="text-sm font-medium text-foreground/80 hover:text-primary">
                    Fleet
                  </Link>
                  <Link href="/classifier" className="text-sm font-medium text-foreground/80 hover:text-primary">
                    AI Classifier
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link 
                      href="https://github.com/AbdulAaqib/DriveLedger"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/80 hover:text-primary"
                    >
                      <Github className="h-5 w-5" />
                    </Link>
                    <Link 
                      href="https://www.linkedin.com/in/abdulaaqib/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/80 hover:text-primary"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                    <div className="bg-background/20 backdrop-blur-[4px] border border-border/50 shadow-sm px-2 py-1 rounded-full">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen pt-16">{children}</main>

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
                  <h3 className="font-bold text-lg mb-4 gradient-text">Connect</h3>
                  <div className="flex flex-col space-y-4">
                    <Link 
                      href="https://github.com/AbdulAaqib/DriveLedger"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub Repository</span>
                    </Link>
                    <Link 
                      href="https://www.linkedin.com/in/abdulaaqib/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>Connect on LinkedIn</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 text-center text-foreground/80">
                <p>Made by Abdul Aaqib Ali Abdul Aasik Ali 2025</p>
                <p className="mt-2">© 2025 DriveLedger. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
