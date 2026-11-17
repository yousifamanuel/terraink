import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre 6 loads its map worker from a separate file. Let Vite bundle it
// and tell MapLibre where it is, before any map is created.
maplibregl.setWorkerUrl(workerUrl);

export { maplibregl };
