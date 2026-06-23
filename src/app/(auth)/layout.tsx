import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="lattice-gold pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-primary text-gold">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl">Kaifan HQ</span>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
