![](./public/assets/banner.jpg)

# TerraInk

[![Website Badge](https://img.shields.io/badge/Website-fff?logo=appveyor&logoColor=000&style=for-the-badge)](https://terraink.app)
[![Email Badge](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=fff&style=for-the-badge)](mailto:info@terraink.app)
[![LinkedIn Badge](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=fff&style=for-the-badge)](https://www.linkedin.com/company/terraink/)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?logo=instagram&logoColor=fff&style=for-the-badge)](https://instagram.com/terraink.app)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?logo=youtube&logoColor=fff&style=for-the-badge)](https://www.youtube.com/@terrainkapp)
[![Threads](https://img.shields.io/badge/Threads-000?logo=threads&logoColor=fff&style=for-the-badge)](https://www.threads.net/@terraink.app)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?logo=reddit&logoColor=fff&style=for-the-badge)](https://www.reddit.com/r/terraink)
[![TikTok](https://img.shields.io/badge/TikTok-000?logo=tiktok&logoColor=fff&style=for-the-badge)](https://www.tiktok.com/@terraink.app)
[![Product Hunt](https://img.shields.io/badge/Product%20Hunt-DA552F?logo=producthunt&logoColor=fff&style=for-the-badge)](https://www.producthunt.com/products/terraink)

[![Bun Badge](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff&style=for-the-badge)](https://bun.sh)
[![Vite Badge](https://img.shields.io/badge/Vite-9135FF?logo=vite&logoColor=fff&style=for-the-badge)](https://vitejs.dev)
[![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=for-the-badge)](https://react.dev/)
[![JavaScript Badge](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript Badge](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=fff&style=for-the-badge)](https://www.typescriptlang.org)
[![OpenStreetMap Badge](https://img.shields.io/badge/OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=fff&style=for-the-badge)](https://www.openstreetmap.org)
[![GitHub Badge](https://img.shields.io/badge/GitHub-fff?logo=github&logoColor=000&style=for-the-badge)](https://github.com/yousifamanuel/terraink)
[![Cloudflare Badge](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=fff&style=for-the-badge)](https://www.cloudflare.com)
[![Docker Badge](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)](https://www.docker.com)

> Note: TerraInk is still in development. Every feedback is appreciated. This is a for-fun, open-source project, and community contributions are very welcome.

## Aknowledgment

This project is a JavaScript reimplementation inspired by the original MapToPoster [originalankur/maptoposter](https://github.com/originalankur/maptoposter) by [Ankur Gupta](https://github.com/originalankur) (MIT license). My app is built using Bun, React, and TypeScript. It allows users to create custom city map posters with various styling options, leveraging OpenStreetMap data for accurate and detailed maps.

## User Interface

![](./public/assets/screenshots/Web_UI.png)

## Showcase

All showcase images are stored in `public/assets/screenshots/`.

### Featured Examples

<p align="center">
  <img src="./public/assets/showcase/showcase_1.png" alt="Featured showcase example 1" width="100%" />
  <img src="./public/assets/showcase/showcase_2.png" alt="Featured showcase example 2" width="100%" />
</p>

## Run

```bash
bun install
bun run dev
```

## Environment

Configure these values in `.env` (see `.env.example`):

- `VITE_REPO_URL`: Repository link shown in the sidebar
- `VITE_REPO_API_URL`: GitHub API endpoint used to fetch star count
- `VITE_CONTACT_EMAIL`: Contact email shown in the footer (`mailto:` link)
- `VITE_LEGAL_NOTICE_URL`: Imprint/legal notice page URL
- `VITE_PRIVACY_URL`: Data privacy page URL

## Build

```bash
bun run build
```

## Deploy with Docker

### 1) Build and run with Docker Compose

Create `.env` from `.env.example` (or set `APP_PORT` directly in your shell), then run:

```bash
docker compose up -d --build
```

This serves the app on `http://localhost:7200` by default.

To change the exposed host port:

- Linux/macOS:

```bash
APP_PORT=80 docker compose up -d --build
```

- PowerShell:

```powershell
$env:APP_PORT=80
docker compose up -d --build
```

### 2) Stop the deployment

```bash
docker compose down
```

### 3) Optional: build and run without Compose

```bash
docker build -t terraink:latest .
docker run -d --name terraink -p 7200:80 --restart unless-stopped terraink:latest
```

## Features

- City + country geocoding via Nominatim (or manual lat/lon override)
- OpenStreetMap feature loading via Overpass API
- Theme system with customizable colors and styles
- Roads, water, parks, and building footprint rendering
- Typography controls for display labels and optional Google Font family
- PNG export

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yousifamanuel/terraink&type=Date)](https://star-history.com/#yousifamanuel/terraink&Date)

## Contributing

Contributions are welcome.

Please follow this flow:

1. Pick an existing issue, or open a new issue first to discuss the bug/feature.
2. Implement the fix/feature in a focused change.
3. Open a pull request after the work is complete.
4. Run tests/checks before opening the PR (`bun run build` at minimum) and verify everything works.
5. If possible, add a small screenshot for UI updates.

Code quality expectations:

- Keep code clean, readable, and reusable.
- If something is used in multiple places, extract it into a shared component.
- Reuse existing components when they already cover the use case.
- Prefer short, focused functions over long functions.
- Compose small functions/components through clear abstractions and interfaces.
- Follow naming conventions consistently.
- Add concise comments where the intent is not obvious.
