# TerraInk

TerraInk: The Cartographic Poster Engine

This app is inspired by the original MapToPoster ![originalankur/maptoposter](https://github.com/originalankur/maptoposter) and is built using Bun, React, and TypeScript. It allows users to create custom city map posters with various styling options, leveraging OpenStreetMap data for accurate and detailed maps.

## Run

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Features

- City + country geocoding via Nominatim (or manual lat/lon override)
- OpenStreetMap feature loading via Overpass API
- Theme system with customizable colors and styles
- Roads, water, parks, and building footprint rendering
- Typography controls for display labels and optional Google Font family
- PNG export
