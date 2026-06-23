import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { AttendanceForm } from "./attendance-form";

export default async function PresencesPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("id, name")
    .eq("status", "en_cours")
    .order("name");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, chantier_id, team_members(id, full_name, role, is_active)")
    .order("name");

  const activeTeams = (teams ?? []).map((t) => ({
    ...t,
    team_members: Array.isArray(t.team_members)
      ? t.team_members.filter((m: { is_active: boolean }) => m.is_active)
      : [],
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Présences quotidiennes</h1>

      {(!chantiers || chantiers.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucun chantier en cours.
        </Card>
      ) : (
        <AttendanceForm
          chantiers={chantiers.map((c) => ({ value: c.id, label: c.name }))}
          teams={activeTeams}
        />
      )}
    </div>
  );
}
