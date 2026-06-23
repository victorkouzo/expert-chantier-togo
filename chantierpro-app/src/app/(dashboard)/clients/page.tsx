import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail } from "lucide-react";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <Link href="/clients/new">
          <Button><Plus size={16} className="mr-2" />Nouveau client</Button>
        </Link>
      </div>

      {(!clients || clients.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucun client enregistré.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="hover:border-zinc-600 transition-colors cursor-pointer">
                <p className="font-medium text-white">{c.name}</p>
                {c.phone && (
                  <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                    <Phone size={11} /> {c.phone}
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-1 text-xs text-zinc-500">
                    <Mail size={11} /> {c.email}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
