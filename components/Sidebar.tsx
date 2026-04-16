"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Grid,
  Package,
  ImageIcon,
  User,
  UserPlus,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { LogoutModal } from "./LogoutModal";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Categories", href: "/dashboard/categories", icon: Grid },
  { name: "Request Product", href: "/dashboard/request-product", icon: Package },
  { name: "Upload Banner Ads", href: "/dashboard/banner-ads", icon: ImageIcon },
  { name: "Seller Profile", href: "/dashboard/seller-profile", icon: User },
  { name: "Seller Profile Request", href: "/dashboard/seller-request", icon: UserPlus },
  { name: "Buyer Profile", href: "/dashboard/buyer-profile", icon: ShoppingBag },
  { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
  { name: "Setting", href: "/dashboard/setting", icon: Settings },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsModalOpen(false);

      // NextAuth sign out (redirect false দিলে আমরা নিজে redirect করবো)
      await signOut({ redirect: false });

      router.replace("/auth/login"); // তোমার login route যেটা, সেটাই দাও
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 transform flex-col text-white transition-transform duration-300 bg-[rgba(223,141,16,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-8 md:justify-center md:px-0 md:py-10">
          <div className="relative w-28 h-12 mb-2">
            <Image src="/logo.png" alt="MANSA" fill className="object-contain" priority />
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-white/90 hover:bg-white/10 md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                  isActive ? "bg-[#8B5704]" : "hover:bg-white/10"
                }`}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button
            disabled={isLoggingOut}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-4 text-white hover:opacity-80 w-full disabled:opacity-60"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </span>
          </button>
        </div>
      </aside>

      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
