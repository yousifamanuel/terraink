import { useTranslation } from "react-i18next";

interface SettingsInfoProps {
  location: string;
  theme: string;
  layout: string;
  posterSize: string;
  markers: string;
  coordinates: string;
}

export default function SettingsInfo({
  location,
  theme,
  layout,
  posterSize,
  markers,
  coordinates,
}: SettingsInfoProps) {
  const { t } = useTranslation();
  const rows = [
    { label: t("poster.info.location"), value: location },
    { label: t("poster.info.theme"), value: theme },
    { label: t("poster.info.layout"), value: layout },
    { label: t("poster.info.posterSize"), value: posterSize },
    { label: t("poster.info.markers"), value: markers },
    { label: t("poster.info.coordinates"), value: coordinates },
  ];

  return (
    <section className="settings-info-card" aria-label={t("poster.info.ariaLabel")}>
      <h3 className="settings-info-title">{t("poster.info.title")}</h3>
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
