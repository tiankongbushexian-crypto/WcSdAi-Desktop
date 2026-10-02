import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { useAppStore } from "../stores/app-store";

/** Shared download-page action; Main validates the destination and its expiry. */
export function useOpenUpdateRelease() {
  const { t } = useTranslation();
  const showToast = useAppStore((state) => state.showToast);
  return useCallback(() => {
    void api.updatesOpenReleases().catch(() => {
      showToast(t("updates.openReleaseFailed"), { variant: "error" });
    });
  }, [showToast, t]);
}
