import { createClient } from "@/lib/supabase/server";
import { requireSession, canManageChantiers } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Building2, Phone, Mail, MapPin } from "lucide-react";

export default async function ClientsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const canManage = canManageChantiers(session.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-zinc-500">Maîtres d&apos;ouvrage et donneurs d&apos;ordre</p>
        </div>
        {canManage && (
          <Link href="/clients/new">
            <Button><Plus size={16} className="mr-2" />Nouveau client</Button>
          </Link>
        )}
      </div>

      {(!clients || clients.length === 0) ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-zinc-500">
          <Building2 size={32} />
          <p>Aucun client. Ajoutez votre premier maître d&apos;ouvrage.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="hover:border-zinc-600 transition-colors cursor-pointer space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{c.name}</h3>
                    {c.contact_name && <p className="text-xs text-zinc-500 truncate">{c.contact_name}</p>}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-zinc-500">
                  {c.phone && <p className="flex items-center gap-1"><Phone size={11} />{c.phone}</p>}
                  {c.email && <p className="flex items-center gap-1"><Mail size={11} />{c.email}</p>}
                  {(c.address || c.city) && (
                    <p className="flex items-center gap-1">
                      <MapPin size={11} />{c.address ? `${c.address}, ` : ""}{c.city}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
