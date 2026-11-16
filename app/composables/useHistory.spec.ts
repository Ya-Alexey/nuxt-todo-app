// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref, type Ref } from 'vue';
import { useHistory } from './useHistory';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (useHistory)
// ==========================================
const SPECIFICATION = {
  initialization: {
    cloneInitialState: 'Должен инициализировать state глубокой копией initialState без мутации оригинала',
    initialFlags: 'Должен инициализироваться с canUndo = false и canRedo = false',
  },
  snapshotsAndHistory: {
    saveSnapshotAndAdvance: 'Должен сохранять снимок состояния и активировать возможность отката (canUndo = true)',
    truncateFutureOnNewBranch: 'Должен обрезать будущую ветку истории при сохранении нового снимка после undo',
    respectMaxHistoryLimit: 'Должен вытеснять самый старый снимок при превышении лимита maxHistory',
    resetHistory: 'resetHistory должен сбрасывать историю до текущего состояния (canUndo = false, canRedo = false)',
  },
  navigation: {
    undoAndRedoSteps: 'undo и redo должны корректно перемещаться по снимкам и изолировать ссылки объектов',
    ignoreOutOfBounds: 'undo и redo не должны изменять состояние при достижении границ истории',
  },
  keyboardShortcuts: {
    ctrlZTriggersUndo: 'Ctrl+Z (и Meta+Z на Mac) должен вызывать undo и preventDefault()',
    ctrlShiftZAndCtrlYTriggerRedo: 'Ctrl+Shift+Z и Ctrl+Y должны вызывать redo и preventDefault()',
    ignoreWhenDisabled: 'Не должен реагировать на горячие клавиши, если isDisableKeyboardHandler.value === true',
    ignoreWithoutModifier: 'Не должен реагировать на клавиши Z/Y без зажатого Ctrl или Meta',
    cleanupListenerOnUnmount: 'Должен удалять глобальный обработчик keydown при размонтировании компонента',
  },
} as const;

// ==========================================
// ВСПОМОГАТЕЛЬНЫЙ МОНТИРОВЩИК ДЛЯ LIFECYCLE
// ==========================================
interface TestState {
  title: string;
  items: string[];
}

function mountUseHistory<T>(
  initialState: T,
  options?: { maxHistory?: number; isDisableKeyboardHandler?: Ref<boolean> },
) {
  let composableResult!: ReturnType<typeof useHistory<T>>;

  const TestComponent = defineComponent({
    setup() {
      composableResult = useHistory(initialState, options);
      return () => null;
    },
  });

  const wrapper = mount(TestComponent);
  return {
    ...composableResult,
    wrapper,
  };
}

function dispatchKeydown(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    metaKey: modifiers.metaKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
}

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('useHistory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Инициализация и изоляция данных', () => {
    it(SPECIFICATION.initialization.cloneInitialState, () => {
      const source: TestState = { title: 'Init', items: ['a'] };
      const { state, wrapper } = mountUseHistory(source);

      expect(state.value).toEqual({ title: 'Init', items: ['a'] });
      expect(state.value).not.toBe(source);

      // Мутация внешнего исходника не должна затрагивать внутренний state
      source.items.push('mutated');
      expect(state.value.items).toEqual(['a']);

      wrapper.unmount();
    });

    it(SPECIFICATION.initialization.initialFlags, () => {
      const { canUndo, canRedo, wrapper } = mountUseHistory({ count: 0 });

      expect(canUndo.value).toBe(false);
      expect(canRedo.value).toBe(false);

      wrapper.unmount();
    });
  });

  describe('Снимки состояния и управление лимитом истории', () => {
    it(SPECIFICATION.snapshotsAndHistory.saveSnapshotAndAdvance, () => {
      const { state, saveSnapshot, canUndo, canRedo, wrapper } = mountUseHistory({ count: 0 });

      state.value.count = 1;
      saveSnapshot();

      expect(canUndo.value).toBe(true);
      expect(canRedo.value).toBe(false);

      wrapper.unmount();
    });

    it(SPECIFICATION.snapshotsAndHistory.truncateFutureOnNewBranch, () => {
      const { state, saveSnapshot, undo, canRedo, wrapper } = mountUseHistory({ step: 'v1' });

      state.value.step = 'v2';
      saveSnapshot();

      state.value.step = 'v3';
      saveSnapshot();

      // Откатываемся на v2
      undo();
      expect(state.value.step).toBe('v2');
      expect(canRedo.value).toBe(true);

      // Создаём новую ветку v2-branch — v3 должна исчезнуть
      state.value.step = 'v2-branch';
      saveSnapshot();

      expect(canRedo.value).toBe(false);

      wrapper.unmount();
    });

    it(SPECIFICATION.snapshotsAndHistory.respectMaxHistoryLimit, () => {
      const { state, saveSnapshot, undo, canUndo, wrapper } = mountUseHistory({ step: 1 }, { maxHistory: 3 });

      state.value.step = 2;
      saveSnapshot();
      state.value.step = 3;
      saveSnapshot();
      // Сейчас в истории [1, 2, 3]. Добавляем 4 — единица должна вытесниться -> [2, 3, 4]
      state.value.step = 4;
      saveSnapshot();

      undo();
      expect(state.value.step).toBe(3);

      undo();
      expect(state.value.step).toBe(2);
      expect(canUndo.value).toBe(false);

      wrapper.unmount();
    });

    it(SPECIFICATION.snapshotsAndHistory.resetHistory, () => {
      const { state, saveSnapshot, undo, resetHistory, canUndo, canRedo, wrapper } = mountUseHistory({
        text: 'A',
      });

      state.value.text = 'B';
      saveSnapshot();
      state.value.text = 'C';
      saveSnapshot();
      undo();

      expect(canUndo.value).toBe(true);
      expect(canRedo.value).toBe(true);

      resetHistory();

      expect(state.value.text).toBe('B');
      expect(canUndo.value).toBe(false);
      expect(canRedo.value).toBe(false);

      wrapper.unmount();
    });
  });

  describe('Навигация по истории (undo / redo)', () => {
    it(SPECIFICATION.navigation.undoAndRedoSteps, () => {
      const { state, saveSnapshot, undo, redo, wrapper } = mountUseHistory<TestState>({
        title: 'First',
        items: ['1'],
      });

      state.value = { title: 'Second', items: ['1', '2'] };
      saveSnapshot();

      undo();
      expect(state.value).toEqual({ title: 'First', items: ['1'] });

      // Мутация восстановленного state не должна портить сохранённый снимок в истории
      state.value.items.push('dirty');
      redo();
      expect(state.value).toEqual({ title: 'Second', items: ['1', '2'] });

      undo();
      expect(state.value).toEqual({ title: 'First', items: ['1'] });

      wrapper.unmount();
    });

    it(SPECIFICATION.navigation.ignoreOutOfBounds, () => {
      const { state, saveSnapshot, undo, redo, wrapper } = mountUseHistory({ val: 10 });

      // В начале истории undo не меняет state
      undo();
      expect(state.value.val).toBe(10);

      state.value.val = 20;
      saveSnapshot();

      // В конце истории redo не меняет state
      redo();
      expect(state.value.val).toBe(20);

      wrapper.unmount();
    });
  });

  describe('Горячие клавиши и жизненный цикл (keydown)', () => {
    it(SPECIFICATION.keyboardShortcuts.ctrlZTriggersUndo, () => {
      const { state, saveSnapshot, wrapper } = mountUseHistory({ val: 'start' });

      state.value.val = 'changed';
      saveSnapshot();

      // Ctrl + Z (Windows/Linux)
      const ctrlEvent = dispatchKeydown('z', { ctrlKey: true });
      expect(state.value.val).toBe('start');
      expect(ctrlEvent.defaultPrevented).toBe(true);

      // Повторим для Meta + Z (macOS)
      state.value.val = 'mac-changed';
      saveSnapshot();

      const metaEvent = dispatchKeydown('Z', { metaKey: true });
      expect(state.value.val).toBe('start');
      expect(metaEvent.defaultPrevented).toBe(true);

      wrapper.unmount();
    });

    it(SPECIFICATION.keyboardShortcuts.ctrlShiftZAndCtrlYTriggerRedo, () => {
      const { state, saveSnapshot, undo, wrapper } = mountUseHistory({ val: 1 });

      state.value.val = 2;
      saveSnapshot();
      state.value.val = 3;
      saveSnapshot();

      undo();
      undo();
      expect(state.value.val).toBe(1);

      // Ctrl + Shift + Z -> шаг 2
      const shiftZEvent = dispatchKeydown('z', { ctrlKey: true, shiftKey: true });
      expect(state.value.val).toBe(2);
      expect(shiftZEvent.defaultPrevented).toBe(true);

      // Ctrl + Y -> шаг 3
      const ctrlYEvent = dispatchKeydown('y', { ctrlKey: true });
      expect(state.value.val).toBe(3);
      expect(ctrlYEvent.defaultPrevented).toBe(true);

      wrapper.unmount();
    });

    it(SPECIFICATION.keyboardShortcuts.ignoreWhenDisabled, () => {
      const isDisabled = ref(true);
      const { state, saveSnapshot, wrapper } = mountUseHistory(
        { val: 'init' },
        { isDisableKeyboardHandler: isDisabled },
      );

      state.value.val = 'updated';
      saveSnapshot();

      const event = dispatchKeydown('z', { ctrlKey: true });
      expect(state.value.val).toBe('updated');
      expect(event.defaultPrevented).toBe(false);

      // При включении обратно клавиши начинают работать
      isDisabled.value = false;
      dispatchKeydown('z', { ctrlKey: true });
      expect(state.value.val).toBe('init');

      wrapper.unmount();
    });

    it(SPECIFICATION.keyboardShortcuts.ignoreWithoutModifier, () => {
      const { state, saveSnapshot, wrapper } = mountUseHistory({ val: 'init' });

      state.value.val = 'updated';
      saveSnapshot();

      const event = dispatchKeydown('z');
      expect(state.value.val).toBe('updated');
      expect(event.defaultPrevented).toBe(false);

      wrapper.unmount();
    });

    it(SPECIFICATION.keyboardShortcuts.cleanupListenerOnUnmount, () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { wrapper } = mountUseHistory({ val: 1 });

      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
