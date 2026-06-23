import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHat, FileText, Wallet, Shield } from "lucide-react";

const features = [
  { icon: HardHat, title: "Gestion de chantiers", desc: "Suivez tous vos chantiers BTP en temps réel" },
  { icon: FileText, title: "Rapports journaliers", desc: "Météo, effectifs, avancement — tout en un clic" },
  { icon: Wallet, title: "Suivi des dépenses", desc: "Contrôlez votre budget par catégorie et chantier" },
  { icon: Shield, title: "Sécurité & conformité", desc: "Données protégées, accès par rôle (RLS)" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-xl font-bold">
          Chantier<span className="text-green-400">Pro</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/tarifs"><Button variant="ghost">Tarifs</Button></Link>
          <Link href="/login"><Button variant="ghost">Connexion</Button></Link>
          <Link href="/register"><Button>Commencer</Button></Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-green-400">
          Expert Chantier Togo
        </p>
        <h2 className="mb-6 max-w-2xl text-5xl font-bold leading-tight">
          Gérez vos chantiers BTP <br />
          <span className="text-green-400">comme un pro</span>
        </h2>
        <p className="mb-8 max-w-lg text-zinc-400">
          La plateforme SaaS de gestion de chantier conçue pour les professionnels du BTP au Togo et en Afrique de l&apos;Ouest.
        </p>
        <Link href="/register">
          <Button size="lg">Créer un compte gratuit</Button>
        </Link>

        <div className="mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
              <Icon className="mb-3 text-green-400" size={28} />
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-zinc-600">
        &copy; 2024 ChantierPro — Expert Chantier Togo · KOUZO Messan
      </footer>
    </div>
  );
}
