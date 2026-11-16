// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { useLocalStorage } from './useLocalStorage';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (useLocalStorage)
// ==========================================
const SPECIFICATION = {
  initialization: {
    defaultWhenEmpty: 'Должен возвращать defaultValue, если в localStorage нет записи по ключу',
    parseValidJson: 'Должен парсить и возвращать валидный JSON из localStorage при инициализации',
    fallbackOnBrokenJson: 'Должен откатываться к defaultValue и перезаписывать storage при битом JSON',
    fallbackOnFailedValidation:
      'Должен откатываться к defaultValue и перезаписывать storage, если options.validate вернул false',
  },
  reactivityAndWrite: {
    syncToStorageOnChange: 'Должен сериализовать и записывать новое значение в localStorage при изменении state.value',
    removeOnNullOrUndefined: 'Должен удалять ключ из localStorage, если state.value становится null или undefined',
    handleQuotaExceededError:
      'Не должен выбрасывать исключение при ошибке записи (например, QuotaExceededError), а логировать warning',
  },
  crossTabSyncAndCleanup: {
    updateOnStorageEvent: 'Должен обновлять state.value при внешнем событии StorageEvent с совпадающим ключом',
    ignoreOtherKeysOrAreas: 'Должен игнорировать события StorageEvent для других ключей или другого storageArea',
    removeListenerOnDispose:
      'Должен отписываться от события storage при уничтожении реактивного скоупа (onScopeDispose)',
  },
  ssrSafety: {
    returnDefaultOnServer:
      'На сервере (при отсутствии window) должен возвращать defaultValue без обращения к localStorage',
  },
} as const;

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('Инициализация и валидация данных', () => {
    it(SPECIFICATION.initialization.defaultWhenEmpty, () => {
      const scope = effectScope();
      scope.run(() => {
        const state = useLocalStorage('tasks', ['default']);
        expect(state.value).toEqual(['default']);
      });
      scope.stop();
    });

    it(SPECIFICATION.initialization.parseValidJson, () => {
      window.localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Alex' }));

      const scope = effectScope();
      scope.run(() => {
        const state = useLocalStorage('user', { id: 0, name: 'Guest' });
        expect(state.value).toEqual({ id: 1, name: 'Alex' });
      });
      scope.stop();
    });

    it(SPECIFICATION.initialization.fallbackOnBrokenJson, () => {
      window.localStorage.setItem('broken_key', '{ invalid-json');

      const scope = effectScope();
      scope.run(() => {
        const state = useLocalStorage('broken_key', { count: 0 });

        expect(state.value).toEqual({ count: 0 });
        expect(window.localStorage.getItem('broken_key')).toBe(JSON.stringify({ count: 0 }));
      });
      scope.stop();
    });

    it(SPECIFICATION.initialization.fallbackOnFailedValidation, () => {
      window.localStorage.setItem('tasks', JSON.stringify([{ wrongField: 123 }]));
      const isStringArray = (val: unknown): val is string[] =>
        Array.isArray(val) && val.every((item) => typeof item === 'string');

      const scope = effectScope();
      scope.run(() => {
        const state = useLocalStorage<string[]>('tasks', ['fallback'], {
          validate: isStringArray,
        });

        expect(state.value).toEqual(['fallback']);
        expect(window.localStorage.getItem('tasks')).toBe(JSON.stringify(['fallback']));
      });
      scope.stop();
    });
  });

  describe('Реактивность и запись в storage', () => {
    it(SPECIFICATION.reactivityAndWrite.syncToStorageOnChange, async () => {
      const scope = effectScope();
      let state!: ReturnType<typeof useLocalStorage<string[]>>;

      scope.run(() => {
        state = useLocalStorage('items', ['a']);
      });

      state.value = ['a', 'b'];
      await nextTick();

      expect(window.localStorage.getItem('items')).toBe(JSON.stringify(['a', 'b']));
      scope.stop();
    });

    it(SPECIFICATION.reactivityAndWrite.removeOnNullOrUndefined, async () => {
      window.localStorage.setItem('token', JSON.stringify('secret-123'));

      const scope = effectScope();
      let state!: ReturnType<typeof useLocalStorage<string | null | undefined>>;

      scope.run(() => {
        state = useLocalStorage<string | null | undefined>('token', null);
      });

      state.value = null;
      await nextTick();
      expect(window.localStorage.getItem('token')).toBeNull();

      state.value = 'new-token';
      await nextTick();
      expect(window.localStorage.getItem('token')).toBe(JSON.stringify('new-token'));

      state.value = undefined;
      await nextTick();
      expect(window.localStorage.getItem('token')).toBeNull();

      scope.stop();
    });

    it(SPECIFICATION.reactivityAndWrite.handleQuotaExceededError, async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const scope = effectScope();
      let state!: ReturnType<typeof useLocalStorage<string>>;

      scope.run(() => {
        state = useLocalStorage('heavy_data', 'init');
      });

      state.value = 'very-large-payload';
      await nextTick();

      expect(warnSpy).toHaveBeenCalledWith(
        'Ошибка записи ключа "heavy_data" в localStorage:',
        expect.any(DOMException),
      );
      scope.stop();
    });
  });

  describe('Межвкладочная синхронизация и очистка ресурсов', () => {
    it(SPECIFICATION.crossTabSyncAndCleanup.updateOnStorageEvent, () => {
      const scope = effectScope();
      let state!: ReturnType<typeof useLocalStorage<number>>;

      scope.run(() => {
        state = useLocalStorage('counter', 1);
      });

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'counter',
          newValue: JSON.stringify(42),
          storageArea: window.localStorage,
        }),
      );

      expect(state.value).toBe(42);
      scope.stop();
    });

    it(SPECIFICATION.crossTabSyncAndCleanup.ignoreOtherKeysOrAreas, () => {
      const scope = effectScope();
      let state!: ReturnType<typeof useLocalStorage<string>>;

      scope.run(() => {
        state = useLocalStorage('target_key', 'initial');
      });

      // Другой ключ в том же localStorage
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'another_key',
          newValue: JSON.stringify('hacked'),
          storageArea: window.localStorage,
        }),
      );
      expect(state.value).toBe('initial');

      // Тот же ключ, но из sessionStorage
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'target_key',
          newValue: JSON.stringify('from_session'),
          storageArea: window.sessionStorage,
        }),
      );
      expect(state.value).toBe('initial');

      scope.stop();
    });

    it(SPECIFICATION.crossTabSyncAndCleanup.removeListenerOnDispose, () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const scope = effectScope();

      scope.run(() => {
        useLocalStorage('cleanup_key', 'val');
      });

      scope.stop();

      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });

  describe('SSR-безопасность', () => {
    it(SPECIFICATION.ssrSafety.returnDefaultOnServer, () => {
      const getItemSpy = vi.spyOn(window.localStorage, 'getItem');
      vi.stubGlobal('window', undefined);

      const scope = effectScope();
      scope.run(() => {
        const state = useLocalStorage('ssr_key', 'server_default');
        expect(state.value).toBe('server_default');
        expect(getItemSpy).not.toHaveBeenCalled();
      });
      scope.stop();
    });
  });
});
