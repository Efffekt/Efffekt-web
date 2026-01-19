/**
 * Safe DOM utilities with null checks
 * Prevents runtime errors from missing elements
 */

/**
 * Safely query a DOM element
 * @param selector CSS selector
 * @returns Element or null
 */
export function $(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(selector);
}

/**
 * Query element with assertion - logs warning if not found
 * Use for elements that should exist but aren't critical
 * @param selector CSS selector
 * @param context Component name for logging
 * @returns Element or null with warning
 */
export function $warn(
  selector: string,
  context = 'Unknown'
): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) {
    console.warn(`[${context}] Element not found: ${selector}`);
  }
  return el;
}

/**
 * Query element that must exist - throws if not found
 * Use only for truly required elements
 * @param selector CSS selector
 * @param context Component name for error message
 * @throws Error if element not found
 */
export function $required(
  selector: string,
  context = 'Unknown'
): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) {
    throw new Error(`[${context}] Required element not found: ${selector}`);
  }
  return el;
}

/**
 * Safely query and operate on element if it exists
 * @param selector CSS selector
 * @param callback Function to execute with the element
 */
export function $maybe(
  selector: string,
  callback: (el: HTMLElement) => void
): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) callback(el);
}

/**
 * Query all elements matching selector
 * @param selector CSS selector
 * @returns NodeList of elements (empty if none found)
 */
export function $$(selector: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(selector);
}

/**
 * Safely get element by ID
 * @param id Element ID (without #)
 * @returns Element or null
 */
export function $id(id: string): HTMLElement | null {
  return document.getElementById(id);
}

/**
 * Check if element exists
 * @param selector CSS selector
 * @returns boolean
 */
export function $exists(selector: string): boolean {
  return document.querySelector(selector) !== null;
}

/**
 * Safely get parent element with type narrowing
 * @param el Child element
 * @returns Parent element or null
 */
export function $parent(
  el: HTMLElement | null
): HTMLElement | null {
  return el?.parentElement ?? null;
}

/**
 * Safely get closest ancestor matching selector
 * @param el Starting element
 * @param selector CSS selector for ancestor
 * @returns Matching ancestor or null
 */
export function $closest(
  el: HTMLElement | null,
  selector: string
): HTMLElement | null {
  return el?.closest<HTMLElement>(selector) ?? null;
}
