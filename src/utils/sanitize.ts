/**
 * HTML sanitization utilities
 * Prevents XSS attacks when inserting dynamic content
 */

/**
 * Escape HTML entities to prevent XSS
 * Use when inserting user content into HTML text nodes
 *
 * @param unsafe String that may contain HTML
 * @returns Safe string with escaped entities
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>';
 * element.innerHTML = `<p>${escapeHtml(userInput)}</p>`;
 * // Result: <p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>
 * ```
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape value for use in HTML attributes
 * Handles additional characters that could break attributes
 *
 * @param unsafe String for attribute value
 * @returns Safe attribute value
 *
 * @example
 * ```typescript
 * const userTitle = 'Hello "World"';
 * element.innerHTML = `<div title="${escapeAttr(userTitle)}">`;
 * ```
 */
export function escapeAttr(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';

  return escapeHtml(unsafe)
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
    .replace(/\t/g, '&#09;');
}

/**
 * Sanitize value for data-* attributes
 * Only allows alphanumeric characters, hyphens, and underscores
 *
 * @param value Value to sanitize
 * @returns Safe data attribute value
 *
 * @example
 * ```typescript
 * const category = 'performance<script>';
 * element.innerHTML = `<div data-category="${sanitizeDataAttr(category)}">`;
 * // Result: <div data-category="performancescript">
 * ```
 */
export function sanitizeDataAttr(value: string | null | undefined): string {
  if (value == null) return '';

  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitize URL for use in href/src attributes
 * Blocks javascript: and data: protocols
 *
 * @param url URL to sanitize
 * @returns Safe URL or empty string if dangerous
 *
 * @example
 * ```typescript
 * const link = 'javascript:alert("xss")';
 * element.innerHTML = `<a href="${sanitizeUrl(link)}">`;
 * // Result: <a href="">
 * ```
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (url == null) return '';

  const urlStr = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript):/i;
  if (dangerousProtocols.test(urlStr)) {
    return '';
  }

  return escapeAttr(urlStr);
}

/**
 * Sanitize a number for use in HTML
 * Returns '0' for non-numeric values
 *
 * @param value Value to sanitize
 * @returns Safe numeric string
 */
export function sanitizeNumber(value: unknown): string {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return '0';
  }
  return String(num);
}

/**
 * Create safe HTML by escaping interpolated values
 * Tagged template literal for safe HTML generation
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>';
 * const html = safeHtml`<p>User said: ${userInput}</p>`;
 * // Result: <p>User said: &lt;script&gt;alert("xss")&lt;/script&gt;</p>
 * ```
 */
export function safeHtml(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    let escaped: string;
    if (typeof value === 'number') {
      escaped = String(value);
    } else if (typeof value === 'string') {
      escaped = escapeHtml(value);
    } else if (value == null) {
      escaped = '';
    } else if (typeof value === 'boolean') {
      escaped = String(value);
    } else {
      // For objects, use JSON.stringify for safe string conversion
      escaped = escapeHtml(JSON.stringify(value));
    }
    result += escaped + strings[i + 1];
  }

  return result;
}

/**
 * Mark a string as safe HTML (already sanitized)
 * Use with caution - only for trusted content
 */
export class SafeHtml {
  constructor(public readonly html: string) {}

  toString(): string {
    return this.html;
  }
}

/**
 * Check if a value is already marked as safe
 */
export function isSafeHtml(value: unknown): value is SafeHtml {
  return value instanceof SafeHtml;
}

/**
 * Sanitize CSS value to prevent injection
 * Removes potentially dangerous characters
 *
 * @param value CSS value to sanitize
 * @returns Safe CSS value
 */
export function sanitizeCss(value: string | null | undefined): string {
  if (value == null) return '';

  // Remove characters that could break out of CSS context
  return value
    .replace(/[;<>{}]/g, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(/gi, 'url(')
    .replace(/javascript:/gi, '');
}
