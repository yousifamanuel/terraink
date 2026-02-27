# Contributing to TerraInk

Thanks for your interest in contributing! This file covers everything you need to get started.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yousifamanuel/terraink.git
cd terraink
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in the values (see [Environment Variables](#environment-variables) below).

### 3. Install dependencies

```bash
bun install
```

### 4. Start the development server

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

All variables are prefixed `VITE_` and accessed only through `src/core/config.ts` — never read `import.meta.env.*` directly outside that file.

| Variable                | Required | Description                                                                               |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `VITE_REPO_URL`         | No       | GitHub repo page URL — shown as a link in the sidebar                                     |
| `VITE_REPO_API_URL`     | No       | GitHub API URL (`https://api.github.com/repos/owner/repo`) — used to fetch the star count |
| `VITE_CONTACT_EMAIL`    | No       | Contact email shown in the info panel (`mailto:` link)                                    |
| `VITE_LEGAL_NOTICE_URL` | No       | URL to the imprint / legal notice page                                                    |
| `VITE_PRIVACY_URL`      | No       | URL to the data privacy / privacy policy page                                             |

All variables are optional — the app degrades gracefully when they are absent (links are hidden or shown at reduced opacity).

---

## Branch Strategy

The repository follows a linear promotion model:

```
dev  →  beta  →  main
```

| Branch | Purpose                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `dev`  | Active development. All feature branches are created from here and PRs target here first.              |
| `beta` | Staging / pre-release testing. Promoted from `dev` when a set of changes is ready for broader testing. |
| `main` | Production. Only promoted from `beta` after a release is verified.                                     |

**Always branch from `dev` and open your PR against `dev`.**

## Contribution Flow

1. Pick an existing issue, or open a new issue first to discuss the bug or feature.
2. Create a branch from `dev` with a short descriptive name (e.g. `fix/geocoding-error`, `feat/svg-export`).
3. Implement the fix or feature in a focused, minimal diff.
4. Run `bun install` to ensure dependencies are up to date.
5. Run `bun run build` and verify the build passes before opening a PR.
6. Open a pull request against `dev` with a clear description of the change.
7. Add a screenshot for any visible UI changes.

---

## Code Quality

- Keep code clean, readable, and reusable.
- If something is used in more than one place, extract it into a shared component or utility.
- Reuse existing components and hooks when they already cover the use case.
- Prefer short, focused functions over long, complex ones.
- Compose behavior through clear abstractions and interfaces.
- Follow the naming conventions in [`agent.md`](./agent.md).
- Add concise comments where intent is not immediately obvious.
- Do not bypass the port/adapter architecture — read [`agent.md`](./agent.md) before adding new infrastructure code.
