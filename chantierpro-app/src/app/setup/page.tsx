"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupProfile();
  }, []);

  async function setupProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/setup-profile", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.detail ? `${data.error} (${data.detail})` : data.error);
        setLoading(false);
      }
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center space-y-4 max-w-md px-4">
        {loading ? (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
            <p className="text-zinc-400">Configuration de votre compte...</p>
          </>
        ) : (
          <>
            <p className="text-red-400 text-sm">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={setupProfile}
                className="rounded-lg bg-green-500 px-4 py-2 text-black font-medium hover:bg-green-400"
              >
                Réessayer
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-white font-medium hover:bg-zinc-700"
              >
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
