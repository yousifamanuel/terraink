const themeModules = import.meta.glob("../themes/*.json", {
  eager: true,
});

const fallbackTheme = {
  name: "Terracotta",
  description: "Mediterranean warmth - burnt orange and clay tones on cream",
  bg: "#F5EDE4",
  text: "#8B4513",
  gradient_color: "#F5EDE4",
  water: "#A8C4C4",
  parks: "#E8E0D0",
  road_motorway: "#A0522D",
  road_primary: "#B8653A",
  road_secondary: "#C9846A",
  road_tertiary: "#D9A08A",
  road_residential: "#E5C4B0",
  road_default: "#D9A08A",
};

const themesByName = Object.entries(themeModules).reduce((acc, [path, module]) => {
  const fileName = path.split("/").pop();
  const key = fileName ? fileName.replace(".json", "") : "";
  const value = module.default ?? module;
  if (key) {
    acc[key] = value;
  }
  return acc;
}, {});

export const themeNames = Object.keys(themesByName).sort();

export function getTheme(themeName) {
  if (themesByName[themeName]) {
    return themesByName[themeName];
  }

  if (themesByName.terracotta) {
    return themesByName.terracotta;
  }

  return fallbackTheme;
}
