import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { useRouter } from '#imports';
import { useTaskEditAction } from './useTaskEditAction';
import { useTaskStore } from '~/stores/task';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (useTaskEditAction)
// ==========================================
const SPECIFICATION = {
  initialization: {
    deepCopyTask: 'Должен инициализировать currentTask глубокой копией переданной задачи без мутации оригинала',
    initialValidation: 'Должен корректно вычислять начальную валидность заголовка isValidTitle',
    initialHistoryState: 'Должен инициализировать историю изменений с canUndo = false и canRedo = false',
  },
  pointsCrud: {
    createNewPoint: 'createNewPoint должен добавлять новый пункт в конец списка и переводить задачу в статус draft',
    updatePoint: 'updatePoint должен обновлять поля пункта по индексу и переводить задачу в статус draft',
    removePoint: 'removePoint должен удалять пункт по индексу и переводить задачу в статус draft',
  },
  historyAndLocalUpdate: {
    updateAndUndoRedo:
      'updateLocalTask должен сохранять снапшот в историю с возможностью отката (undo) и возврата (redo)',
  },
  saveAndReset: {
    preventSaveWhenInvalid: 'saveTask не должен сохранять задачу, если заголовок невалиден (!isValidTitle.value)',
    saveValidTask:
      'saveTask должен переводить задачу в статус saved, обновлять updatedAt, сохранять в стор и сбрасывать историю',
    resetToOrigin: 'resetTask должен восстанавливать исходное состояние задачи из originTask',
  },
  removeTask: {
    removeAndRedirect:
      'removeTask должен удалять задачу из стора по ID и выполнять редирект на главную страницу (index)',
  },
} as const;

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ХЕЛПЕРЫ И ФАБРИКИ
// ==========================================
const activeWrappers: Array<{ unmount: () => void }> = [];

function withSetup<T>(composable: () => T): T {
  let result!: T;
  const wrapper = mount(
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
describe('useTaskEditAction', () => {
  let pushSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());

    const router = useRouter();
    pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined as never);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 16, 12, 30, 0));
  });

  afterEach(() => {
    while (activeWrappers.length > 0) {
      activeWrappers.pop()?.unmount();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Инициализация', () => {
    it(SPECIFICATION.initialization.deepCopyTask, () => {
      const original = createSampleTask();
      const { currentTask } = withSetup(() => useTaskEditAction(original));

      expect(currentTask.value).toEqual(original);
      expect(currentTask.value).not.toBe(original);
      expect(currentTask.value.list).not.toBe(original.list);
    });

    it(SPECIFICATION.initialization.initialValidation, () => {
      const validAction = withSetup(() => useTaskEditAction(createSampleTask({ title: 'Валидно' })));
      expect(validAction.isValidTitle.value).toBe(true);

      const invalidAction = withSetup(() => useTaskEditAction(createSampleTask({ title: 'А' })));
      expect(invalidAction.isValidTitle.value).toBe(false);
    });

    it(SPECIFICATION.initialization.initialHistoryState, () => {
      const { canUndo, canRedo } = useTaskEditAction(createSampleTask());

      expect(canUndo.value).toBe(false);
      expect(canRedo.value).toBe(false);
    });
  });

  describe('Управление пунктами списка (CRUD)', () => {
    it(SPECIFICATION.pointsCrud.createNewPoint, () => {
      const task = createSampleTask({ status: 'saved' });
      const { currentTask, createNewPoint } = withSetup(() => useTaskEditAction(task));

      const created = createNewPoint();

      expect(created).toBeDefined();
      expect(currentTask.value.list).toHaveLength(3);
      expect(currentTask.value.list[2]).toEqual(created);
      expect(currentTask.value.status).toBe('draft');
    });

    it(SPECIFICATION.pointsCrud.updatePoint, () => {
      const task = createSampleTask({ status: 'saved' });
      const { currentTask, updatePoint } = withSetup(() => useTaskEditAction(task));

      updatePoint({ title: 'Обновлённый пункт', checked: true }, 0);

      expect(currentTask.value.list[0]).toEqual({
        id: 'pt-1',
        title: 'Обновлённый пункт',
        checked: true,
      });
      expect(currentTask.value.status).toBe('draft');
    });

    it(SPECIFICATION.pointsCrud.removePoint, () => {
      const task = createSampleTask({ status: 'saved' });
      const { currentTask, removePoint } = withSetup(() => useTaskEditAction(task));

      removePoint(0);

      expect(currentTask.value.list).toHaveLength(1);
      expect(currentTask.value.list[0]?.id).toBe('pt-2');
      expect(currentTask.value.status).toBe('draft');
    });
  });

  describe('История изменений (undo / redo)', () => {
    it(SPECIFICATION.historyAndLocalUpdate.updateAndUndoRedo, () => {
      const task = createSampleTask({ title: 'Шаг 1' });
      const { currentTask, updateLocalTask, undo, redo, canUndo, canRedo } = withSetup(() => useTaskEditAction(task));

      expect(canUndo.value).toBe(false);

      updateLocalTask({ title: 'Шаг 2' });
      expect(currentTask.value.title).toBe('Шаг 2');
      expect(canUndo.value).toBe(true);

      undo();
      expect(currentTask.value.title).toBe('Шаг 1');
      expect(canRedo.value).toBe(true);

      redo();
      expect(currentTask.value.title).toBe('Шаг 2');
    });
  });

  describe('Сохранение и сброс изменений', () => {
    it(SPECIFICATION.saveAndReset.preventSaveWhenInvalid, () => {
      const store = useTaskStore();
      const updateSpy = vi.spyOn(store, 'updateTaskById');
      const task = createSampleTask({ title: 'Нормальный заголовок', status: 'draft' });

      const { updateLocalTask, saveTask } = withSetup(() => useTaskEditAction(task));
      updateLocalTask({ title: '!' }); // Длина 1 < minLength (2)

      saveTask();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it(SPECIFICATION.saveAndReset.saveValidTask, () => {
      const store = useTaskStore();
      const existingTask = store.addTask();
      const updateSpy = vi.spyOn(store, 'updateTaskById');

      const { currentTask, updateLocalTask, saveTask, canUndo } = withSetup(() => useTaskEditAction(existingTask));

      updateLocalTask({ title: 'Готовая задача', status: 'draft' });
      expect(canUndo.value).toBe(true);

      saveTask();

      expect(currentTask.value.status).toBe('saved');
      expect(currentTask.value.updatedAt).toBe(new Date(2026, 10, 16, 12, 30, 0).toLocaleString('ru-RU'));
      expect(updateSpy).toHaveBeenCalledWith(currentTask.value);
      expect(canUndo.value).toBe(false);
    });

    it(SPECIFICATION.saveAndReset.resetToOrigin, () => {
      const task = createSampleTask({ title: 'Оригинальное название' });
      const { currentTask, updateLocalTask, resetTask } = withSetup(() => useTaskEditAction(task));

      updateLocalTask({ title: 'Временная правка', list: [] });
      expect(currentTask.value.title).toBe('Временная правка');

      resetTask();

      expect(currentTask.value.title).toBe('Оригинальное название');
      expect(currentTask.value.list).toHaveLength(2);
    });
  });

  describe('Удаление задачи', () => {
    it(SPECIFICATION.removeTask.removeAndRedirect, () => {
      const store = useTaskStore();
      const created = store.addTask();
      const removeSpy = vi.spyOn(store, 'removeTaskById');

      const { removeTask } = withSetup(() => useTaskEditAction(created));

      removeTask(created.id);

      expect(removeSpy).toHaveBeenCalledWith(created.id);
      expect(store.getTaskById(created.id)).toBeUndefined();
      expect(pushSpy).toHaveBeenCalledWith({ name: 'index' });
    });
  });
});
