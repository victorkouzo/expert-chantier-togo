"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setupProfile() {
      try {
        const res = await fetch("/api/auth/setup-profile", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(data.error || "Erreur lors de la configuration du profil");
          setLoading(false);
        }
      } catch {
        setError("Erreur réseau");
        setLoading(false);
      }
    }
    setupProfile();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center space-y-4">
        {loading ? (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
            <p className="text-zinc-400">Configuration de votre compte...</p>
          </>
        ) : (
          <>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(""); window.location.reload(); }}
              className="rounded-lg bg-green-500 px-4 py-2 text-black font-medium hover:bg-green-400"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
