"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Mot de passe mis à jour !");
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Changer le mot de passe</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nouveau mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input label="Confirmer" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />

        {message && (
          <p className={`text-sm ${message.startsWith("Erreur") || message.startsWith("Les") || message.startsWith("Le mot") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
        )}

        <Button type="submit" loading={loading} variant="secondary">Changer le mot de passe</Button>
      </form>
    </Card>
  );
}
