export interface UseLocalStorageOptions<T> {
  validate?: (value: unknown) => value is T;
}

/**
 * Логика работы с localstorage
 */
export const useLocalStorage = <T>(key: string, defaultValue: T, options?: UseLocalStorageOptions<T>) => {
  const isClient = import.meta.client;

  const state = shallowRef<T>(readValue()) as Ref<T>;

  if (isClient) {
    watch(state, updateStorage);
    window.addEventListener('storage', handleStorageEvent);
    onScopeDispose(() => {
      window.removeEventListener('storage', handleStorageEvent);
    });
  }

  function parseAndValidate(raw: string | null): T {
    if (raw === null) {
      return defaultValue;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (options?.validate && !options.validate(parsed)) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return parsed as T;
    } catch {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
  }

  function updateStorage(storageValue: T) {
    if (!isClient) {
      return;
    }
    try {
      if (storageValue === null || storageValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storageValue));
      }
    } catch (error) {
      console.warn(`Ошибка записи ключа "${key}" в localStorage:`, error);
    }
  }

  function readValue() {
    if (!isClient) {
      return defaultValue;
    }
    return parseAndValidate(window.localStorage.getItem(key));
  }

  function handleStorageEvent(event: StorageEvent) {
    if (event.key !== key || event.storageArea !== window.localStorage) {
      return;
    }
    state.value = parseAndValidate(event.newValue);
  }

  return state;
};
