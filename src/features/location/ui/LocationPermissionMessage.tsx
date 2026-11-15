import { useTranslation } from "react-i18next";
import { CloseIcon } from "@/shared/ui/Icons";

interface LocationPermissionMessageProps {
  message: string;
  onClose: () => void;
}

/** Location error with a close button; it also hides itself after a while. */
export default function LocationPermissionMessage({
  message,
  onClose,
}: LocationPermissionMessageProps) {
  const { t } = useTranslation();
  return (
    <p className="location-permission-message" role="alert">
      {message}
      <button
        type="button"
        className="location-permission-close"
        aria-label={t("shell.common.close")}
        title={t("shell.common.close")}
        onClick={onClose}
      >
        <CloseIcon aria-hidden="true" />
      </button>
    </p>
  );
}
