// components/admin/AdminSearch.tsx
// Componentă de căutare globală în sidebar admin.
// Caută simultan în messages și reviews via /api/admin/search.

import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchResults } from "../../pages/api/admin/search";
import * as s from "../../styles/admin/search.css";

export default function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Curăță tot starea ──────────────────────────────────
  const clear = useCallback(() => {
    setQuery("");
    setResults(null);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Debounce fetch la 300ms ────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
          const json = (await res.json()) as { ok: boolean; data?: SearchResults };
          if (json.ok && json.data) {
            setResults(json.data);
          } else {
            setResults({ messages: [], reviews: [] });
          }
        } catch {
          setResults({ messages: [], reviews: [] });
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Escape → curăță ───────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && query.length > 0) {
        clear();
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clear, query]);

  // ── Navigare + reset ──────────────────────────────────
  function navigate(href: string) {
    clear();
    void router.push(href);
  }

  // ── Stări derivate ────────────────────────────────────
  const showPanel = query.length >= 2;
  const hasMessages = (results?.messages.length ?? 0) > 0;
  const hasReviews = (results?.reviews.length ?? 0) > 0;
  const noResults = results !== null && !hasMessages && !hasReviews;

  return (
    <div className={s.searchWrap}>
      <div className={s.inputWrap}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută…"
          className={s.input}
          aria-label="Caută mesaje și recenzii"
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button
            type="button"
            className={s.clearBtn}
            onClick={clear}
            aria-label="Șterge căutarea"
          >
            ×
          </button>
        )}
      </div>

      {showPanel && (
        <div className={s.results} role="region" aria-label="Rezultate căutare">
          {loading && <div className={s.statusText}>Se caută…</div>}

          {!loading && noResults && (
            <div className={s.statusText}>Niciun rezultat</div>
          )}

          {!loading && hasMessages && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Mesaje</div>
              {results!.messages.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={s.resultItem}
                  onClick={() => navigate(`/admin/inbox/${m.id}`)}
                >
                  <span className={s.itemName}>{m.name}</span>
                  <span className={s.itemSub}>
                    {m.email}
                    {m.preview ? ` — ${m.preview}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && hasMessages && hasReviews && (
            <div className={s.divider} aria-hidden="true" />
          )}

          {!loading && hasReviews && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Recenzii</div>
              {results!.reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={s.resultItem}
                  onClick={() => navigate(`/admin/reviews?highlight=${r.id}`)}
                >
                  <span className={s.itemName}>
                    {r.name}
                    {" — "}
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <span className={s.itemSub}>{r.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
