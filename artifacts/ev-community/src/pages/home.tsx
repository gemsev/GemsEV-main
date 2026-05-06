import { useGetDashboardStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: stats } = useGetDashboardStats();

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <section className="text-center">
        <img src="/gems-logo.png" alt="GEMS" className="h-20 md:h-24 w-auto mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Gang of Electric Mobility & Sustainability</h1>
        <p className="text-sm md:text-lg text-muted-foreground mb-3 font-medium tracking-wide uppercase">India's Premier EV Owner Community</p>
        <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto">
          Connect with verified EV owners, share experiences, discover charging spots, and move electric mobility forward together.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 md:mb-16">
          <Button size="lg" asChild>
            <Link href="/register">Join GEMS</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/owners">Explore Members</Link>
          </Button>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center mb-12 md:mb-16">
        <img
          src="/community-hero.jpg"
          alt="GEMS EV community"
          className="w-full h-[260px] md:h-[360px] object-cover rounded-lg border"
        />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Built by EV Owners, for EV Owners</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            From first-time buyers to seasoned owners, GEMS helps members with real-world tips on charging, range confidence,
            long drives, service experiences, and accessories.
          </p>
          <Button variant="outline" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mb-12 md:mb-16 space-y-4">
        <p className="text-lg md:text-xl font-semibold">
          India&apos;s EV revolution has a community now. Welcome to GEMS Bharat - your home for all things electric.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          India&apos;s electric vehicle revolution is well underway, and GEMS Bharat is here to be your trusted community hub.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Whether you&apos;re a Day 1 Nexon EV owner who&apos;s clocked over 1 lakh kilometres, or you just took delivery of a shiny new Mahindra BE6, this is YOUR community.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          GEMS Bharat was founded by passionate EV owners who believed that the best source of knowledge about electric vehicles isn&apos;t a YouTube video or a brand brochure - it&apos;s your fellow owner who&apos;s driven through the Bengaluru monsoon, charged at a highway DCFC at midnight, or figured out the perfect battery conditioning schedule for Ooty trips.
        </p>

        <div className="bg-card border rounded-lg p-5 md:p-6">
          <h3 className="text-xl font-semibold mb-3">What can you do here?</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Connect with verified EV owners across India</li>
            <li>Share your road trip stories and charging experiences</li>
            <li>Use our Range Calculator to plan your next journey</li>
            <li>Find Charge Point Operators (CPOs)</li>
            <li>Browse the community gallery</li>
            <li>Ask our AI-powered FAQ assistant anything about your EV</li>
          </ul>
        </div>

        <p className="text-lg font-semibold">Join the Gang. Go electric. The future is now.</p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
        <div className="bg-card border p-5 md:p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Verified Owner Network</h3>
          <p className="text-muted-foreground text-sm md:text-base">Connect with genuine EV owners and trusted local recommendations.</p>
        </div>
        <div className="bg-card border p-5 md:p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Charging Insights</h3>
          <p className="text-muted-foreground text-sm md:text-base">Get practical charging location updates and on-road experiences from members.</p>
        </div>
        <div className="bg-card border p-5 md:p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Stories & Events</h3>
          <p className="text-muted-foreground text-sm md:text-base">Share your EV journey, attend meetups, and discover community activities.</p>
        </div>
      </section>

      {stats && (
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Community Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            <div className="bg-card border p-5 md:p-6 rounded-lg text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats.totalOwners}</div>
              <div className="text-sm text-muted-foreground mt-2">Verified Owners</div>
            </div>
            <div className="bg-card border p-5 md:p-6 rounded-lg text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats.totalBlogPosts}</div>
              <div className="text-sm text-muted-foreground mt-2">Stories Shared</div>
            </div>
            <div className="bg-card border p-5 md:p-6 rounded-lg text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats.totalCpos}</div>
              <div className="text-sm text-muted-foreground mt-2">Charging Points</div>
            </div>
            <div className="bg-card border p-5 md:p-6 rounded-lg text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats.totalGalleryItems}</div>
              <div className="text-sm text-muted-foreground mt-2">Gallery Photos</div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-12 md:mt-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Join?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join India&apos;s EV community and connect with owners who are already driving the electric transition.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Join GEMS</Link>
        </Button>
      </section>
    </div>
  );
}
