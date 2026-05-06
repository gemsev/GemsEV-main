import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ChangePassword() {
  const { currentUser, token, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isForcedChange = currentUser?.mustChangePassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password.");
        return;
      }

      await refreshUser();
      toast({
        title: "Password changed",
        description: "Your new password has been saved.",
      });
      setLocation("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <div className="bg-card border rounded-xl p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/gems-logo.png" alt="GEMS" className="h-12 w-auto" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-primary">
          {isForcedChange ? "Set Your Password" : "Change Password"}
        </h1>

        {isForcedChange ? (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-400 text-center">
            <p className="font-semibold mb-1">Action Required</p>
            <p>Your initial password was your first name. Please set a new secure password to continue.</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center mb-6">
            Choose a strong new password for your GEMS account.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <Input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save New Password"}
          </Button>

          {!isForcedChange && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/dashboard")}
            >
              Cancel
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
