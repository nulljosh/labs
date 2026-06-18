"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, Listing } from "@/lib/supabase";

export default function EditListing() {
  return (
    <Suspense>
      <EditListingForm />
    </Suspense>
  );
}

function EditListingForm() {
  const token = useSearchParams().get("token");
  const [listing, setListing] = useState<Listing | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .from("listings")
      .select("*")
      .eq("edit_token", token)
      .single()
      .then(({ data }) => setListing(data as Listing));
  }, [token]);

  async function markResolved() {
    if (!listing || !token) return;
    await supabase.rpc("update_listing", {
      p_id: listing.id,
      p_token: token,
      p_status: "resolved",
    });
    setDone(true);
  }

  if (!token) {
    return <div className="max-w-xl mx-auto px-4 py-10 font-sans text-sm">missing edit token</div>;
  }
  if (!listing) {
    return <div className="max-w-xl mx-auto px-4 py-10 font-sans text-sm">listing not found</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 font-sans text-sm">
      <h1 className="text-lg font-bold mb-2">{listing.pet_name || listing.species}</h1>
      <p className="mb-4">status: {done ? "resolved" : listing.status}</p>
      {!done && listing.status === "active" && (
        <button onClick={markResolved} className="bg-zinc-800 text-white rounded px-4 py-2">
          mark as resolved
        </button>
      )}
    </div>
  );
}
