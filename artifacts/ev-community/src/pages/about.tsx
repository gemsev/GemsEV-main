export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About GEMS EV Community</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          GEMS is a growing network of EV owners, clean mobility advocates, and ecosystem partners across India.
          We bring real ownership experience, practical charging insights, and a shared mission to accelerate electric mobility.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-muted-foreground">
              Make EV ownership easier, more informed, and more connected through verified community support.
            </p>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-2">What We Do</h2>
            <p className="text-muted-foreground">
              Curate owner stories, map charging infrastructure, and create a trusted space for practical EV guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

