/* ────── Marker shape identifiers ────── */

export type MarkerStyle = "pin" | "circle" | "target" | "diamond" | "star";

/** Metadata entry used by the style picker UI. */
export interface MarkerStyleOption {
    id: MarkerStyle;
    label: string;
    icon: string;
}

export const MARKER_STYLES: MarkerStyleOption[] = [
    { id: "pin", label: "Pin", icon: "📍" },
    { id: "circle", label: "Circle", icon: "⭕" },
    { id: "target", label: "Target", icon: "🎯" },
    { id: "diamond", label: "Diamond", icon: "💎" },
    { id: "star", label: "Star", icon: "⭐" },
];

/** Full configuration needed to render a marker on the map or canvas. */
export interface MarkerConfig {
    show: boolean;
    style: MarkerStyle;
    color: string;
    size: number;
    lngLat: [number, number];
}
