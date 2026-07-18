import Link from "next/link";
import { ClipboardList } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex min-h-11 items-center justify-center gap-3"
          aria-label="HomeVault home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-none">HomeVault</span>
            <span className="mt-1 block text-xs text-muted-foreground">Home records, simplified</span>
          </span>
        </Link>
        {children}
        <footer className="mt-8 flex justify-center gap-5 text-sm text-muted-foreground">
          <Link className="min-h-11 py-3 hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="min-h-11 py-3 hover:text-foreground" href="/support">
            Support
          </Link>
        </footer>
      </div>
    </main>
  );
}
