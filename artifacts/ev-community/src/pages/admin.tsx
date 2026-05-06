import { useState } from "react";
import { useListRegistrations, getListRegistrationsQueryKey, useApproveRegistration, useRejectRegistration } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCarModelLabel } from "@/lib/car-models";

const approveSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  blogEnabled: z.boolean().default(false),
});

const rejectSchema = z.object({
  reason: z.string().min(5, "Please provide a reason"),
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  approved: "bg-green-500/10 text-green-700 border-green-500/30",
  rejected: "bg-red-500/10 text-red-700 border-red-500/30",
};

export default function Admin() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: registrations, isLoading } = useListRegistrations(
    filter !== "all" ? { status: filter } : {},
    { query: { queryKey: getListRegistrationsQueryKey(filter !== "all" ? { status: filter } : {}) } }
  );

  const approveForm = useForm<z.infer<typeof approveSchema>>({ resolver: zodResolver(approveSchema), defaultValues: { blogEnabled: false } });
  const rejectForm = useForm<z.infer<typeof rejectSchema>>({ resolver: zodResolver(rejectSchema) });

  const approveMutation = useApproveRegistration({
    mutation: {
      onSuccess: () => {
        toast({ title: "Registration approved!", description: `Login credentials have been set.` });
        qc.invalidateQueries({ queryKey: getListRegistrationsQueryKey({}) });
        setActionType(null);
        setSelectedReg(null);
        approveForm.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed to approve", description: err?.message, variant: "destructive" });
      },
    },
  });

  const rejectMutation = useRejectRegistration({
    mutation: {
      onSuccess: () => {
        toast({ title: "Registration rejected" });
        qc.invalidateQueries({ queryKey: getListRegistrationsQueryKey({}) });
        setActionType(null);
        setSelectedReg(null);
        rejectForm.reset();
      },
    },
  });

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Access denied. Admin only.</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
        <p className="text-muted-foreground">Review and manage membership applications</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-card border rounded-xl p-5 animate-pulse h-24" />)}
        </div>
      )}

      {!isLoading && (!registrations || registrations.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No {filter !== "all" ? filter : ""} registrations</p>
        </div>
      )}

      <div className="space-y-3">
        {registrations?.map(reg => (
          <div
            key={reg.id}
            className="bg-card border rounded-xl p-5 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedReg(reg)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold">{reg.name}</p>
                  <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_COLORS[reg.status] || ""}`}>
                    {reg.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{reg.email} · {reg.phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{reg.areaOfStay} · {reg.occupation}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {reg.evCarsOwned?.slice(0, 5).map((c: string) => (
                    <Badge key={c} variant="outline" className="text-xs">{getCarModelLabel(c)}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{reg.createdAt ? formatDistanceToNow(new Date(reg.createdAt), { addSuffix: true }) : ""}</p>
                {reg.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-red-600" onClick={e => { e.stopPropagation(); setSelectedReg(reg); setActionType("reject"); }}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={e => { e.stopPropagation(); setSelectedReg(reg); setActionType("approve"); }}>
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Approve Dialog */}
      <Dialog open={actionType === "approve" && !!selectedReg} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {selectedReg?.name}</DialogTitle>
          </DialogHeader>
          <Form {...approveForm}>
            <form onSubmit={approveForm.handleSubmit(values => approveMutation.mutate({ id: selectedReg.id, data: values }))} className="space-y-4">
              <FormField control={approveForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Set Username</FormLabel>
                  <FormControl><Input placeholder="username" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={approveForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl><Input type="password" placeholder="min 6 characters" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={approveForm.control} name="blogEnabled" render={({ field }) => (
                <FormItem className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                  <FormLabel>Enable Blog Access</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === "reject" && !!selectedReg} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedReg?.name}</DialogTitle>
          </DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(values => rejectMutation.mutate({ id: selectedReg.id, data: values }))} className="space-y-4">
              <FormField control={rejectForm.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Rejection</FormLabel>
                  <FormControl><Input placeholder="Insufficient proof of ownership..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" variant="destructive" className="w-full" disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
