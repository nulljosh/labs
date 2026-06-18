"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PostListing() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [editToken, setEditToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    let photo_url: string | null = null;
    if (photo) {
      const path = `${crypto.randomUUID()}-${photo.name}`;
      const { data, error } = await supabase.storage.from("pet-photos").upload(path, photo);
      if (!error && data) {
        photo_url = supabase.storage.from("pet-photos").getPublicUrl(data.path).data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        type: form.get("type"),
        pet_name: form.get("pet_name"),
        species: form.get("species"),
        color: form.get("color"),
        description: form.get("description"),
        tag_number: form.get("tag_number"),
        last_seen_location: form.get("last_seen_location"),
        contact_phone: form.get("contact_phone"),
        contact_email: form.get("contact_email"),
        photo_url,
      })
      .select()
      .single();

    setSubmitting(false);
    if (!error && data) {
      setEditToken(data.edit_token);
    }
  }

  if (editToken) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 font-sans text-sm">
        <h1 className="text-lg font-bold mb-2">Listing posted!</h1>
        <p className="mb-4">
          Save this link to edit or mark your listing resolved later — it won&apos;t be shown again:
        </p>
        <code className="block bg-zinc-100 p-2 rounded break-all mb-4">
          {typeof window !== "undefined" ? window.location.origin : ""}/listing/edit?token={editToken}
        </code>
        <button onClick={() => router.push("/")} className="text-blue-700 underline">
          back to listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 font-sans text-sm">
      <h1 className="text-lg font-bold mb-4">post a lost/found pet</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          type
          <select name="type" required className="border border-zinc-300 rounded px-2 py-1">
            <option value="lost">lost</option>
            <option value="found">found</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          pet name (if known)
          <input name="pet_name" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          species
          <input name="species" required placeholder="cat, dog, ..." className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          color / description
          <input name="color" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          notes (temperament, identifying marks, etc.)
          <textarea name="description" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          ear tattoo / tag / chip number
          <input name="tag_number" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          last seen location
          <input name="last_seen_location" required className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="border border-zinc-300 rounded px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          contact phone
          <input name="contact_phone" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          contact email
          <input name="contact_email" type="email" className="border border-zinc-300 rounded px-2 py-1" />
        </label>
        <button
          disabled={submitting}
          className="mt-2 bg-zinc-800 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {submitting ? "posting..." : "post listing"}
        </button>
      </form>
    </div>
  );
}
