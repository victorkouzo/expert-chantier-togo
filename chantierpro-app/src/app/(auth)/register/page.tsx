"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token") ?? "";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const metadata: Record<string, string> = { full_name: fullName, phone };
    if (invitationToken) {
      metadata.invitation_token = invitationToken;
    } else {
      metadata.company_name = companyName || `${fullName} SARL`;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">ChantierPro</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {invitationToken ? "Rejoindre une entreprise" : "Créer votre entreprise"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          {!invitationToken && (
            <Input
              label="Nom de votre entreprise"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Mon BTP SARL"
            />
          )}

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+228 90 00 00 00" />
          <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            {invitationToken ? "Rejoindre l'équipe" : "Créer l'entreprise"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black"><p className="text-zinc-500">Chargement...</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}
