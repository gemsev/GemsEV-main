import { useGetOwner, getGetOwnerQueryKey, useListBlogPosts, getListBlogPostsQueryKey, useListGalleryItems, getListGalleryItemsQueryKey } from "@workspace/api-client-react";
import { useRoute, Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getCarModelLabel } from "@/lib/car-models";

export default function OwnerProfile() {
  const [, params] = useRoute("/owners/:id");
  const id = parseInt(params?.id || "0", 10);
  const { currentUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: owner, isLoading } = useGetOwner(id, {
    query: {
      enabled: !!id && currentUser?.role === "admin",
      queryKey: getGetOwnerQueryKey(id),
    },
  });
  const { data: blogData } = useListBlogPosts(
    { authorId: id },
    { query: { enabled: !!id && currentUser?.role === "admin", queryKey: getListBlogPostsQueryKey({ authorId: id }) } }
  );
  const { data: gallery } = useListGalleryItems(
    { ownerId: id },
    { query: { enabled: !!id && currentUser?.role === "admin", queryKey: getListGalleryItemsQueryKey({ ownerId: id }) } }
  );

  // Auth still loading
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <img src="/gems-logo.png" alt="GEMS" className="h-16 w-auto mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to access member information.
        </p>
        <Button onClick={() => setLocation("/login")}>Login</Button>
      </div>
    );
  }

  // Logged in but not admin
  if (currentUser.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-3">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">
          Detailed member profiles are only visible to GEMS administrators to protect member privacy.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setLocation("/owners")}>Back to Directory</Button>
          <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Admin — show full profile
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Member not found.</p>
        <Button asChild className="mt-4"><Link href="/owners">Back to Directory</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/owners">← Directory</Link>
        </Button>
        <Badge variant="secondary" className="text-xs">Admin View</Badge>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 h-24" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-4 border-card flex items-center justify-center font-bold text-primary text-2xl">
              {owner.name?.[0]?.toUpperCase()}
            </div>
            <Badge variant={owner.status === "approved" ? "default" : "secondary"} className="mb-2">
              {owner.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{owner.name}</h1>
          <p className="text-muted-foreground">{owner.occupation}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{owner.areaOfStay}</p>
          {owner.bio && <p className="mt-3 text-sm">{owner.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            {owner.evCarsOwned?.map((code: string) => (
              <Badge key={code} variant="secondary">{getCarModelLabel(code)}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Email", value: owner.email },
          { label: "Phone", value: owner.phoneNumber },
          { label: "WhatsApp", value: owner.whatsappNumber, isLink: true, href: `https://wa.me/${owner.whatsappNumber?.replace(/\D/g, "")}` },
          { label: "Telegram", value: owner.telegramId !== "NA" ? owner.telegramId : "—" },
          { label: "Vehicle Number", value: owner.vehicleNumber },
          { label: "Purchased", value: owner.purchaseMonthYear },
          { label: "Variant & Color", value: owner.variantColor },
          { label: "Age", value: owner.age?.toString() },
        ].map(({ label, value, isLink, href }) => (
          <div key={label} className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLink && href ? (
              <a href={href} className="font-semibold mt-0.5 text-primary hover:underline block truncate">{value}</a>
            ) : (
              <p className="font-semibold mt-0.5 truncate">{value || "—"}</p>
            )}
          </div>
        ))}
      </div>

      {owner.proofOfOwnershipUrl && (
        <div className="bg-card border rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Proof of Ownership</p>
          <a href={owner.proofOfOwnershipUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm break-all">
            {owner.proofOfOwnershipUrl}
          </a>
        </div>
      )}

      {blogData && blogData.posts.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Blog Posts</h2>
          <div className="space-y-2">
            {blogData.posts.map(post => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="bg-card border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {gallery && gallery.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Gallery</h2>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map(item => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={item.imageUrl} alt={item.caption || "Gallery"} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
