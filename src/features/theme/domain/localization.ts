import type { Locale } from "@/core/i18n/types";
import type { Layout, LayoutGroup } from "@/features/layout/domain/types";
import type { ThemeColorKey, ThemeOption } from "@/features/theme/domain/types";

const themeNameZh: Record<string, string> = {
  blueprint: "蓝图",
  contrast_zones: "对比",
  copper: "铜色",
  coral: "珊瑚",
  heatwave: "热浪",
  midnight_blue: "午夜蓝",
  neon: "霓虹",
  ruby: "红宝石",
  rustic: "乡野",
  sage: "鼠尾草",
  terracotta: "陶土",
};

const themeDescriptionZh: Record<string, string> = {
  blueprint: "经典建筑蓝图风格，呈现技术制图气质。",
  contrast_zones: "以强对比呈现城市密度，中心更深、边缘更亮。",
  copper: "氧化奶油底色配铜色道路，带有温暖金属感。",
  coral: "柔和象牙底色搭配暖珊瑚道路和低饱和粉蓝细节。",
  heatwave: "焦黑底色配发光橙色道路与高亮细节。",
  midnight_blue: "深海军蓝背景搭配金铜色道路，呈现高级地图册质感。",
  neon: "暗色背景搭配电光粉和青色，呈现强烈夜城氛围。",
  ruby: "石榴红调色盘叠加深梅紫街区，层次浓郁。",
  rustic: "纸张般的大地底色搭配木质与陶土色道路。",
  sage: "低饱和植物系色调，绿色道路与柔和对比并存。",
  terracotta: "地中海暖调，奶油底色上叠加陶土与橙棕色道路。",
};

const layoutNameZh: Record<string, string> = {
  custom: "自定义布局",
  print_a3_portrait: "A3 纵向",
  print_a4_portrait: "A4 纵向",
  print_a5_portrait: "A5 纵向",
  print_letter_us_portrait: "美式 Letter 纵向",
  social_instagram_square: "Instagram 方形",
  social_instagram_portrait: "Instagram 纵向",
  social_instagram_story_tiktok: "Story（9:16）",
  social_linkedin_post: "LinkedIn 帖子",
  social_linkedin_cover: "LinkedIn 封面",
  social_pinterest_pin: "Pinterest 图钉",
  social_reddit_post_16_9: "Reddit 帖子（16:9）",
  social_reddit_banner: "Reddit 横幅",
  social_twitter_header: "Twitter 头图",
  social_youtube_thumbnail: "YouTube 缩略图",
  wallpaper_desktop_full_hd: "桌面 Full HD",
  wallpaper_desktop_4k: "桌面 4K",
  wallpaper_ultrawide: "桌面超宽屏",
  wallpaper_iphone_15_pro: "iPhone 15 Pro",
  wallpaper_iphone_15_pro_max: "iPhone 15 Pro Max",
  wallpaper_samsung_galaxy_s24_ultra: "Galaxy S24 Ultra",
  wallpaper_ipad_pro_11: "iPad Pro 11 寸",
  wallpaper_ipad_pro_12_9: "iPad Pro 12.9 寸",
};

const layoutDescriptionZh: Record<string, string> = {
  custom: "手动输入宽度和高度。",
  print_a3_portrait: "ISO A3 纵向格式。",
  print_a4_portrait: "基于 A4 纵向的默认打印比例。",
  print_a5_portrait: "ISO A5 纵向格式。",
  print_letter_us_portrait: "美式 Letter 纵向格式。",
  social_instagram_square: "适用于 Instagram 动态的 1:1 帖子格式。",
  social_instagram_portrait: "适用于 Instagram 的 4:5 纵向帖子格式。",
  social_instagram_story_tiktok: "适用于短视频的 9:16 竖屏格式。",
  social_linkedin_post: "标准 LinkedIn 帖子图片格式。",
  social_linkedin_cover: "LinkedIn 个人或公司封面格式。",
  social_pinterest_pin: "适用于 Pinterest 图钉的 2:3 竖向格式。",
  social_reddit_post_16_9: "适用于 Reddit 帖子的宽屏格式。",
  social_reddit_banner: "超宽的 Reddit 社区头图格式。",
  social_twitter_header: "Twitter/X 个人头图格式。",
  social_youtube_thumbnail: "适用于 YouTube 视频的 16:9 缩略图格式。",
  wallpaper_desktop_full_hd: "适用于标准显示器的 16:9 桌面壁纸。",
  wallpaper_desktop_4k: "16:9 比例的 4K UHD 壁纸。",
  wallpaper_ultrawide: "适用于 21:9 显示器的超宽壁纸。",
  wallpaper_iphone_15_pro: "适用于 iPhone 15 Pro 的竖屏壁纸格式。",
  wallpaper_iphone_15_pro_max: "适用于 iPhone 15 Pro Max 的竖屏壁纸格式。",
  wallpaper_samsung_galaxy_s24_ultra: "适用于 Samsung Galaxy S24 Ultra 的竖屏壁纸格式。",
  wallpaper_ipad_pro_11: "适用于 iPad Pro 11 英寸屏幕的壁纸格式。",
  wallpaper_ipad_pro_12_9: "适用于 iPad Pro 12.9 英寸屏幕的壁纸格式。",
};

const layoutCategoryNameZh: Record<string, string> = {
  custom: "自定义",
  print: "打印",
  social_media: "社交媒体",
  wallpaper: "壁纸",
};

const themeColorLabelZh: Record<ThemeColorKey, string> = {
  "ui.bg": "叠加层",
  "ui.text": "文字",
  "map.land": "陆地",
  "map.water": "水域",
  "map.waterway": "水道",
  "map.parks": "公园",
  "map.buildings": "建筑",
  "map.aeroway": "机场区域",
  "map.rail": "铁路",
  "map.roads.major": "主干道路",
  "map.roads.minor_high": "次级道路",
  "map.roads.minor_mid": "中等级道路",
  "map.roads.minor_low": "低等级道路",
  "map.roads.path": "小路",
  "map.roads.outline": "道路描边",
};

export function localizeThemeName(
  locale: Locale,
  themeId: string,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return themeNameZh[themeId] ?? fallback;
}

export function localizeThemeDescription(
  locale: Locale,
  themeId: string,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return themeDescriptionZh[themeId] ?? fallback;
}

export function localizeThemeOption(
  locale: Locale,
  option: ThemeOption,
): ThemeOption {
  return {
    ...option,
    name: localizeThemeName(locale, option.id, option.name),
    description: localizeThemeDescription(locale, option.id, option.description),
  };
}

export function localizeLayoutName(
  locale: Locale,
  layoutId: string,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return layoutNameZh[layoutId] ?? fallback;
}

export function localizeLayoutDescription(
  locale: Locale,
  layoutId: string,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return layoutDescriptionZh[layoutId] ?? fallback;
}

export function localizeLayoutCategoryName(
  locale: Locale,
  categoryId: string,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return layoutCategoryNameZh[categoryId] ?? fallback;
}

export function localizeLayoutOption(locale: Locale, option: Layout): Layout {
  return {
    ...option,
    name: localizeLayoutName(locale, option.id, option.name),
    description: localizeLayoutDescription(
      locale,
      option.id,
      option.description,
    ),
    categoryName: localizeLayoutCategoryName(
      locale,
      option.categoryId,
      option.categoryName,
    ),
  };
}

export function localizeLayoutGroup(
  locale: Locale,
  group: LayoutGroup,
): LayoutGroup {
  return {
    ...group,
    name: localizeLayoutCategoryName(locale, group.id, group.name),
    options: group.options.map((option) => localizeLayoutOption(locale, option)),
  };
}

export function localizeThemeColorLabel(
  locale: Locale,
  key: ThemeColorKey,
  fallback: string,
): string {
  if (locale !== "zh-CN") return fallback;
  return themeColorLabelZh[key] ?? fallback;
}
