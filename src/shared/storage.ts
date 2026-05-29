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
 * Resolves a hostname to its domain, preserving subdomains while stripping any 'www.' prefix.
 * e.g. mail.google.com -> mail.google.com, www.google.com -> google.com
 */
export function getRootDomain(host: string): string {
  const normalized = host.toLowerCase().trim();
  if (normalized.startsWith("www.")) {
    return normalized.substring(4);
  }
  return normalized;
}
