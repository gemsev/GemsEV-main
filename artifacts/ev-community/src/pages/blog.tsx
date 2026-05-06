import { useState } from "react";
import { useListBlogPosts, getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

export default function Blog() {
  const [page, setPage] = useState(1);
  const { currentUser } = useAuth();

  const { data, isLoading } = useListBlogPosts(
    { page, limit: 10 },
    { query: { queryKey: getListBlogPostsQueryKey({ page, limit: 10 }) } }
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Community Blog</h1>
          <p className="text-muted-foreground">Stories, tips and experiences from the EV tribe</p>
        </div>
        {currentUser?.blogEnabled && (
          <Button asChild><Link href="/blog/new">Write a Post</Link></Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.posts || data.posts.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share your EV story</p>
        </div>
      )}

      <div className="space-y-4">
        {data?.posts?.map(post => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <div className="group bg-card border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                {post.coverImageUrl && (
                  <img src={post.coverImageUrl} alt={post.title} className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-1 truncate">{post.title}</h2>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt || post.content?.substring(0, 150)}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {post.authorName?.[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{post.authorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.viewCount} views</span>
                    <div className="flex gap-1">
                      {post.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data && data.total > 10 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {page} of {Math.ceil(data.total / 10)}</span>
          <Button variant="outline" disabled={page >= Math.ceil(data.total / 10)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
