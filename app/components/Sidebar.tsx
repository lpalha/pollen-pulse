"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DARK = "#07290E";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 w-56 flex flex-col z-10"
      style={{ backgroundColor: DARK }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#AACC00" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="#07290E" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M12 2v10m0 0l-3-3m3 3l3-3M3 17l3 2 3-2 3 2 3-2 3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "#F5F1EA" }}>
            Pulse
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-2 mb-2 text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(245,241,234,0.35)" }}>
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors"
                  style={{
                    backgroundColor: active ? "rgba(245,241,234,0.1)" : "transparent",
                    color: active ? "#F5F1EA" : "rgba(245,241,234,0.55)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,241,234,0.06)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(245,241,234,0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(245,241,234,0.55)";
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-[11px]" style={{ color: "rgba(245,241,234,0.3)" }}>Pollen Energy</p>
      </div>
    </aside>
  );
}
