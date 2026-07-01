# Pathfinder App — Agent Instructions

## Quick start
```sh
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build  (tsc -b with project references!)
npm run lint      # eslint .
npm run preview   # vite preview
```

## Stack & framework
- **React 19** + **TypeScript 6** + **Vite 8** + **Tailwind v4**
- **Supabase** for auth (email/password + Google OAuth), DB, file storage
- **react-router-dom v7** with `BrowserRouter`
- **Vercel** deployment — SPA rewrites all routes to `/index.html`

## TypeScript quirks
- `verbatimModuleSyntax: true` — must use `import type { Foo }` for type-only imports
- `noUnusedLocals` and `noUnusedParameters` are on
- `erasableSyntaxOnly: true` — no enums, no namespaces, no `constructor`-parameter visibility modifiers
- Project references: `tsconfig.app.json` (src) + `tsconfig.node.json` (vite config)

## Tailwind v4 specifics
- Theme defined via `@theme {}` in `src/index.css`, **not** `tailwind.config.js`
- Tailwind loaded via `@tailwindcss/vite` Vite plugin — no PostCSS config needed
- Custom CSS utility classes (`.card-chunky`, `.btn-chunky`, etc.) also live in `index.css`
- `convert_config.cjs` is a legacy script — don't rely on it

## UI components (shadcn / neobrutalism-components)
- Base primitives (`Button`, `Badge`, `Checkbox`, `RadioGroup`, `Accordion`, `Sheet`, `Dialog`, ...) come from [neobrutalism.dev](https://neobrutalism.dev) (a shadcn/ui registry), installed one at a time via `npx shadcn@latest add https://neobrutalism.dev/r/<component>.json`.
- Live in `src/components/ui/*`, imported via the `@/` alias (`@/components/ui/button`, `@/lib/utils`). Alias is defined in **all three** of `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts` (`resolve.alias`) — the shadcn CLI reads the root `tsconfig.json`, Vite reads its own config, keep them in sync if the alias ever changes.
- `components.json` config exists but its `style`/`baseColor` don't matter in practice — every shadcn color/shadow/radius token (`--main`, `--border`, `--shadow`, `--radius-base`, `--background`, etc.) is bridged in `src/index.css` (`:root` + first `@theme` block) to the existing Pathfinder brand tokens (`--color-brand-yellow`, `--color-text-primary`, ...). Don't let a future `shadcn add` overwrite that bridge — if `src/index.css` reverts to shadcn's default gray/oklch palette after an install, re-apply the bridge.
- New `src/components/ui/*.tsx` files get `react-refresh/only-export-components` disabled in `eslint.config.js` (they export a component + its `cva` variants together — standard for this library).
- **Icon exception:** these primitives ship with `lucide-react` icons baked in (Accordion chevron, Checkbox check, Dialog/Sheet close X, etc.) — that's accepted *only* inside `src/components/ui/*`. Everywhere else in the app, Material Symbols Outlined stays exclusive (see below).
- Migration is incremental (not every page uses these yet) — when touching a page that still hand-rolls a chunky `border-3 shadow-[...]` button/badge/checkbox, prefer swapping it for the matching `src/components/ui/*` primitive instead of adding another one-off implementation.

## Architecture
- `src/main.tsx` — entry point
- `src/App.tsx` — router with `ProtectedRoute` wrapper checking `useAuth().user`
- `src/contexts/AuthContext.tsx` — provides `user`, `session`, `profile`, `signOut`, `refreshProfile`
- `src/lib/supabaseClient.ts` — reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from `.env` via `import.meta.env`
- Pages: `Dashboard` (/dashboard), `BuscarOportunidades` (/buscar), `MisPostulaciones` (/postulaciones), `Documentos` (/documentos), `Perfil` (/perfil), `Asesor` (/asesor), `Login` (/login)
- Route `/` redirects to `/dashboard`
- Layout: `MainLayout` wraps all protected pages; `Login` is standalone
- Supabase SQL (schema, RLS, triggers, RPC) in `supabase_*.sql` files

## Supabase gotchas
- RPC schema cache can go stale after deploying new functions. Fix: `NOTIFY pgrst, 'reload schema';` in Supabase SQL Editor.
- Profile auto-loaded from `usuarios` table on auth; refresh with `refreshProfile()` from `useAuth`
- `VITE_SUPABASE_URL` containing `"placeholder"` triggers a simulated login bypass for local dev

## State persistence
App uses `localStorage` keys prefixed `pathfinder_*` for: saved/favorited becas, postulations, chat sessions, profile (fallback), uploaded docs (fallback), course enrollments, Ollama URL, and tab state. See `FUNCIONALIDADES.md` §11 for the full key list.

## Design constraints (from `design.md`)
- **Neo-Brutalist style:** Always use thick solid black borders (`2px`–`3px`), hard offset shadows with zero blur (e.g. `shadow-[6px_6px_0px_0px_#1e293b]`). No glassmorphism, no soft drop shadows.
- **No heavy animation libraries** (Framer Motion, etc.) — Tailwind transitions/animations only.
- **Typography:** `Plus Jakarta Sans` (Google Font) in bold/extrabold weights.
- Use `@theme` CSS variables for colors (e.g. `bg-brand-blue`, `text-text-primary`), never hardcoded hexes.
- **Icons:** Material Symbols Outlined via `<span className="material-symbols-outlined">icon_name</span>`. Color with Tailwind text classes. Never use `fill`/`stroke` CSS on SVGs. Exception: `lucide-react` is allowed *inside* `src/components/ui/*` (see "UI components" below).
- **Form controls:** Use `@/components/ui/checkbox` and `@/components/ui/radio-group` where already adopted (e.g. `FilterDrawer.tsx`). Pages not yet migrated still hide the native `<input>` with `className="hidden"` and render a custom `<div>` checkbox/radio — checked checkbox: `bg-brand-blue border-2 border-brand-blue` with white `check` icon; selected radio: `border-[6px] border-brand-blue` circle.
- Page backgrounds: `bg-slate-50` / `bg-bg-base`. Card surfaces: `bg-white`. Never `bg-gray-100`.
- Full design spec in `design.md`; feature details in `FUNCIONALIDADES.md`.

## Testing
No test framework configured.

## MCP / tooling
- `.agents/mcp_config.json` configures a Figma MCP server.
- `.agents/skills/frontend-design/` has a design skill for visual guidance.
