/**
 * Event listener management with automatic cleanup
 * Prevents memory leaks with Astro View Transitions
 */

type CleanupFn = () => void;

interface ListenerScope {
  /**
   * Add an event listener that will be cleaned up when cleanup() is called
   */
  add<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void;
  add<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (ev: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void;
  add<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void;
  add(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): void;

  /**
   * Remove all listeners added through this scope
   */
  cleanup: CleanupFn;

  /**
   * Check if scope has been cleaned up
   */
  isCleanedUp: boolean;
}

/**
 * Create a scoped event listener manager
 * Uses AbortController for efficient cleanup
 *
 * @example
 * ```typescript
 * let scope: ListenerScope | null = null;
 *
 * function init() {
 *   scope?.cleanup();
 *   scope = createListenerScope();
 *
 *   scope.add(window, 'scroll', handleScroll);
 *   scope.add(button, 'click', handleClick);
 * }
 *
 * document.addEventListener('astro:before-swap', () => scope?.cleanup());
 * ```
 */
export function createListenerScope(): ListenerScope {
  const controller = new AbortController();
  let cleanedUp = false;

  return {
    add(
      target: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions = {}
    ): void {
      if (cleanedUp) {
        console.warn('[ListenerScope] Cannot add listener to cleaned up scope');
        return;
      }

      target.addEventListener(type, listener, {
        ...options,
        signal: controller.signal,
      });
    },

    cleanup(): void {
      if (!cleanedUp) {
        controller.abort();
        cleanedUp = true;
      }
    },

    get isCleanedUp(): boolean {
      return cleanedUp;
    }
  };
}

/**
 * Registry for component-level cleanup
 */
const componentCleanups = new Map<string, CleanupFn[]>();

/**
 * Register a cleanup function for a component
 * Will be called on astro:before-swap
 *
 * @param componentId Unique identifier for the component
 * @param cleanup Function to call on cleanup
 */
export function registerCleanup(componentId: string, cleanup: CleanupFn): void {
  if (!componentCleanups.has(componentId)) {
    componentCleanups.set(componentId, []);
  }
  componentCleanups.get(componentId)!.push(cleanup);
}

/**
 * Run cleanup for a specific component
 * @param componentId Component identifier
 */
export function runCleanup(componentId: string): void {
  const cleanups = componentCleanups.get(componentId);
  if (cleanups) {
    cleanups.forEach(fn => fn());
    componentCleanups.delete(componentId);
  }
}

/**
 * Run all registered cleanups
 * Called automatically on astro:before-swap if initEventCleanup is called
 */
export function runAllCleanups(): void {
  componentCleanups.forEach((cleanups) => {
    cleanups.forEach(fn => fn());
  });
  componentCleanups.clear();
}

// Track if cleanup system is initialized
let cleanupInitialized = false;

/**
 * Initialize the global cleanup system
 * Call once in BaseLayout to enable automatic cleanup on navigation
 *
 * @example
 * ```typescript
 * // In BaseLayout.astro <script>
 * import { initEventCleanup } from '../utils/events';
 * initEventCleanup();
 * ```
 */
export function initEventCleanup(): void {
  if (cleanupInitialized) return;

  document.addEventListener('astro:before-swap', () => {
    runAllCleanups();
  });

  cleanupInitialized = true;
}

/**
 * Create a debounced version of a function
 * Useful for scroll/resize handlers
 *
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Create a throttled version of a function
 * Useful for scroll handlers that need immediate response
 *
 * @param fn Function to throttle
 * @param limit Minimum time between calls in milliseconds
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
