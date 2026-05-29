import { z } from "zod";

// Zod Schema for individual togglable pattern rule (flat)
export const RuleItemSchema = z.object({
  pattern: z.string(),
  active: z.boolean().default(true),
});

// Infer the RuleItem type
export type RuleItem = z.infer<typeof RuleItemSchema>;

export const ProxySettingsSchema = z.object({
  isEnabled: z.boolean().default(true),
  rules: z.array(RuleItemSchema).default([]),
  language: z.enum(["en", "vi"]).default("en"),
  proxyPort: z.number().int().min(1).max(65535).default(9050),
  autoPilot: z.boolean().default(true),
});

// Infer the ProxySettings type directly from the schema
export type ProxySettings = z.infer<typeof ProxySettingsSchema>;

/**
 * Retrieves and validates proxy settings from local storage.
 * @returns Strongly typed ProxySettings
 */
export async function getProxySettings(): Promise<ProxySettings> {
  const rawData = await chrome.storage.local.get([
    "isEnabled",
    "rules",
    "language",
    "proxyPort",
    "autoPilot",
  ]);
  return ProxySettingsSchema.parse(rawData);
}

/**
 * Saves proxy settings to local storage.
 * @param settings Partial proxy settings to save
 */
export async function setProxySettings(
  settings: Partial<ProxySettings>,
): Promise<void> {
  await chrome.storage.local.set(settings);
}

/**
 * Centralizes settings initialization to ensure defaults are safely set.
 */
export async function initializeDefaultSettings(): Promise<void> {
  const rawData = await chrome.storage.local.get([
    "isEnabled",
    "rules",
    "language",
    "proxyPort",
    "autoPilot",
  ]);

  if (
    rawData.isEnabled === undefined || rawData.rules === undefined ||
    rawData.language === undefined || rawData.proxyPort === undefined ||
    rawData.autoPilot === undefined
  ) {
    const validatedDefaults = ProxySettingsSchema.parse(rawData);
    await setProxySettings(validatedDefaults);
  }
}

/**
 * Resolves a hostname to its root domain (e.g. sub.facebook.com -> facebook.com).
 * Correctly handles common multi-part Vietnamese and international second-level TLDs.
 */
export function getRootDomain(host: string): string {
  const parts = host.toLowerCase().split(".");
  if (parts.length <= 2) return host;

  // Common double country suffixes
  const commonDoubleSuffixes = [
    "co.uk",
    "me.uk",
    "org.uk",
    "com.vn",
    "net.vn",
    "org.vn",
    "edu.vn",
    "gov.vn",
    "com.cn",
    "net.cn",
    "org.cn",
    "gov.cn",
    "com.tw",
    "net.tw",
    "org.tw",
    "com.hk",
    "net.hk",
    "org.hk",
    "com.sg",
    "net.sg",
    "org.sg",
    "com.au",
    "net.au",
    "org.au",
    "co.jp",
    "or.jp",
    "ne.jp",
    "com.br",
    "net.br",
    "org.br",
  ];

  const lastTwo = parts.slice(-2).join(".");

  if (commonDoubleSuffixes.includes(lastTwo)) {
    return parts.slice(-3).join(".");
  }

  return lastTwo;
}
