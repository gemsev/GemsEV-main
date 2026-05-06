import { useGetDashboardStats } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarModelLabel } from "@/lib/car-models";

const FEATURES = [
  { href: "/blog", label: "Community Blog", description: "Read and share EV stories" },
  { href: "/cpo", label: "CPO Contacts", description: "Find charging point operators" },
  { href: "/gallery", label: "Gallery", description: "Community photo gallery" },
  { href: "/range", label: "Range Calculator", description: "Estimate your EV's range" },
  { href: "/faq", label: "AI FAQ", description: "Ask anything about your EV" },
  { href: "/accessories", label: "Accessories", description: "Discover EV accessories & sellers" },
  { href: "/owners", label: "Owner Directory", description: "Browse all verified EV owners" },
  { href: "/profile", label: "My Profile", description: "Edit your details and settings" },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const [, setLocation] = useLocation();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">You must be logged in to view the dashboard.</p>
        <Button onClick={() => setLocation("/login")}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">Welcome back, {currentUser.name?.split(" ")[0]}</h1>
          {currentUser.role === "admin" && <Badge variant="secondary" className="text-xs">Admin</Badge>}
        </div>
        <p className="text-muted-foreground">
          {currentUser.evCarsOwned?.map(getCarModelLabel).join(", ") || "EV Owner"} - {currentUser.city || currentUser.areaOfStay}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Verified Owners", value: stats.totalOwners },
            { label: "Blog Posts", value: stats.totalBlogPosts },
            { label: "Charging Points", value: stats.totalCpos },
            { label: "Gallery Photos", value: stats.totalGalleryItems },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {FEATURES.map(({ href, label, description }) => (
          <div key={href} className="group bg-card border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all h-full flex flex-col">
            <h3 className="font-semibold group-hover:text-primary transition-colors">{label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href={href}>Open</Link>
            </Button>
          </div>
        ))}
      </div>

      {currentUser.role === "admin" && stats && stats.pendingRegistrations > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">{stats.pendingRegistrations} Pending Registration{stats.pendingRegistrations > 1 ? "s" : ""}</p>
            <p className="text-sm text-muted-foreground">Review and approve new member applications</p>
          </div>
          <Button variant="outline" asChild className="border-amber-500/50">
            <Link href="/admin">Review</Link>
          </Button>
        </div>
      )}

      {stats && stats.carModelBreakdown.length > 0 && (
        <div className="mt-8 bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Community Cars</h2>
          <div className="space-y-2">
            {stats.carModelBreakdown.slice(0, 6).map(({ model, count }) => (
              <div key={model} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-0">{getCarModelLabel(model)}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(count / (stats.carModelBreakdown[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

