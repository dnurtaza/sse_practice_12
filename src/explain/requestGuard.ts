/**
 * Keeps only the newest async request. Every start() or invalidate() makes all
 * earlier request ids stale, so a late response can be ignored.
 */
export function createRequestGuard() {
  let current = 0;
  return {
    start: (): number => ++current,
    invalidate: (): void => {
      current += 1;
    },
    isCurrent: (id: number): boolean => id === current,
  };
}
