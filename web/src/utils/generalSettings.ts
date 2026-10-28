export const DEFAULT_GENERAL_SETTINGS: API.GeneralSettings = {
  watermarkEnabled: true,
  defaultLanguage: 'en-US',
  jwtExpiryDays: 30,
  auditRetentionDays: 0,
  site: {
    frontendUrl: '',
    backendUrl: '',
  },
  webauthn: {
    enabled: false,
    rpName: 'Globalpac Console',
  },
};

export const DEFAULT_FRONTEND_SETTINGS: API.FrontendSettings = {
  watermarkEnabled: true,
  defaultLanguage: 'en-US',
  webauthnEnabled: false,
};

export const toFrontendSettings = (
  settings: API.GeneralSettings,
): API.FrontendSettings => ({
  watermarkEnabled: settings.watermarkEnabled,
  defaultLanguage: settings.defaultLanguage,
  webauthnEnabled: settings.webauthn.enabled,
});

export const getUsernameWatermark = (
  _settings: { watermarkEnabled: boolean },
  _username?: string,
) => undefined;
