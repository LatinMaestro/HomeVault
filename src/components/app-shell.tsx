import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ClipboardList,
  Home,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import {
  getCurrentHouseholdAccess,
  getCurrentVerifiedSessionUser,
} from "@/lib/household-access";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", mobileName: "Home", href: "/", icon: Home },
  { name: "Vault", mobileName: "Vault", href: "/vault", icon: Archive },
  { name: "Maintenance", mobileName: "Maintain", href: "/maintenance", icon: Wrench },
  { name: "Warranties", mobileName: "Warranty", href: "/warranties", icon: ShieldCheck },
  { name: "Receipts", mobileName: "Records", href: "/receipts", icon: ReceiptText },
  { name: "Settings", mobileName: "Settings", href: "/settings", icon: Settings },
];

export async function AppShell({
  activeSection,
  children,
  publicAccess = false,
}: {
  activeSection: string;
  children: React.ReactNode;
  publicAccess?: boolean;
}) {
  const accountMode = isAuthRuntimeConfigured();

  if (accountMode && !publicAccess) {
    const user = await getCurrentVerifiedSessionUser();
    if (!user) redirect("/sign-in");

    const householdAccess = await getCurrentHouseholdAccess();
    if (!householdAccess) redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header className="border-b bg-card/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="HomeVault dashboard">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">HomeVault</p>
              <p className="text-xs text-muted-foreground">Home records, simplified</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="icon">
              <Link href="/add" aria-label="Add a HomeVault record" title="Add a record">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="icon" variant="outline">
              <Link href="/search" aria-label="Search HomeVault" title="Search HomeVault">
                <Search className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {accountMode ? (
              <Button asChild size="icon" variant="outline">
                <Link href="/account" aria-label="HomeVault account" title="Account">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
            <div className="hidden rounded-md border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:block">
              {accountMode ? "Secure account mode" : "Sample preview"}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <nav
          aria-label="Primary"
          className="hidden min-h-[calc(100vh-73px)] w-64 border-r bg-background p-4 lg:block"
        >
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === activeSection;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <nav
          aria-label="Mobile primary"
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto grid h-16 max-w-lg grid-cols-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === activeSection;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="max-w-full truncate">{item.mobileName}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-6">
          {children}
          <footer className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm text-muted-foreground">
            <Link className="min-h-11 py-3 hover:text-foreground" href="/privacy">
              Privacy
            </Link>
            <Link className="min-h-11 py-3 hover:text-foreground" href="/support">
              Support
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
