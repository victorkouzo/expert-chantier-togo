import { createClient } from "@/lib/supabase/server";
import { requireSession, canManageChantiers } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2, Phone, Mail, MapPin, HardHat } from "lucide-react";
import { DeleteClientButton } from "./delete-client-button";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const [{ data: client }, { data: chantiers }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("chantiers").select("id, name, status, city, budget").eq("client_id", id),
  ]);

  if (!client) notFound();
  const canManage = canManageChantiers(session.role);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            {client.contact_name && <p className="text-sm text-zinc-500">{client.contact_name}</p>}
          </div>
        </div>
        {canManage && <DeleteClientButton clientId={id} />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {client.phone && (
          <Card><div className="flex items-center gap-2"><Phone size={16} className="text-zinc-400" /><span className="text-sm text-white">{client.phone}</span></div></Card>
        )}
        {client.email && (
          <Card><div className="flex items-center gap-2"><Mail size={16} className="text-zinc-400" /><span className="text-sm text-white">{client.email}</span></div></Card>
        )}
        {(client.address || client.city) && (
          <Card className="sm:col-span-2">
            <div className="flex items-center gap-2"><MapPin size={16} className="text-zinc-400" />
              <span className="text-sm text-white">{client.address ? `${client.address}, ` : ""}{client.city}</span>
            </div>
          </Card>
        )}
      </div>

      {client.notes && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Notes</h3>
          <p className="whitespace-pre-wrap text-sm text-zinc-400">{client.notes}</p>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <HardHat size={18} /> Chantiers ({chantiers?.length ?? 0})
        </h2>
        {(!chantiers || chantiers.length === 0) ? (
          <Card className="text-sm text-zinc-500 text-center py-8">Aucun chantier pour ce client</Card>
        ) : (
          chantiers.map((c) => (
            <Link key={c.id} href={`/chantiers/${c.id}`}>
              <Card className="hover:border-zinc-600 transition-colors cursor-pointer mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500">{c.city} · {c.status}</p>
                </div>
                <p className="text-sm text-zinc-400">{Number(c.budget).toLocaleString("fr-FR")} FCFA</p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
