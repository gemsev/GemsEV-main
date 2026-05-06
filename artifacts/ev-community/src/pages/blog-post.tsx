import { useGetBlogPost, getGetBlogPostQueryKey, useDeleteBlogPost } from "@workspace/api-client-react";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const id = parseInt(params?.id || "0", 10);
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: post, isLoading } = useGetBlogPost(id, {
    query: { enabled: !!id, queryKey: getGetBlogPostQueryKey(id) }
  });

  const deleteMutation = useDeleteBlogPost({
    mutation: {
      onSuccess: () => {
        toast({ title: "Post deleted" });
        setLocation("/blog");
      },
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/3 mb-8" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Post not found.</p>
        <Button asChild><Link href="/blog">Back to Blog</Link></Button>
      </div>
    );
  }

  const isAuthor = currentUser?.id === post.authorId;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
      )}

      <div className="flex flex-wrap gap-1 mb-4">
        {post.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
      </div>

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 mb-8 pb-6 border-b">
        <Link href={`/owners/${post.authorId}`}>
          <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {post.authorName?.[0]}
            </div>
            <span className="font-medium text-sm">{post.authorName}</span>
          </div>
        </Link>
        <span className="text-sm text-muted-foreground">
          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
        </span>
        <span className="text-sm text-muted-foreground">{post.viewCount} views</span>

        {isAuthor && (
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blog/edit/${post.id}`}>Edit</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate({ id }); }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {post.content?.split("\n").map((para, i) => (
          para ? <p key={i} className="mb-4 leading-relaxed">{para}</p> : <br key={i} />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t">
        <Button variant="outline" asChild><Link href="/blog">Back to Blog</Link></Button>
      </div>
    </div>
  );
}
