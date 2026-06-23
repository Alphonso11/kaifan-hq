import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Shield,
  ArrowRight,
  MapPin,
  Home,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="lattice-gold pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div className="relative z-10">
        {/* Nav */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-primary text-gold">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl">Kaifan HQ</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <main className="container mx-auto px-4">
          <div className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
            <div>
              <p className="mb-2 font-arabic text-xl text-gold-deep" dir="rtl">
                ديوانية
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
                The modern majlis, organised
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">
                Know which <span className="text-primary">diwaniya</span> is open
                tonight.
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Kaifan HQ brings the warmth of the Gulf gathering online —
                discover open diwaniyas, request a seat, and let hosts welcome
                their guests with ease.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">
                    Find a diwaniya <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Host with us
                  </Button>
                </Link>
              </div>
              <div className="mt-9 flex items-center gap-6 text-[13px] text-muted-foreground">
                <div className="flex flex-col">
                  <span className="font-display text-xl text-foreground">40+</span>
                  Active diwaniyas
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl text-foreground">
                    2,800
                  </span>
                  Guests welcomed
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl text-foreground">
                    Nightly
                  </span>
                  Live open status
                </div>
              </div>
            </div>

            {/* Product peek */}
            <div className="relative">
              <div className="absolute -inset-6 z-0 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative z-10 rounded-[22px] border bg-card p-5 shadow-xl">
                <div className="relative flex h-32 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 p-4">
                  <div className="lattice-gold absolute inset-0 opacity-50" />
                  <span className="relative inline-flex items-center gap-1.5 rounded-full border border-[hsl(43_50%_77%)] bg-gold-tint px-2.5 py-1 text-xs font-bold text-teal-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-primary/20" />
                    Open tonight
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl">Diwaniya Al Salam</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Kaifan, Block 4
                    </p>
                  </div>
                  <span className="rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Hosted by Khalid
                  </span>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Guests tonight</span>
                    <span>32 / 50</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full w-[64%] rounded-full bg-gradient-to-r from-primary to-teal-700" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-[13px] text-muted-foreground">
                    Doors close at midnight
                  </span>
                  <Button variant="gold" size="sm">
                    Request a seat
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <section className="py-16 md:py-24">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
                How it works
              </p>
              <h2 className="mt-2 font-display text-4xl">
                Hospitality, the way it should feel
              </h2>
              <p className="mt-2 text-muted-foreground">
                From the first invitation to the last cup of gahwa — three simple
                roles keep every gathering effortless.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Users,
                  gold: false,
                  title: "Discover & register",
                  body: "Browse diwaniyas near you, see who's open in real time, and request your seat in a single tap.",
                },
                {
                  icon: Home,
                  gold: true,
                  title: "Host your space",
                  body: "Flip your sign open or closed, approve guests, set capacity, and keep your majlis exactly how you like it.",
                },
                {
                  icon: Shield,
                  gold: false,
                  title: "Trusted & private",
                  body: "Role-based access keeps the guest list in the right hands. Members see only what they need to.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border bg-card p-7 text-card-foreground"
                >
                  <span
                    className={
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] " +
                      (f.gold
                        ? "bg-gold-tint text-gold-deep"
                        : "bg-accent text-primary")
                    }
                  >
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-xl">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Band */}
          <section className="relative my-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700">
            <div className="lattice-gold absolute inset-0 opacity-50" />
            <div className="relative flex flex-wrap items-center justify-between gap-8 p-12">
              <div>
                <h2 className="font-display text-3xl text-cream">
                  Open your diwaniya tonight
                </h2>
                <p className="mt-2 max-w-md text-cream/70">
                  Join the hosts already welcoming their guests through Kaifan HQ.
                  Setup takes minutes.
                </p>
              </div>
              <Link href="/signup">
                <Button variant="gold" size="lg">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="container mx-auto mt-12 border-t px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-muted-foreground md:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-primary text-gold">
                <Building2 className="h-4 w-4" />
              </span>
              <span>&copy; {new Date().getFullYear()} Kaifan HQ</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
