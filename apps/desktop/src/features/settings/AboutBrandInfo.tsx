import { useTranslation } from "react-i18next";
import { SettingsCard, SettingsRow } from "./primitives";

/** Product identity and upstream attribution stay visible in Settings → Info. */
export function AboutBrandInfo() {
  const { t } = useTranslation();
  return (
    <SettingsCard title={t("brand.aboutTitle")}>
      <SettingsRow title={t("app.tagline")}>
        <span className="text-text-muted">{t("brand.copyright")}</span>
      </SettingsRow>
      <SettingsRow title={t("brand.website")}>
        <a className="settings-text-action" href="https://wanchuangsd.cn" target="_blank" rel="noreferrer">
          wanchuangsd.cn
        </a>
      </SettingsRow>
      <SettingsRow title={t("brand.support")}>
        <span className="select-text">2222223323@qq.com</span>
      </SettingsRow>
      <SettingsRow title={t("brand.licenseTitle")} detail={t("brand.upstreamAttribution")}>
        <a
          className="settings-text-action"
          href="https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop"
          target="_blank"
          rel="noreferrer"
        >
          {t("brand.sourceCode")}
        </a>
      </SettingsRow>
    </SettingsCard>
  );
}
