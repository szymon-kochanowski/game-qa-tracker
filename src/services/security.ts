/**
 * Security and URL sanitization utilities for QA Regression Suite.
 * Validates and sanitizes external URLs to prevent javascript: pseudo-protocols or XSS vectors.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Allow standard http, https, and internal relative paths
  if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed) || /^\/[^\s]*$/i.test(trimmed)) {
    return trimmed;
  }
  // If protocol was omitted but starts with valid domain
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\//.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return '#';
}

/**
 * Strips potential HTML/script tags from user-provided text inputs.
 */
export function sanitizeText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Checks if a user has administrative lead permissions.
 */
export function isLeadAuthorized(role?: string): boolean {
  return role === 'lead' || role === 'deputy';
}
