import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact GEMS</h1>
        <p className="text-muted-foreground text-lg">
          Partner with us, join local community events, or reach out for EV ecosystem collaborations.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold text-lg mb-2">General Enquiries</h2>
            <p className="text-muted-foreground">hello@gemsev.in</p>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold text-lg mb-2">Partnerships</h2>
            <p className="text-muted-foreground">partners@gemsev.in</p>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card space-y-3">
          <h2 className="font-semibold text-lg">Become a Member</h2>
          <p className="text-muted-foreground">
            Ready to join India&apos;s active EV owner network? Start your registration in a minute.
          </p>
          <Button asChild>
            <a href="/register">Join GEMS</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

