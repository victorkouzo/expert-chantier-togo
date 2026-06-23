"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  bucket: string;
  folder: string;
  onUpload: (urls: string[]) => void;
  existingPhotos?: string[];
  maxFiles?: number;
}

export function PhotoUpload({ bucket, folder, onUpload, existingPhotos = [], maxFiles = 10 }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files).slice(0, maxFiles - photos.length)) {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }

    const updated = [...photos, ...newUrls];
    setPhotos(updated);
    onUpload(updated);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onUpload(updated);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">Photos du chantier</label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((url, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-700">
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ))}

        {photos.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500 transition-colors hover:border-green-400 hover:text-green-400"
          >
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-green-400" />
            ) : (
              <>
                <Upload size={20} />
                <span className="mt-1 text-xs">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {photos.length > 0 && (
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <ImageIcon size={12} /> {photos.length} photo{photos.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
