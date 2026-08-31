"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, Listing } from "@/lib/supabase";
import AuthBar from "@/lib/AuthBar";

export default function Landing() {
  const [recent, setRecent] = useState<Listing[]>([]);

  useEffect(() => {
    supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setRecent((data as Listing[]) ?? []));
  }, []);

  return (
    <div className="font-sans text-sm">
      <header className="max-w-3xl mx-auto px-4 py-4 flex items-baseline justify-between">
        <span className="text-xl font-bold">homeward</span>
        <div className="flex items-center gap-3">
          <Link href="/board" className="text-blue-700 underline hover:text-blue-900">
            browse the board
          </Link>
          <AuthBar />
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-10 pb-14 border-b border-zinc-200">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          A lost pet doesn&apos;t have time for a signup form.
        </h1>
        <p className="text-zinc-600 max-w-prose mb-6 leading-relaxed">
          Homeward is a plain board for lost and found pets. Post in under a minute, with
          no account — you get a private link to edit or close your listing later. Everything
          posted is public so neighbours, shelters and vets can actually find it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/post" className="bg-zinc-800 text-white rounded px-4 py-2">
            post a lost or found pet
          </Link>
          <Link href="/board" className="border border-zinc-300 rounded px-4 py-2 hover:bg-zinc-50">
            browse the board
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10 grid gap-6 sm:grid-cols-3 border-b border-zinc-200">
        {[
          ["No account needed", "Post anonymously. A private edit link is yours to keep — nobody else can close or change your listing."],
          ["Searchable, not a feed", "Filter lost from found and search by name, species, colour, tag number or where the pet was last seen."],
          ["Everywhere you are", "The web app, native iOS and Mac apps, and an installable home-screen app on Android and Windows."],
        ].map(([h, p]) => (
          <div key={h}>
            <h2 className="font-bold mb-1">{h}</h2>
            <p className="text-zinc-600 leading-relaxed">{p}</p>
          </div>
        ))}
      </section>

      {recent.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold">recently posted</h2>
            <Link href="/board" className="text-blue-700 underline">see all</Link>
          </div>
          <ul className="divide-y divide-zinc-200">
            {recent.map((l) => (
              <li key={l.id} className="py-2">
                <Link href={`/listing?id=${l.id}`} className="flex items-baseline gap-2 hover:underline">
                  <span
                    className={`uppercase text-xs font-bold px-1 rounded ${
                      l.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {l.type}
                  </span>
                  <span className="font-medium">{l.pet_name || l.species}</span>
                  <span className="text-zinc-500">— {l.species}{l.color ? `, ${l.color}` : ""}</span>
                  <span className="text-zinc-400 ml-auto">{l.last_seen_location}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="max-w-3xl mx-auto px-4 py-8 text-zinc-400 border-t border-zinc-200">
        homeward · a free board for lost and found pets
      </footer>
    </div>
  );
}
