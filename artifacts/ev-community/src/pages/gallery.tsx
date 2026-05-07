import { useState } from "react";
import { useListGalleryItems, getListGalleryItemsQueryKey, useCreateGalleryItem, useDeleteGalleryItem } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const uploadSchema = z.object({
  imageUrl: z.string().url("Enter a valid image URL"),
  caption: z.string().optional(),
  carModel: z.string().optional(),
  location: z.string().optional(),
});

export default function Gallery() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items, isLoading, error } = useListGalleryItems(
    {},
    { query: { queryKey: getListGalleryItemsQueryKey({}) } }
  );

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
  });

  const createMutation = useCreateGalleryItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Photo added!" });
        qc.invalidateQueries({ queryKey: getListGalleryItemsQueryKey({}) });
        setOpen(false);
        form.reset();
      },
    },
  });

  const deleteMutation = useDeleteGalleryItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Photo deleted" });
        qc.invalidateQueries({ queryKey: getListGalleryItemsQueryKey({}) });
      },
    },
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    createMutation.mutate({ data: values });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Community Gallery</h1>
          <p className="text-muted-foreground">Photos from EV owners across India</p>
        </div>
        {currentUser && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Photo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Gallery</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="caption" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption (optional)</FormLabel>
                      <FormControl><Input placeholder="My Nexon at Coorg..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="carModel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Model</FormLabel>
                        <FormControl><Input placeholder="NEV" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="Coorg, Karnataka" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Uploading..." : "Add Photo"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted rounded-xl animate-pulse" style={{ height: `${150 + (i % 3) * 60}px` }} />
          ))}
        </div>
      )}

      {!isLoading && (!items || items.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No photos yet</p>
          <p className="text-sm mt-1">Be the first to share a photo</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card mb-6">
          <p className="text-lg font-medium">Gallery is currently unavailable</p>
          <p className="text-sm mt-1">This deployment needs a working API endpoint to load gallery data.</p>
        </div>
      )}

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {items?.map(item => (
          <div key={item.id} className="group relative break-inside-avoid rounded-xl overflow-hidden bg-card border">
            <img
              src={item.imageUrl}
              alt={item.caption || "Gallery"}
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              {item.caption && <p className="text-white text-xs font-medium mb-1">{item.caption}</p>}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs">{item.ownerName}</p>
                  {item.location && <p className="text-white/60 text-xs">{item.location}</p>}
                </div>
                {currentUser?.id === item.ownerId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => deleteMutation.mutate({ id: item.id })}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
