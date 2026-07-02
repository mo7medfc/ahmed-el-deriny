"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "لوحة التحكم", labelEn: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", labelEn: "Orders", icon: ShoppingCart },
  { href: "/admin/pricing", label: "التسعير", labelEn: "Pricing", icon: DollarSign },
  { href: "/admin/products", label: "المنتجات", labelEn: "Products", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin") return;
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/admin");
          setAuthenticated(false);
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        router.replace("/admin");
        setAuthenticated(false);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  };

  if (pathname === "/admin") return <>{children}</>;
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-64 bg-dark-900 border-e border-dark-700/50 transform transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full rtl:lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-dark-700/50">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-xs text-brand-400">أحمد الدريني</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname === href
                  ? "gradient-bg text-white shadow-lg shadow-brand-500/20"
                  : "text-dark-300 hover:text-white hover:bg-dark-800"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-dark-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur flex items-center px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
