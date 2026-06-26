// Helpers super-admin sans dépendance server-only (importable depuis client + server).
// Le super-admin est le compte unique autorisé à gérer les paiements de TOUTES les entreprises.
// Doit rester aligné avec la policy RLS `payments` (email codé en dur côté Supabase).
export const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ?? "victorkouzo@gmail.com").toLowerCase();

export function isSuperAdmin(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === SUPER_ADMIN_EMAIL;
}
