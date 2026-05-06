import { useState } from "react";
import { useListOwners, getListOwnersQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getCarModelLabel } from "@/lib/car-models";

const EV_BRANDS = ["All", "Tata", "MG", "BYD", "Kia", "Hyundai", "Mahindra", "Mercedes"];
const BRAND_CODES: Record<string, string[]> = {
  Tata: ["NEV","NEM","N3M","N3L","TiM","TiL","TiG","PuM","PuL","CeM","CeL","HeL","HQL","HeM"],
  MG: ["ZSM","WeM","CoM"],
  BYD: ["ByA3","ByE6","BySL"],
  Kia: ["KE6","KCC"],
  Hyundai: ["HyK","HyC","Hi5"],
  Mahindra: ["X400","BEV6","XE9","E20","E20+","REV"],
  Mercedes: ["EQS4","EQB3"],
};

export default function Owners() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [city, setCity] = useState("");

  const { data: owners, isLoading } = useListOwners(
    { search: search || undefined, city: city || undefined },
    {
      query: {
        enabled: !!currentUser,
        queryKey: getListOwnersQueryKey({ search: search || undefined, city: city || undefined }),
      },
    }
  );

  // Still loading auth state — show nothing yet
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Not logged in — show gate
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <img src="/gems-logo.png" alt="GEMS" className="h-16 w-auto mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Members Only</h2>
        <p className="text-muted-foreground mb-6">
          The GEMS member directory is visible to verified members only.
          Please log in to view the list of EV owners.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setLocation("/login")}>Login</Button>
          <Button variant="outline" onClick={() => setLocation("/register")}>Apply to Join</Button>
        </div>
      </div>
    );
  }

  const filtered = owners?.filter(o => {
    if (selectedBrand === "All") return true;
    const codes = BRAND_CODES[selectedBrand] || [];
    return o.evCarsOwned?.some(c => codes.includes(c));
  }) || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Member Directory</h1>
        <p className="text-muted-foreground">Connect with verified GEMS members across India</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by name, occupation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Filter by city..."
          value={city}
          onChange={e => setCity(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {EV_BRANDS.map(brand => (
          <Button
            key={brand}
            variant={selectedBrand === brand ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No members found</p>
          <p className="text-sm mt-1">Try adjusting your search filters</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(owner => (
          <div key={owner.id} className={currentUser.role === "admin" ? "cursor-pointer" : ""}>
            {currentUser.role === "admin" ? (
              <Link href={`/owners/${owner.id}`}>
                <MemberCard owner={owner} />
              </Link>
            ) : (
              <MemberCard owner={owner} />
            )}
          </div>
        ))}
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""} found
          {currentUser.role !== "admin" && (
            <span className="ml-1 text-xs">(detailed profiles are admin-only)</span>
          )}
        </p>
      )}
    </div>
  );
}

function MemberCard({ owner }: { owner: any }) {
  return (
    <div className="group bg-card border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
          {owner.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold group-hover:text-primary transition-colors truncate">{owner.name}</p>
          <p className="text-xs text-muted-foreground truncate">{owner.city || owner.areaOfStay}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3 truncate">{owner.occupation}</p>
      <div className="flex flex-wrap gap-1">
        {owner.evCarsOwned?.slice(0, 3).map((code: string) => (
          <Badge key={code} variant="secondary" className="text-xs">{getCarModelLabel(code)}</Badge>
        ))}
        {(owner.evCarsOwned?.length || 0) > 3 && (
          <Badge variant="outline" className="text-xs">+{(owner.evCarsOwned?.length || 0) - 3}</Badge>
        )}
      </div>
    </div>
  );
}
