# Terraink — Claude Code Guide

## Commands

```bash
bun install          # install dependencies
bun run dev          # start dev server (http://localhost:5173)
bun run build        # production build
bun run typecheck    # type-check without emitting
```

## Architecture: Feature-based + Hexagonal/Clean

Source is split into vertical feature slices under `src/features/`:

```text
src/
  features/
    export/       location/     map/          markers/
    install/      layout/       poster/       theme/       updates/
  core/
    cache/        fonts/        http/
    config.ts     services.ts
  shared/
    geo/          hooks/        ui/           utils/
  data/           styles/       types/
```

Each feature has up to four layers:

| Layer | Purpose | React allowed |
| --- | --- | --- |
| `domain/` | Pure types, port interfaces, pure logic | No |
| `application/` | Hooks that orchestrate use cases | Yes |
| `infrastructure/` | Concrete adapters (HTTP, cache, parsers) | No |
| `ui/` | Components that read context and dispatch | Yes |

### Layer import rules

| Layer | May import | Must not import |
| --- | --- | --- |
| `domain/` | nothing | infrastructure, application, ui, React |
| `application/` | domain, shared, core/config, core/services | infrastructure directly |
| `infrastructure/` | domain, shared, core | application, ui, React |
| `ui/` | domain, application, shared/ui, shared/utils | infrastructure directly |
| `core/services.ts` | infrastructure adapters | any feature |

## State Management

- Single source of truth: `PosterContext` — React Context + `useReducer`
- `posterReducer.ts` owns `PosterState`, `PosterForm`, and `PosterAction`
- Components call `usePosterContext()` directly — no prop drilling
- Side-effect logic lives in application hooks: `useFormHandlers`, `useMapSync`, `useGeolocation`, `useLocationAutocomplete`, `useCurrentLocation`, `useExport`

## Key Services (`src/core/services.ts`)

```ts
searchLocations            // location autocomplete
geocodeLocation            // name → coordinates
reverseGeocodeCoordinates  // coordinates → name
ensureGoogleFont           // font loading
compositeExport            // poster compositing
captureMapAsCanvas         // map → canvas
createPngBlob / createPdfBlobFromCanvas / createLayeredSvgBlobFromMap
createPosterFilename       // generate export filename
triggerDownloadBlob        // file download
```

Never call `fetch()`, `localStorage`, or external APIs directly — always go through services.

## TypeScript

- All new files: `.ts` / `.tsx`. No `.js` in `src/`.
- `strict: false`, `allowJs: true` — gradual migration is fine
- Use `@/` alias for all cross-feature imports — never `../../` across feature boundaries
- Port interfaces go in `domain/ports.ts` or `core/*/ports.ts` with an `I` prefix (`ICache`, `IHttp`)

## Environment Variables

All `VITE_*` vars are accessed **only** through `src/core/config.ts`. Never read `import.meta.env.*` anywhere else. Env vars are optional for local development — never assume they are present for core functionality. See `.env.example` for the full list.

## Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities / pure functions: `camelCase.ts`
- Port interfaces: `I` prefix — `ICache`, `IHttp`, `IGeocodePort`
- CSS classes: `kebab-case` with a matching rule in `src/styles/`

## Commit Style

Format: `<emoji> <type>(<scope>): <subject>`

```
🐛 fix(location): fix reverse geocode on startup
♻️ refactor(core): simplify validation flow
✨ feat(map): add zoom-to-fit button
```

One logical change per commit. Subject: lowercase, imperative, no trailing period, max 50 chars, full line max 72 chars.

## Branch Strategy

```text
feature/fix branch → dev → beta → main
```

All PRs target `dev`. Never open PRs against `main` or `beta`.

**Do not create a new branch for features/fixes unless the user explicitly
demands it.** By default, commit directly to the current branch. The
`feature/fix → dev → beta → main` flow above describes the user's own
workflow — it is not a cue for Claude to auto-branch.

## Do Not

- Add logic to `App.tsx` — it must stay a thin shell
- Import from `@/lib/`, `@/utils/`, `@/hooks/`, or `@/components/` — those paths do not exist; use `@/shared/`
- Duplicate utilities — check `shared/utils/` and `shared/geo/` before creating new ones
- Call `fetch()`, `localStorage`, or `new URL()` inside components or hooks — use `core/services.ts`
- Add a CSS class without a matching rule in `src/styles/`
- Prop-drill state more than one level — use `usePosterContext()`
- Read any file's exports from memory — always verify the actual source first
- Edit `bun.lock` manually — run `bun install`
