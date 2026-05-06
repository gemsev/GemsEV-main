import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBlogPost } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

export default function BlogNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { published: false },
  });

  const createMutation = useCreateBlogPost({
    mutation: {
      onSuccess: (post) => {
        toast({ title: "Post created!" });
        setLocation(`/blog/${post.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create post", variant: "destructive" });
      },
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    createMutation.mutate({
      data: {
        ...values,
        tags: values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        coverImageUrl: values.coverImageUrl || undefined,
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Write a Post</h1>
      <p className="text-muted-foreground mb-8">Share your EV experience with the community</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="My first month with the Nexon EV..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="excerpt" render={({ field }) => (
            <FormItem>
              <FormLabel>Short Summary (optional)</FormLabel>
              <FormControl><Input placeholder="A brief description shown in the feed..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your post here... (markdown supported)"
                  rows={16}
                  className="resize-none font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>{field.value?.length || 0} characters</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (optional)</FormLabel>
              <FormControl><Input placeholder="https://..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl><Input placeholder="charging, range, tips (comma-separated)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="published" render={({ field }) => (
            <FormItem className="flex items-center justify-between bg-card border rounded-lg p-4">
              <div>
                <FormLabel>Publish immediately</FormLabel>
                <FormDescription>Off = save as draft</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? "Saving..." : form.watch("published") ? "Publish Post" : "Save Draft"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
