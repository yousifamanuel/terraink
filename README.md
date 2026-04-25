![](./public/assets/banner.png)

# Terraink

[![Website Badge](https://img.shields.io/badge/Website-fff?logo=appveyor&logoColor=000&style=for-the-badge)](https://terraink.app)
[![Email Badge](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=fff&style=for-the-badge)](mailto:hello@terraink.app)
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
[![MapLibre Badge](https://img.shields.io/badge/MapLibre-000?logo=maplibre&logoColor=fff&style=for-the-badge)](https://maplibre.org/)
[![GitHub Badge](https://img.shields.io/badge/GitHub-fff?logo=github&logoColor=000&style=for-the-badge)](https://github.com/yousifamanuel/terraink)
[![Cloudflare Badge](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=fff&style=for-the-badge)](https://www.cloudflare.com)
[![Docker Badge](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)](https://www.docker.com)

> Note: Terraink is still in development. Every feedback is appreciated. This is an open-source project, and community contributions are very welcome.

> **License & Trademark Notice:** This project is licensed under AGPL-3.0 and includes trademark protections. See the [License](#license) and [Trademark](#trademark) sections for details.

## Features

- **Custom city map posters** for any location in the world, powered by real OpenStreetMap data
- **Smart geocoding** — search for any city or region by name, or enter coordinates manually
- **Rich theme system** — choose from dozens of curated themes or build your own custom color palette
- **Detailed map layers** — roads, water bodies, parks, and building footprints with per-layer styling
- **Typography controls** — set city/country display labels and load any Google Fonts family
- **High-resolution PNG export** — download a print-ready poster at any defined dimension

## Data Providers and Mapping Stack

- **Map data**: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- **Tiles**: [OpenMapTiles](https://openmaptiles.org/)
- **Tile hosting**: [OpenFreeMap](https://openfreemap.org/)
- **Geocoding**: [Nominatim](https://nominatim.openstreetmap.org/)
- **Map renderer**: [MapLibre](https://maplibre.org/)

## User Interface

![Terraink web UI](./docs/images/Web_UI.png)

## Showcase

### Featured Examples

<p align="center">
  <img src="./docs/images/showcase_1.png" alt="Featured showcase example 1" width="100%" />
  <img src="./docs/images/showcase_2.png" alt="Featured showcase example 2" width="100%" />
</p>

## License

As of **April 3rd 2026**, all new changes to this repository are licensed under [AGPL-3.0](LICENSE). Code released before that date remains under the [MIT License](LICENSE-OLD).

The hosted Terraink service includes attribution and branding as part of the user interface.

If you deploy or modify the open-source version, you are responsible for complying with the AGPL-3.0 license, including preserving license and copyright notices.

For access to the hosted version with additional features and support, see Terraink Business or contact: [business@terraink.app](mailto:business@terraink.app).

## Trademark

Terraink™ is a trademark of Yousuf Amanuel. An application for registration has been filed with the German Patent and Trade Mark Office (DPMA). This filing establishes priority rights under the Paris Convention, allowing international trademark registration to be pursued within six months of the original filing date. The Terraink logo, visual identity, and branding assets are copyright © 2026 Yousuf Amanuel. All rights reserved.

Unauthorized use of the Terraink name in connection with similar software, map services, or related commercial products may be restricted. For licensing inquiries, contact [business@terraink.app](mailto:business@terraink.app).

See [TRADEMARK.md](./TRADEMARK.md) for details.

## Run

```bash
bun install
bun run dev
```

## Environment

Check [`.env.example`](./.env.example) for available variables. They are optional for most local work and should not be set during testing unless a specific case requires them.

## Build

```bash
bun run build
```

## Deploy with Docker (Self-Hosting)

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

## Contributing

> The contribution guidelines are meant to keep Terraink easy to extend, review, and maintain over time. They are here to support a durable architecture, not to add unnecessary friction.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

- Branch from `dev` and target `dev` only. Do not open PRs against `main`.
- Fill out the pull request template completely when you open a PR.
- Keep contributions clean, modular, and aligned with the existing architecture.
- Avoid hard-coded values when constants, configuration, or reusable abstractions are more appropriate.
- AI-assisted coding is allowed, but submissions must be reviewed, refined, and intentionally engineered before review.

## Attribution

- **Map data**: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licensed under [ODbL](https://opendatacommons.org/licenses/odbl/)
- **Tile schema**: © [OpenMapTiles](https://openmaptiles.org/), licensed under [ODbL](https://openmaptiles.org/docs/tileset/openmaptiles/)
- **Tile hosting**: [OpenFreeMap](https://openfreemap.org/)
- **Geocoding**: [Nominatim](https://nominatim.openstreetmap.org/) / OpenStreetMap data
- **Map renderer**: [MapLibre GL JS](https://maplibre.org/), licensed under [BSD-3-Clause](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt)

## Acknowledgment

Terraink was inspired by [MapToPoster](https://github.com/originalankur/maptoposter) by [Ankur Gupta](https://github.com/originalankur), originally released under the MIT license. Terraink is an independent reimplementation built from scratch using Bun, React, and TypeScript, and has since evolved significantly beyond the original concept.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yousifamanuel/terraink&type=Date)](https://star-history.com/#yousifamanuel/terraink&Date)
