import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { useDraftTask } from './useDraftTask';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (useDraftTask)
// ==========================================
const SPECIFICATION = {
  initializationAndRestore: {
    restoreMatchingDraft:
      'Должен вызывать startDraftAction при инициализации, если в localStorage есть черновик с совпадающим ID и статусом draft',
    ignoreDifferentId: 'Не должен вызывать startDraftAction, если ID черновика не совпадает с ID текущей задачи',
    ignoreNonDraftStatus: 'Не должен вызывать startDraftAction, если статус сохраненной задачи не равен draft',
    ignoreInvalidData:
      'Не должен восстанавливать данные, если в localStorage записан невалидный объект (не проходит isTask)',
    triggerOnceOnly: 'Должен срабатывать на восстановление черновика только один раз (once: true)',
  },
  syncWithTaskChanges: {
    saveWhenDraft: 'Должен автоматически сохранять задачу в localStorage, когда её статус становится draft',
    clearWhenSaved: 'Должен очищать черновик из localStorage, если статус задачи меняется на saved (не draft)',
  },
  manualReset: {
    resetDraftAction: 'resetDraft должен принудительно очищать черновик в localStorage (устанавливать null)',
  },
} as const;

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ХЕЛПЕРЫ И ФАБРИКИ
// ==========================================
const STORAGE_KEY = 'draft-task';
const activeWrappers: Array<{ unmount: () => void }> = [];

async function withSetup<T>(composable: () => T): Promise<T> {
  let result!: T;
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        result = composable();
        return () => null;
      },
    }),
  );
  activeWrappers.push(wrapper);
  return result;
}

function createSampleTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-100',
    title: 'Исходная задача',
    status: 'saved',
    createdAt: '01.01.2026, 10:00:00',
    updatedAt: '01.01.2026, 10:00:00',
    list: [
      { id: 'pt-1', title: 'Первый пункт', checked: false },
      { id: 'pt-2', title: 'Второй пункт', checked: true },
    ],
    ...overrides,
  };
}

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('useDraftTask', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    while (activeWrappers.length > 0) {
      activeWrappers.pop()?.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('Инициализация и восстановление черновика', () => {
    it(SPECIFICATION.initializationAndRestore.restoreMatchingDraft, async () => {
      const savedDraft = createSampleTask({ id: 'task-100', title: 'Несохраненный черновик', status: 'draft' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDraft));

      const currentTask = ref(createSampleTask({ id: 'task-100', status: 'saved' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      expect(startDraftAction).toHaveBeenCalledTimes(1);
      expect(startDraftAction).toHaveBeenCalledWith(savedDraft);
    });

    it(SPECIFICATION.initializationAndRestore.ignoreDifferentId, async () => {
      const otherDraft = createSampleTask({ id: 'task-999', status: 'draft' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(otherDraft));

      const currentTask = ref(createSampleTask({ id: 'task-100', status: 'saved' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      expect(startDraftAction).not.toHaveBeenCalled();
    });

    it(SPECIFICATION.initializationAndRestore.ignoreNonDraftStatus, async () => {
      const savedTask = createSampleTask({ id: 'task-100', status: 'saved' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTask));

      const currentTask = ref(createSampleTask({ id: 'task-100', status: 'saved' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      expect(startDraftAction).not.toHaveBeenCalled();
    });

    it(SPECIFICATION.initializationAndRestore.ignoreInvalidData, async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ broken: 'object' }));

      const currentTask = ref(createSampleTask({ id: 'task-100' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      expect(startDraftAction).not.toHaveBeenCalled();
    });

    it(SPECIFICATION.initializationAndRestore.triggerOnceOnly, async () => {
      const currentTask = ref(createSampleTask({ id: 'task-100', status: 'saved' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));
      expect(startDraftAction).not.toHaveBeenCalled();

      // Имитируем переход задачи в черновик (сработает первый watcher и обновит draftTask)
      currentTask.value = createSampleTask({ id: 'task-100', title: 'Правка 1', status: 'draft' });
      await nextTick();

      // Второй watcher (с once: true) уже отработал при инициализации (на значении null) и не должен вызваться повторно
      expect(startDraftAction).not.toHaveBeenCalled();
    });
  });

  describe('Синхронизация с изменениями задачи', () => {
    it(SPECIFICATION.syncWithTaskChanges.saveWhenDraft, async () => {
      const currentTask = ref(createSampleTask({ id: 'task-100', status: 'saved' }));
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      const draftVersion = createSampleTask({ id: 'task-100', title: 'Новый заголовок', status: 'draft' });
      currentTask.value = draftVersion;
      await nextTick();

      const rawStorage = localStorage.getItem(STORAGE_KEY);
      expect(rawStorage).not.toBeNull();
      expect(JSON.parse(rawStorage!)).toEqual(draftVersion);
    });

    it(SPECIFICATION.syncWithTaskChanges.clearWhenSaved, async () => {
      const initialDraft = createSampleTask({ id: 'task-100', status: 'draft' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDraft));

      const currentTask = ref(initialDraft);
      const startDraftAction = vi.fn();

      await withSetup(() => useDraftTask(currentTask, startDraftAction));

      // Переводим задачу в статус saved (имитация сохранения)
      currentTask.value = createSampleTask({ id: 'task-100', status: 'saved' });
      await nextTick();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Ручной сброс черновика', () => {
    it(SPECIFICATION.manualReset.resetDraftAction, async () => {
      const initialDraft = createSampleTask({ id: 'task-100', status: 'draft' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDraft));

      const currentTask = ref(initialDraft);
      const startDraftAction = vi.fn();

      const { resetDraft } = await withSetup(() => useDraftTask(currentTask, startDraftAction));

      resetDraft();
      await nextTick();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
