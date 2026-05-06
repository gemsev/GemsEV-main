import { useAuth } from "@/lib/auth";
import { useUpdateOwnerProfile } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { getCarModelLabel } from "@/lib/car-models";

const schema = z.object({
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
  telegramId: z.string().optional(),
});

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: currentUser?.bio || "",
      avatarUrl: currentUser?.avatarUrl || "",
      whatsappNumber: currentUser?.whatsappNumber || "",
      telegramId: currentUser?.telegramId || "",
    },
  });

  const updateMutation = useUpdateOwnerProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated!" });
        qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
    },
  });

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Please login to view your profile.</p>
        <Button onClick={() => setLocation("/login")}>Login</Button>
      </div>
    );
  }

  function onSubmit(values: z.infer<typeof schema>) {
    updateMutation.mutate({
      id: currentUser!.id,
      data: { ...values, avatarUrl: values.avatarUrl || undefined },
    });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-card border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center font-bold text-primary text-2xl">
            {currentUser.name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-muted-foreground text-sm">{currentUser.email}</p>
            <div className="flex gap-1 mt-1">
              <Badge variant={currentUser.status === "approved" ? "default" : "secondary"} className="text-xs">{currentUser.status}</Badge>
              {currentUser.role === "admin" && <Badge className="text-xs">Admin</Badge>}
              {currentUser.blogEnabled && <Badge variant="outline" className="text-xs">Blog Enabled</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><p className="text-muted-foreground text-xs">Login Email</p><p className="font-medium truncate">{currentUser.username}</p></div>
          <div><p className="text-muted-foreground text-xs">Vehicle</p><p className="font-medium">{currentUser.vehicleNumber}</p></div>
          <div><p className="text-muted-foreground text-xs">Location</p><p className="font-medium">{currentUser.areaOfStay}</p></div>
          <div><p className="text-muted-foreground text-xs">Purchased</p><p className="font-medium">{currentUser.purchaseMonthYear}</p></div>
        </div>

        <div className="flex flex-wrap gap-1">
          {currentUser.evCarsOwned?.map(code => <Badge key={code} variant="secondary" className="text-xs">{getCarModelLabel(code)}</Badge>)}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Edit Profile</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="A short bio about yourself and your EV journey..." rows={3} {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avatarUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl><Input placeholder="+91..." {...field} value={field.value || ""} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="telegramId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram ID</FormLabel>
                  <FormControl><Input placeholder="@username or NA" {...field} value={field.value || ""} /></FormControl>
                </FormItem>
              )} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setLocation("/change-password")}>
          Change Password
        </Button>
        <Button variant="destructive" onClick={() => { logout(); setLocation("/"); }}>
          Logout
        </Button>
      </div>
    </div>
  );
}
