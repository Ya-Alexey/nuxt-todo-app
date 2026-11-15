/**
 * Обертка для создания debounce обработчиков
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDebounceHandler<T extends (...args: any[]) => any>(callback: T, waitTime = 800) {
  let timeoutId: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, waitTime);
  };
}
