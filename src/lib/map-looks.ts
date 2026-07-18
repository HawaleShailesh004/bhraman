export type MapLookId = "colorful" | "dark" | "light" | "minimal";

export const MAP_LOOKS: {
  id: MapLookId;
  label: string;
  url: string;
  pinTheme: "light" | "dark";
}[] = [
  {
    id: "colorful",
    label: "Colorful",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    pinTheme: "light",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    pinTheme: "dark",
  },
  {
    id: "light",
    label: "Light",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    pinTheme: "light",
  },
  {
    id: "minimal",
    label: "Minimal",
    url: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
    pinTheme: "light",
  },
];

export const DEFAULT_MAP_LOOK: MapLookId = "colorful";

export function lookById(id: MapLookId) {
  return MAP_LOOKS.find((l) => l.id === id) ?? MAP_LOOKS[0];
}
