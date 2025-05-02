import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            AutoRFP
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link 
              href="#platform" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Platform
            </Link>
            <Link 
              href="#solutions" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Solutions
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link 
              href="#ai" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              AutoRFP AI
            </Link>
            <Link 
              href="#resources" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Resources
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Log in
          </Button>
          <Button size="sm">
            Request demo
          </Button>
        </div>
      </div>
    </header>
  );
} 