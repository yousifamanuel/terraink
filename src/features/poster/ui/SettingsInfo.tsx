import { useLocale } from "@/core/i18n/LocaleContext";

interface SettingsInfoProps {
  location: string;
  theme: string;
  layout: string;
  posterSize: string;
  markerCount: number;
  coordinates: string;
}

export default function SettingsInfo({
  location,
  theme,
  layout,
  posterSize,
  markerCount,
  coordinates,
}: SettingsInfoProps) {
  const { t } = useLocale();
  const markerWord =
    markerCount === 1 ? t("markers.markerWord.one") : t("markers.markerWord.other");
  const rows = [
    { label: t("settingsInfo.location"), value: location },
    { label: t("settingsInfo.theme"), value: theme },
    { label: t("settingsInfo.layout"), value: layout },
    { label: t("settingsInfo.posterSize"), value: posterSize },
    {
      label: t("settingsInfo.markers"),
      value: t("settingsInfo.markersCount", {
        count: markerCount,
        markerWord,
      }),
    },
    { label: t("settingsInfo.coordinates"), value: coordinates },
  ];

  return (
    <section
      className="settings-info-card"
      aria-label={t("settingsInfo.currentAria")}
    >
      <h3 className="settings-info-title">{t("settingsInfo.currentTitle")}</h3>
      <dl className="settings-info-list">
        {rows.map((row) => (
          <div key={row.label} className="settings-info-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
