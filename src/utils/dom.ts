/**
 * Safe DOM utilities with null checks
 * Prevents runtime errors from missing elements
 */

/**
 * Safely query a DOM element
 * @param selector CSS selector
 * @returns Element or null
 */
export function $<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

/**
 * Query element with assertion - logs warning if not found
 * Use for elements that should exist but aren't critical
 * @param selector CSS selector
 * @param context Component name for logging
 * @returns Element or null with warning
 */
export function $warn<T extends HTMLElement = HTMLElement>(
  selector: string,
  context: string = 'Unknown'
): T | null {
  const el = document.querySelector<T>(selector);
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
export function $required<T extends HTMLElement = HTMLElement>(
  selector: string,
  context: string = 'Unknown'
): T {
  const el = document.querySelector<T>(selector);
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
export function $maybe<T extends HTMLElement = HTMLElement>(
  selector: string,
  callback: (el: T) => void
): void {
  const el = document.querySelector<T>(selector);
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
export function $parent<T extends HTMLElement = HTMLElement>(
  el: HTMLElement | null
): T | null {
  return el?.parentElement as T | null;
}

/**
 * Safely get closest ancestor matching selector
 * @param el Starting element
 * @param selector CSS selector for ancestor
 * @returns Matching ancestor or null
 */
export function $closest<T extends HTMLElement = HTMLElement>(
  el: HTMLElement | null,
  selector: string
): T | null {
  return el?.closest(selector) as T | null;
}
