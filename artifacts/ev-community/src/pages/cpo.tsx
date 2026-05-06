import { useState } from "react";
import { useListCpos, getListCposQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function whatsappUrl(phone: string, name: string) {
  const number = phone.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Hi${name ? " " + name : ""}, I'm a GEMS member and need help with EV charging. Can you assist?`
  );
  return `https://wa.me/${number}?text=${msg}`;
}

function groupByCpo(cpos: any[]) {
  const map = new Map<string, any[]>();
  for (const cpo of cpos) {
    const key = cpo.networkName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(cpo);
  }
  return map;
}

export default function Cpo() {
  const [search, setSearch] = useState("");

  const { data: cpos, isLoading } = useListCpos(
    {},
    { query: { queryKey: getListCposQueryKey({}) } }
  );

  const filtered = (cpos ?? []).filter(c => {
    const q = search.toLowerCase();
    return (
      c.networkName.toLowerCase().includes(q) ||
      (c.contactPerson ?? "").toLowerCase().includes(q) ||
      (c.designation ?? "").toLowerCase().includes(q)
    );
  });

  const grouped = groupByCpo(filtered);
  const networkNames = Array.from(grouped.keys()).sort();

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Charge Point Operators</h1>
        <p className="text-muted-foreground">
          Direct contacts for CPO representatives — tap WhatsApp to message them instantly.
        </p>
      </div>

      <Input
        placeholder="Search by CPO name, contact person or role..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm mb-6"
      />

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 animate-pulse h-36" />
          ))}
        </div>
      )}

      {!isLoading && networkNames.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No CPOs found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      <div className="space-y-6">
        {networkNames.map(network => {
          const contacts = grouped.get(network)!;
          return (
            <div key={network} className="bg-card border rounded-xl overflow-hidden">
              {/* CPO Header */}
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                <h3 className="font-semibold text-base">{network}</h3>
                <Badge variant="secondary" className="text-xs">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</Badge>
              </div>

              {/* Contacts */}
              <div className="divide-y">
                {contacts.map(cpo => (
                  <div key={cpo.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {cpo.contactPerson || <span className="text-muted-foreground italic">No name</span>}
                      </p>
                      {cpo.designation && (
                        <p className="text-xs text-muted-foreground">{cpo.designation}</p>
                      )}
                      {cpo.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <a href={`tel:${cpo.phone}`} className="hover:text-primary">{cpo.phone}</a>
                        </p>
                      )}
                      {cpo.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          <a href={`mailto:${cpo.email}`} className="hover:text-primary">{cpo.email}</a>
                        </p>
                      )}
                      {cpo.notes && (
                        <p className="text-xs text-amber-500 mt-0.5">{cpo.notes}</p>
                      )}
                    </div>

                    {cpo.whatsapp && (
                      <a
                        href={whatsappUrl(cpo.whatsapp, cpo.contactPerson ?? "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button
                          size="sm"
                          className="bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-1.5 text-xs font-semibold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.855L.073 23.927l6.249-1.637A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.81 9.81 0 01-5.002-1.369l-.36-.214-3.712.974.99-3.617-.235-.372A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
                          </svg>
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        {filtered.length} contact{filtered.length !== 1 ? "s" : ""} across {networkNames.length} CPO{networkNames.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
