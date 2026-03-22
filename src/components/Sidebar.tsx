"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Images,
  Megaphone,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "AI Studio", icon: Sparkles },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          AdGenX
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-900/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-brand-500 flex items-center justify-center text-white text-xs font-bold">
            AG
          </div>
          <div>
            <p className="text-white text-xs font-medium">AdGenX Pro</p>
            <p className="text-gray-500 text-xs">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
