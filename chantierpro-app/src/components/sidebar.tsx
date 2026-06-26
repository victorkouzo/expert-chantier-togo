"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, HardHat, FileText, Wallet, Users, CalendarDays,
  Bell, FolderOpen, UserCircle, Building2, Settings, LogOut, ClipboardCheck, CreditCard, Sparkles, ShieldCheck,
  Menu, X
} from "lucide-react";
import type { Role } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/super-admin";

interface Props {
  role: Role;
  fullName: string;
  companyName: string;
  email: string;
}

interface LinkItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  superAdminOnly?: boolean;
}

const allLinks: LinkItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"] },
  { href: "/chantiers", label: "Chantiers", icon: HardHat, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"] },
  { href: "/clients", label: "Clients", icon: Building2, roles: ["admin", "directeur", "conducteur_travaux"] },
  { href: "/rapports", label: "Rapports", icon: FileText, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "client"] },
  { href: "/depenses", label: "Dépenses", icon: Wallet, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier"] },
  { href: "/equipes", label: "Équipes", icon: Users, roles: ["admin", "directeur", "conducteur_travaux"] },
  { href: "/presences", label: "Présences", icon: ClipboardCheck, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier"] },
  { href: "/planning", label: "Planning", icon: CalendarDays, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier"] },
  { href: "/documents", label: "Documents", icon: FolderOpen, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "client"] },
  { href: "/assistant", label: "Assistant IA", icon: Sparkles, roles: ["admin", "directeur", "conducteur_travaux"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"] },
];

const bottomLinks: LinkItem[] = [
  { href: "/admin/paiements", label: "Paiements", icon: ShieldCheck, roles: ["admin", "directeur"], superAdminOnly: true },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard, roles: ["admin", "directeur"] },
  { href: "/parametres", label: "Paramètres", icon: Settings, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"] },
  { href: "/profil", label: "Mon profil", icon: UserCircle, roles: ["admin", "directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"] },
];

export function Sidebar({ role, fullName, companyName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const superAdmin = isSuperAdmin(email);
  const visible = (l: LinkItem) => l.superAdminOnly ? superAdmin : l.roles.includes(role);
  const links = allLinks.filter(visible);
  const bottom = bottomLinks.filter(visible);

  function handleNavClick() {
    setOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="px-3 text-xl font-bold text-white" onClick={handleNavClick}>
          Chantier<span className="text-green-400">Pro</span>
        </Link>
        <button onClick={() => setOpen(false)} className="p-2 text-zinc-400 lg:hidden">
          <X size={20} />
        </button>
      </div>
      <div className="mb-6 px-3 text-xs text-zinc-500 truncate" title={companyName}>{companyName}</div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-green-500/10 text-green-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-zinc-800 pt-3">
        {bottom.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-green-500/10 text-green-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
        <div className="mt-2 px-3 text-xs text-zinc-600 truncate" title={fullName}>{fullName}</div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="p-1 text-zinc-400">
          <Menu size={24} />
        </button>
        <span className="text-lg font-bold text-white">
          Chantier<span className="text-green-400">Pro</span>
        </span>
        <div className="w-8" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-zinc-950 px-3 py-6">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-6">
        {sidebarContent}
      </aside>
    </>
  );
}
