<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## PointUs app rules
- All design tokens and custom classes live in `src/styles/style.css` (h-* classes); components use those plus layout utilities. Why: one place for the sharp editorial theme.
- `src/lib/engine.ts` and `src/lib/personas.ts` are copied verbatim from the team's tested engine; never edit their maths. Why: judges' self-check numbers depend on it.
- `/app/*` is client-only (`ssr: false`) and gated in `src/routes/app.tsx`: demo session OR verified user with a saved profile + consent record. Why: session lives in browser storage.
- Market data and AI calls run only in server functions (`*.functions.ts`); keys never reach the browser. Why: secret safety.
- Contact submits: server function → direct insert → local outbox, idempotent on `client_id`. Why: redundancy without duplicates.
- SEO head tags for every page come from `pageHead()` in `src/lib/seo.ts`. Why: consistent metadata.

- Gallery zoom/pan uses react-zoom-pan-pinch with Radix Dialog focus management; keep dynamic transforms owned by the library so styling stays in the design system.
- Contact spam and per-email limits are enforced by a database trigger for both delivery paths; preserve a single client_id in queued retries to avoid bypasses and duplicates.
- The static sitemap and sitemap handler use the published origin and omit lastmod unless authoritative page-specific content timestamps exist.
- Market provider parsing, bounded caching and request deduplication live in a server-only helper shared by market RPC exports; never call another RPC from server code.
