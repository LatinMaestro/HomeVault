import Link from "next/link";
import {
  Archive,
  ClipboardList,
  Home,
  ReceiptText,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Vault", href: "/vault", icon: Archive },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Warranties", href: "/warranties", icon: ShieldCheck },
  { name: "Receipts", href: "/receipts", icon: ReceiptText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  activeSection,
  children,
}: {
  activeSection: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">HomeVault</p>
              <p className="text-xs text-muted-foreground">Home records, simplified</p>
            </div>
          </Link>
          <div className="hidden rounded-md border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:block">
            Single-user preview
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <nav
          aria-label="Primary"
          className="border-b bg-background px-2 py-2 lg:min-h-[calc(100vh-73px)] lg:w-64 lg:border-b-0 lg:border-r lg:p-4"
        >
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === activeSection;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
