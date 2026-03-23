import type { Locale } from "@/core/i18n/types";
import type { SearchResult } from "@/features/location/domain/types";

export type QuickCityGroupId = "global" | "china";

type LocalizedString = Record<Locale, string>;

interface QuickCityCatalogEntry {
  id: string;
  group: QuickCityGroupId;
  lat: number;
  lon: number;
  city: LocalizedString;
  country: LocalizedString;
  continent: LocalizedString;
}

export interface QuickCity {
  id: string;
  lat: number;
  lon: number;
  locale: Locale;
  city: string;
  country: string;
  continent: string;
  label: string;
}

export interface QuickCityGroup {
  id: QuickCityGroupId;
  label: string;
  cities: QuickCity[];
}

const groupLabels: Record<QuickCityGroupId, LocalizedString> = {
  global: {
    en: "Global Cities",
    "zh-CN": "国际主要城市",
  },
  china: {
    en: "China",
    "zh-CN": "中国",
  },
};

const quickCityCatalog: QuickCityCatalogEntry[] = [
  { id: "tokyo", group: "global", lat: 35.6762, lon: 139.6503, city: { en: "Tokyo", "zh-CN": "东京" }, country: { en: "Japan", "zh-CN": "日本" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "seoul", group: "global", lat: 37.5665, lon: 126.978, city: { en: "Seoul", "zh-CN": "首尔" }, country: { en: "South Korea", "zh-CN": "韩国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "beijing", group: "global", lat: 39.9042, lon: 116.4074, city: { en: "Beijing", "zh-CN": "北京" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "shanghai", group: "global", lat: 31.2304, lon: 121.4737, city: { en: "Shanghai", "zh-CN": "上海" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "hong-kong", group: "global", lat: 22.3193, lon: 114.1694, city: { en: "Hong Kong", "zh-CN": "香港" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "singapore", group: "global", lat: 1.3521, lon: 103.8198, city: { en: "Singapore", "zh-CN": "新加坡" }, country: { en: "Singapore", "zh-CN": "新加坡" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "bangkok", group: "global", lat: 13.7563, lon: 100.5018, city: { en: "Bangkok", "zh-CN": "曼谷" }, country: { en: "Thailand", "zh-CN": "泰国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "dubai", group: "global", lat: 25.2048, lon: 55.2708, city: { en: "Dubai", "zh-CN": "迪拜" }, country: { en: "United Arab Emirates", "zh-CN": "阿联酋" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "mumbai", group: "global", lat: 19.076, lon: 72.8777, city: { en: "Mumbai", "zh-CN": "孟买" }, country: { en: "India", "zh-CN": "印度" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "london", group: "global", lat: 51.5072, lon: -0.1276, city: { en: "London", "zh-CN": "伦敦" }, country: { en: "United Kingdom", "zh-CN": "英国" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "paris", group: "global", lat: 48.8566, lon: 2.3522, city: { en: "Paris", "zh-CN": "巴黎" }, country: { en: "France", "zh-CN": "法国" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "berlin", group: "global", lat: 52.52, lon: 13.405, city: { en: "Berlin", "zh-CN": "柏林" }, country: { en: "Germany", "zh-CN": "德国" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "rome", group: "global", lat: 41.9028, lon: 12.4964, city: { en: "Rome", "zh-CN": "罗马" }, country: { en: "Italy", "zh-CN": "意大利" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "madrid", group: "global", lat: 40.4168, lon: -3.7038, city: { en: "Madrid", "zh-CN": "马德里" }, country: { en: "Spain", "zh-CN": "西班牙" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "amsterdam", group: "global", lat: 52.3676, lon: 4.9041, city: { en: "Amsterdam", "zh-CN": "阿姆斯特丹" }, country: { en: "Netherlands", "zh-CN": "荷兰" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "istanbul", group: "global", lat: 41.0082, lon: 28.9784, city: { en: "Istanbul", "zh-CN": "伊斯坦布尔" }, country: { en: "Turkey", "zh-CN": "土耳其" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "moscow", group: "global", lat: 55.7558, lon: 37.6173, city: { en: "Moscow", "zh-CN": "莫斯科" }, country: { en: "Russia", "zh-CN": "俄罗斯" }, continent: { en: "Europe", "zh-CN": "欧洲" } },
  { id: "new-york", group: "global", lat: 40.7128, lon: -74.006, city: { en: "New York", "zh-CN": "纽约" }, country: { en: "United States", "zh-CN": "美国" }, continent: { en: "North America", "zh-CN": "北美洲" } },
  { id: "los-angeles", group: "global", lat: 34.0522, lon: -118.2437, city: { en: "Los Angeles", "zh-CN": "洛杉矶" }, country: { en: "United States", "zh-CN": "美国" }, continent: { en: "North America", "zh-CN": "北美洲" } },
  { id: "toronto", group: "global", lat: 43.6532, lon: -79.3832, city: { en: "Toronto", "zh-CN": "多伦多" }, country: { en: "Canada", "zh-CN": "加拿大" }, continent: { en: "North America", "zh-CN": "北美洲" } },
  { id: "mexico-city", group: "global", lat: 19.4326, lon: -99.1332, city: { en: "Mexico City", "zh-CN": "墨西哥城" }, country: { en: "Mexico", "zh-CN": "墨西哥" }, continent: { en: "North America", "zh-CN": "北美洲" } },
  { id: "san-francisco", group: "global", lat: 37.7749, lon: -122.4194, city: { en: "San Francisco", "zh-CN": "旧金山" }, country: { en: "United States", "zh-CN": "美国" }, continent: { en: "North America", "zh-CN": "北美洲" } },
  { id: "sao-paulo", group: "global", lat: -23.5505, lon: -46.6333, city: { en: "Sao Paulo", "zh-CN": "圣保罗" }, country: { en: "Brazil", "zh-CN": "巴西" }, continent: { en: "South America", "zh-CN": "南美洲" } },
  { id: "buenos-aires", group: "global", lat: -34.6037, lon: -58.3816, city: { en: "Buenos Aires", "zh-CN": "布宜诺斯艾利斯" }, country: { en: "Argentina", "zh-CN": "阿根廷" }, continent: { en: "South America", "zh-CN": "南美洲" } },
  { id: "cairo", group: "global", lat: 30.0444, lon: 31.2357, city: { en: "Cairo", "zh-CN": "开罗" }, country: { en: "Egypt", "zh-CN": "埃及" }, continent: { en: "Africa", "zh-CN": "非洲" } },
  { id: "johannesburg", group: "global", lat: -26.2041, lon: 28.0473, city: { en: "Johannesburg", "zh-CN": "约翰内斯堡" }, country: { en: "South Africa", "zh-CN": "南非" }, continent: { en: "Africa", "zh-CN": "非洲" } },
  { id: "sydney", group: "global", lat: -33.8688, lon: 151.2093, city: { en: "Sydney", "zh-CN": "悉尼" }, country: { en: "Australia", "zh-CN": "澳大利亚" }, continent: { en: "Oceania", "zh-CN": "大洋洲" } },
  { id: "melbourne", group: "global", lat: -37.8136, lon: 144.9631, city: { en: "Melbourne", "zh-CN": "墨尔本" }, country: { en: "Australia", "zh-CN": "澳大利亚" }, continent: { en: "Oceania", "zh-CN": "大洋洲" } },
  { id: "beijing-cn", group: "china", lat: 39.9042, lon: 116.4074, city: { en: "Beijing", "zh-CN": "北京" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "shanghai-cn", group: "china", lat: 31.2304, lon: 121.4737, city: { en: "Shanghai", "zh-CN": "上海" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "guangzhou", group: "china", lat: 23.1291, lon: 113.2644, city: { en: "Guangzhou", "zh-CN": "广州" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "shenzhen", group: "china", lat: 22.5431, lon: 114.0579, city: { en: "Shenzhen", "zh-CN": "深圳" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "hangzhou", group: "china", lat: 30.2741, lon: 120.1551, city: { en: "Hangzhou", "zh-CN": "杭州" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "chengdu", group: "china", lat: 30.5728, lon: 104.0668, city: { en: "Chengdu", "zh-CN": "成都" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "chongqing", group: "china", lat: 29.4316, lon: 106.9123, city: { en: "Chongqing", "zh-CN": "重庆" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "nanjing", group: "china", lat: 32.0603, lon: 118.7969, city: { en: "Nanjing", "zh-CN": "南京" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "wuhan", group: "china", lat: 30.5928, lon: 114.3055, city: { en: "Wuhan", "zh-CN": "武汉" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
  { id: "xian", group: "china", lat: 34.3416, lon: 108.9398, city: { en: "Xi'an", "zh-CN": "西安" }, country: { en: "China", "zh-CN": "中国" }, continent: { en: "Asia", "zh-CN": "亚洲" } },
];

function localizeQuickCity(entry: QuickCityCatalogEntry, locale: Locale): QuickCity {
  const city = entry.city[locale];
  const country = entry.country[locale];

  return {
    id: entry.id,
    lat: entry.lat,
    lon: entry.lon,
    locale,
    city,
    country,
    continent: entry.continent[locale],
    label: city,
  };
}

export function getQuickCityGroups(locale: Locale): QuickCityGroup[] {
  return (Object.keys(groupLabels) as QuickCityGroupId[]).map((groupId) => ({
    id: groupId,
    label: groupLabels[groupId][locale],
    cities: quickCityCatalog
      .filter((entry) => entry.group === groupId)
      .map((entry) => localizeQuickCity(entry, locale)),
  }));
}

export function mapQuickCityToSearchResult(city: QuickCity): SearchResult {
  return {
    id: `quick-city:${city.id}`,
    label: city.locale === "zh-CN" ? `${city.city}，${city.country}` : `${city.city}, ${city.country}`,
    city: city.city,
    country: city.country,
    continent: city.continent,
    lat: city.lat,
    lon: city.lon,
  };
}
