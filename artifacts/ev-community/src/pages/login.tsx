import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginOwner } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useLoginOwner({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        if (data.owner?.mustChangePassword) {
          toast({
            title: "Welcome to GEMS!",
            description: "Please set a new password to continue.",
          });
          setLocation("/change-password");
        } else {
          toast({
            title: "Logged in successfully",
            description: "Welcome back to GEMS!",
          });
          setLocation("/dashboard");
        }
      },
      onError: (error) => {
        const e = error as any;
        const apiUnavailable =
          e?.status === 404 ||
          e?.status === 0 ||
          String(e?.message || "").toLowerCase().includes("failed to fetch");
        toast({
          title: "Login failed",
          description: apiUnavailable
            ? "Login service is unavailable on this deployment. Please connect a backend API."
            : e?.data?.error || "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values });
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <div className="bg-card p-8 rounded-xl shadow-lg border">
        <div className="flex justify-center mb-4">
          <img src="/gems-logo.png" alt="GEMS" className="h-12 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Member Login</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Use your username and the password set by admin
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your-username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end -mt-2">
              <Link href="/change-password" className="text-sm text-primary hover:underline">
                Reset password
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => setLocation("/change-password")}>
              Change / Reset Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
