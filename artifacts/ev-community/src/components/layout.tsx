import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/gems-logo.png" alt="GEMS" className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/owners" className="text-muted-foreground hover:text-foreground">Owners</Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
            <Link href="/gallery" className="text-muted-foreground hover:text-foreground">Gallery</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            {currentUser ? (
              <>
                <Link href="/dashboard" className="text-sm">Dashboard</Link>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm">Login</Link>
                <Button onClick={() => setLocation("/register")}>Join GEMS</Button>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/owners" className="text-muted-foreground hover:text-foreground">Owners</Link>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
                  <Link href="/gallery" className="text-muted-foreground hover:text-foreground">Gallery</Link>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
                  {currentUser ? (
                    <>
                      <Link href="/dashboard" className="text-sm">Dashboard</Link>
                      <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-sm">Login</Link>
                      <Button onClick={() => setLocation("/register")}>Join GEMS</Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
