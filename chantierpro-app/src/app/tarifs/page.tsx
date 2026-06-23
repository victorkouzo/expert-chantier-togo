import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/pricing-cards";

export const metadata = {
  title: "Tarifs — ChantierPro BTP",
  description: "Des plans adaptés à toutes les entreprises BTP, du démarrage aux grandes structures.",
};

export default function TarifsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-xl font-bold">
          Chantier<span className="text-green-400">Pro</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost">Connexion</Button></Link>
          <Link href="/register"><Button>Commencer</Button></Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Des tarifs simples et transparents</h1>
          <p className="mt-3 text-zinc-400">
            Choisissez le plan adapté à votre entreprise. Sans engagement, annulez à tout moment.
          </p>
        </div>

        <PricingCards />

        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>Paiement par Mobile Money (Flooz, T-Money), virement ou carte bancaire.</p>
          <p className="mt-1">Besoin d&apos;un devis sur mesure ? <Link href="/register" className="text-green-400 hover:underline">Contactez-nous</Link></p>
        </div>
      </main>
    </div>
  );
}
