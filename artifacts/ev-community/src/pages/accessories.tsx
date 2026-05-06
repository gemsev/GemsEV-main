import { useState } from "react";
import { useListAccessories, getListAccessoriesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Charging", "Protection", "Interior", "Exterior", "Safety", "Connectivity", "Storage"];

export default function Accessories() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: accessories, isLoading } = useListAccessories(
    { category: category || undefined },
    { query: { queryKey: getListAccessoriesQueryKey({ category: category || undefined }) } }
  );

  const filtered = accessories?.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase()) ||
    a.sellerName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">EV Accessories</h1>
        <p className="text-muted-foreground">Discover accessories and find out where to buy them</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search accessories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={category === cat || (cat === "All" && !category) ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat === "All" ? "" : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-card border rounded-xl p-5 animate-pulse h-48" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No accessories found</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(acc => (
          <div key={acc.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            {acc.imageUrl && (
              <img src={acc.imageUrl} alt={acc.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold leading-tight">{acc.name}</h3>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{acc.category}</Badge>
              </div>
              {acc.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{acc.description}</p>}

              {acc.compatibleCars && acc.compatibleCars.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {acc.compatibleCars.slice(0, 4).map(car => (
                    <Badge key={car} variant="outline" className="text-xs">{car}</Badge>
                  ))}
                  {acc.compatibleCars.length > 4 && <Badge variant="outline" className="text-xs">+{acc.compatibleCars.length - 4}</Badge>}
                </div>
              )}

              <div className="border-t pt-3 space-y-1 text-sm">
                <p className="font-medium">{acc.sellerName}</p>
                {acc.location && <p className="text-muted-foreground text-xs">{acc.location}</p>}
                {acc.priceRange && <p className="text-primary font-medium">{acc.priceRange}</p>}
                <div className="flex gap-2 mt-2">
                  {acc.sellerContact && (
                    <a href={`tel:${acc.sellerContact}`} className="text-xs text-primary hover:underline">{acc.sellerContact}</a>
                  )}
                  {acc.sellerUrl && (
                    <a href={acc.sellerUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Visit Store</a>
                  )}
                </div>
              </div>

              {acc.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-500 text-sm">{"★".repeat(Math.round(acc.rating))}</span>
                  <span className="text-xs text-muted-foreground">{acc.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
