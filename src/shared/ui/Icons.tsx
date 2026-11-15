// Icon re-exports backed by react-icons.
// Import from this module to stay decoupled from the underlying icon library.
import { GenIcon } from "react-icons";

/** Style tab: frame corners around a small square (Lucide-style strokes). */
export const StyleIcon = GenIcon({
  tag: "svg",
  attr: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  child: [
    { tag: "path", attr: { d: "M3 7V5a2 2 0 0 1 2-2h2" }, child: [] },
    { tag: "path", attr: { d: "M17 3h2a2 2 0 0 1 2 2v2" }, child: [] },
    { tag: "path", attr: { d: "M21 17v2a2 2 0 0 1-2 2h-2" }, child: [] },
    { tag: "path", attr: { d: "M7 21H5a2 2 0 0 1-2-2v-2" }, child: [] },
    {
      tag: "rect",
      attr: { width: "8", height: "8", x: "8", y: "8", rx: "1" },
      child: [],
    },
  ],
});

export { FaGithub as GitHubIcon } from "react-icons/fa";
export { FaStar as StarIcon } from "react-icons/fa";
export { FaRegStar as StarOutlineIcon } from "react-icons/fa";
export { FaLinkedin as LinkedInIcon } from "react-icons/fa";
export { FaInstagram as InstagramIcon } from "react-icons/fa";
export { FaRedditAlien as RedditIcon } from "react-icons/fa";
export { FaYoutube as YouTubeIcon } from "react-icons/fa";
export { FaThreads as ThreadsIcon } from "react-icons/fa6";
export { FaCheck as CheckIcon } from "react-icons/fa";
export { SiKofi as KofiIcon } from "react-icons/si";
export { BiDonateHeart as DonateIcon } from "react-icons/bi";
export { FiDownload as DownloadIcon } from "react-icons/fi";
export { FiLoader as LoaderIcon } from "react-icons/fi";
export { FaEdit as EditIcon } from "react-icons/fa";
export { FaTrashCan as TrashIcon } from "react-icons/fa6";
export { GoZoomIn as PlusIcon } from "react-icons/go";
export { GoZoomOut as MinusIcon } from "react-icons/go";
export { FiLock as LockIcon } from "react-icons/fi";
export { FiUnlock as UnlockIcon } from "react-icons/fi";
export { FiSettings as SettingsIcon } from "react-icons/fi";
export { FaGear as GearIcon } from "react-icons/fa6";
export { MdOutlineFilterCenterFocus as RecenterIcon } from "react-icons/md";
export { FiRotateCw as RotateIcon } from "react-icons/fi";
export { FiRotateCcw as RotateLeftIcon } from "react-icons/fi";
export { FiRotateCw as RotateRightIcon } from "react-icons/fi";
export { MdMyLocation as MyLocationIcon } from "react-icons/md";
export { FiMapPin as LocationIcon } from "react-icons/fi";
export { FiDroplet as ThemeIcon } from "react-icons/fi";
export { FiLayout as LayoutIcon } from "react-icons/fi";
export { FiType as TextIcon } from "react-icons/fi";
export { FiInfo as InfoIcon } from "react-icons/fi";
export { FiLayers as LayersIcon } from "react-icons/fi";
export { BsPinMap as MarkersIcon } from "react-icons/bs";
export { FaRoute as RouteIcon } from "react-icons/fa6";
export { FiChevronDown as ChevronDownIcon } from "react-icons/fi";
export { FiArrowRight as ArrowRightIcon } from "react-icons/fi";
export { FiX as CloseIcon } from "react-icons/fi";
export { FiSearch as SearchIcon } from "react-icons/fi";
export { FiGlobe as LanguageIcon } from "react-icons/fi";
export { FiExternalLink as ExternalLinkIcon } from "react-icons/fi";
export { FiRotateCcw as ResetIcon } from "react-icons/fi";
export { FiClock as HistoryIcon } from "react-icons/fi";
