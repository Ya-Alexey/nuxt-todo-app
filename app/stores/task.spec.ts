// @vitest-environment happy-dom
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { getTaskMock } from '../utils/getTaskMock';
import { useTaskStore } from './task';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (useTaskStore)
// ==========================================
const SPECIFICATION = {
  initialization: {
    defaultMocksWhenEmpty:
      'Должен инициализировать список задач дефолтными моками (getTaskMock) при пустом localStorage',
    restoreFromValidStorage:
      'Должен восстанавливать задачи из localStorage, если данные проходят валидацию isTaskArray',
    fallbackOnInvalidStorage: 'Должен откатываться к дефолтным мокам, если в localStorage лежат невалидные данные',
  },
  queries: {
    getTaskByIdFound: 'getTaskById должен находить и возвращать существующую задачу по её id',
    getTaskByIdNotFound: 'getTaskById должен возвращать undefined, если задача с таким id не найдена',
  },
  mutations: {
    addTask: 'addTask должен создавать новую задачу с уникальным id, дефолтным пунктом и добавлять её в конец списка',
    createTaskPoint: 'createTaskPoint должен генерировать новый невыполненный пункт (checked: false) с уникальным id',
    updateExistingTask: 'updateTaskById должен обновлять существующую задачу на её текущей позиции в списке',
    upsertMissingTask: 'updateTaskById должен добавлять задачу в конец списка, если переданный id отсутствует (upsert)',
    removeTaskByIndex: 'removeTaskByIndex должен удалять задачу по индексу в списке',
    removeTaskById: 'removeTaskById должен находить и удалять задачу по её id',
    ignoreUnknownIdOnRemove: 'removeTaskById не должен изменять список, если передан несуществующий id',
  },
  persistence: {
    syncChangesToStorage: 'Любые изменения списка задач должны синхронизироваться с localStorage',
  },
} as const;

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('useTaskStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Инициализация стора', () => {
    it(SPECIFICATION.initialization.defaultMocksWhenEmpty, () => {
      const store = useTaskStore();
      const defaultTasks = getTaskMock();

      expect(store.tasks).toEqual(defaultTasks);
      expect(store.tasks).toHaveLength(defaultTasks.length);
    });

    it(SPECIFICATION.initialization.restoreFromValidStorage, () => {
      const storedTasks = [
        {
          id: 'custom-1',
          title: 'Задача из хранилища',
          status: 'saved' as const,
          createdAt: '15.11.2026, 10:00:00',
          updatedAt: '15.11.2026, 10:00:00',
          list: [{ id: 'pt-1', title: 'Пункт 1', checked: true }],
        },
      ];
      window.localStorage.setItem('task', JSON.stringify(storedTasks));

      const store = useTaskStore();

      expect(store.tasks).toEqual(storedTasks);
    });

    it(SPECIFICATION.initialization.fallbackOnInvalidStorage, () => {
      window.localStorage.setItem('task', JSON.stringify([{ invalidField: true }]));

      const store = useTaskStore();
      const defaultTasks = getTaskMock();

      expect(store.tasks).toEqual(defaultTasks);
    });
  });

  describe('Поиск задач', () => {
    it(SPECIFICATION.queries.getTaskByIdFound, () => {
      const store = useTaskStore();
      const created = store.addTask();

      const found = store.getTaskById(created.id);

      expect(found).toEqual(created);
    });

    it(SPECIFICATION.queries.getTaskByIdNotFound, () => {
      const store = useTaskStore();

      expect(store.getTaskById('non-existent-id')).toBeUndefined();
    });
  });

  describe('Создание, обновление и удаление', () => {
    it(SPECIFICATION.mutations.addTask, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-15T12:30:00'));

      const store = useTaskStore();
      const initialLength = store.tasks.length;

      const created = store.addTask();

      expect(store.tasks).toHaveLength(initialLength + 1);
      expect(store.tasks.at(-1)).toEqual(created);
      expect(created).toMatchObject({
        title: 'Новая задачка',
        status: 'saved',
      });
      expect(typeof created.id).toBe('string');
      expect(created.id.length).toBeGreaterThan(0);
      expect(created.createdAt).toBe(created.updatedAt);
      expect(created.list).toHaveLength(1);
      expect(created.list[0]).toMatchObject({
        title: 'Новая TODO-шечка',
        checked: false,
      });
    });

    it(SPECIFICATION.mutations.createTaskPoint, () => {
      const store = useTaskStore();

      const point1 = store.createTaskPoint();
      const point2 = store.createTaskPoint();

      expect(point1).toMatchObject({
        title: 'Новая TODO-шечка',
        checked: false,
      });
      expect(typeof point1.id).toBe('string');
      expect(point1.id).not.toBe(point2.id);
    });

    it(SPECIFICATION.mutations.updateExistingTask, () => {
      const store = useTaskStore();
      const firstAdded = store.addTask();
      const secondAdded = store.addTask();
      const targetIndex = store.tasks.findIndex((t) => t.id === firstAdded.id);

      const updatedTask = {
        ...firstAdded,
        title: 'Обновлённый заголовок',
        status: 'draft' as const,
      };

      store.updateTaskById(updatedTask);

      expect(store.tasks[targetIndex]).toEqual(updatedTask);
      expect(store.tasks.at(-1)?.id).toBe(secondAdded.id);
    });

    it(SPECIFICATION.mutations.upsertMissingTask, () => {
      const store = useTaskStore();
      const initialLength = store.tasks.length;

      const brandNewTask = {
        id: 'external-task-id',
        title: 'Восстановленная задача',
        status: 'saved' as const,
        createdAt: '15.11.2026, 14:00:00',
        updatedAt: '15.11.2026, 14:00:00',
        list: [],
      };

      store.updateTaskById(brandNewTask);

      expect(store.tasks).toHaveLength(initialLength + 1);
      expect(store.tasks.at(-1)).toEqual(brandNewTask);
    });

    it(SPECIFICATION.mutations.removeTaskByIndex, () => {
      const store = useTaskStore();
      const created = store.addTask();
      const targetIndex = store.tasks.length - 1;

      store.removeTaskByIndex(targetIndex);

      expect(store.getTaskById(created.id)).toBeUndefined();
    });

    it(SPECIFICATION.mutations.removeTaskById, () => {
      const store = useTaskStore();
      const created = store.addTask();

      store.removeTaskById(created.id);

      expect(store.getTaskById(created.id)).toBeUndefined();
    });

    it(SPECIFICATION.mutations.ignoreUnknownIdOnRemove, () => {
      const store = useTaskStore();
      const snapshotBefore = [...store.tasks];

      store.removeTaskById('unknown-id-999');

      expect(store.tasks).toEqual(snapshotBefore);
    });
  });

  describe('Синхронизация с localStorage', () => {
    it(SPECIFICATION.persistence.syncChangesToStorage, async () => {
      const store = useTaskStore();
      const created = store.addTask();

      await nextTick();

      const raw = window.localStorage.getItem('task');
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.at(-1)).toEqual(created);
    });
  });
});
