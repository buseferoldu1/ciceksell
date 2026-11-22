"use client";

import { useState } from "react";

/** "Yeniden Abone Ol" butonu: tiklaninca servis saglayiciya basvurma mesaji gosterir. */
export default function SubscribeButton() {
  const [tiklandi, setTiklandi] = useState(false);
  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setTiklandi(true)}
        className="rounded-full bg-[#d9594c] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#c2493d]"
      >
        Yeniden Abone Ol
      </button>
      {tiklandi && (
        <p
          role="status"
          className="mx-auto mt-5 max-w-sm rounded-xl border border-[#d9594c]/30 bg-[#d9594c]/10 px-5 py-3 text-sm leading-relaxed text-[#e5e2e3]"
        >
          Lütfen sahip olduğunuz servis sağlayıcıya başvurun.
        </p>
      )}
    </div>
  );
}
