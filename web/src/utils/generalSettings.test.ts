import { expect, test } from '@jest/globals';
import { getUsernameWatermark, toFrontendSettings } from './generalSettings';

test('never paints a tiled username watermark', () => {
  expect(
    getUsernameWatermark({ watermarkEnabled: true }, 'alice'),
  ).toBeUndefined();
  expect(
    getUsernameWatermark({ watermarkEnabled: false }, 'alice'),
  ).toBeUndefined();
  expect(
    getUsernameWatermark({ watermarkEnabled: true }, undefined),
  ).toBeUndefined();
});

test('maps general settings to frontend settings', () => {
  const general: API.GeneralSettings = {
    watermarkEnabled: true,
    defaultLanguage: 'en-US',
    jwtExpiryDays: 30,
    auditRetentionDays: 0,
    site: {
      frontendUrl: 'https://a.example.com',
      backendUrl: 'https://b.example.com',
    },
    webauthn: { enabled: true, rpName: 'Globalpac Console' },
  };
  expect(toFrontendSettings(general)).toEqual({
    watermarkEnabled: true,
    defaultLanguage: 'en-US',
    webauthnEnabled: true,
  });
});
