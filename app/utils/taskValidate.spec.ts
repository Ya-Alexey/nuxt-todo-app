import { describe, expect, it } from 'vitest';
import { isTask, isTaskArray } from './taskValidate';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (taskValidate)
// ==========================================
const SPECIFICATION = {
  isTask: {
    validDraftAndSaved:
      'Должен возвращать true для валидного объекта Task со статусом draft или saved и валидным списком list',
    emptyList: 'Должен возвращать true, если массив list пуст',
    nonObjectOrNull: 'Должен возвращать false для null, undefined и примитивов',
    missingOrInvalidFields:
      'Должен возвращать false при отсутствии или неверном типе полей id, title, createdAt, updatedAt',
    invalidStatus: 'Должен возвращать false, если status отличается от "draft" или "saved"',
    invalidListType: 'Должен возвращать false, если поле list не является массивом',
    invalidTaskPoint: 'Должен возвращать false, если хотя бы один элемент в list не соответствует TaskPoint',
  },
  isTaskArray: {
    validArray: 'Должен возвращать true для массива валидных объектов Task',
    emptyArray: 'Должен возвращать true для пустого массива',
    nonArray: 'Должен возвращать false, если переданные данные не являются массивом',
    containsInvalidTask: 'Должен возвращать false, если хотя бы один элемент массива не является валидным Task',
  },
} as const;

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФАБРИКИ ДАННЫХ
// ==========================================
const createValidTaskPoint = (overrides: Record<string, unknown> = {}) => ({
  id: 'point-1',
  title: 'Подпункт задачи',
  checked: false,
  ...overrides,
});

const createValidTask = (overrides: Record<string, unknown> = {}) => ({
  id: 'task-1',
  title: 'Основная задача',
  status: 'draft' as const,
  createdAt: '2026-11-15T12:00:00.000Z',
  updatedAt: '2026-11-15T12:30:00.000Z',
  list: [createValidTaskPoint()],
  ...overrides,
});

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('taskValidate', () => {
  describe('isTask', () => {
    it(SPECIFICATION.isTask.validDraftAndSaved, () => {
      expect(isTask(createValidTask({ status: 'draft' }))).toBe(true);
      expect(isTask(createValidTask({ status: 'saved' }))).toBe(true);
    });

    it(SPECIFICATION.isTask.emptyList, () => {
      expect(isTask(createValidTask({ list: [] }))).toBe(true);
    });

    it(SPECIFICATION.isTask.nonObjectOrNull, () => {
      expect(isTask(null)).toBe(false);
      expect(isTask(undefined)).toBe(false);
      expect(isTask('task')).toBe(false);
      expect(isTask(123)).toBe(false);
      expect(isTask(true)).toBe(false);
      expect(isTask([])).toBe(false);
    });

    it(SPECIFICATION.isTask.missingOrInvalidFields, () => {
      expect(isTask(createValidTask({ id: 123 }))).toBe(false);
      expect(isTask(createValidTask({ id: undefined }))).toBe(false);
      expect(isTask(createValidTask({ title: null }))).toBe(false);
      expect(isTask(createValidTask({ createdAt: 1700000000 }))).toBe(false);
      expect(isTask(createValidTask({ updatedAt: {} }))).toBe(false);
    });

    it(SPECIFICATION.isTask.invalidStatus, () => {
      expect(isTask(createValidTask({ status: 'published' }))).toBe(false);
      expect(isTask(createValidTask({ status: '' }))).toBe(false);
      expect(isTask(createValidTask({ status: undefined }))).toBe(false);
    });

    it(SPECIFICATION.isTask.invalidListType, () => {
      expect(isTask(createValidTask({ list: null }))).toBe(false);
      expect(isTask(createValidTask({ list: 'not-an-array' }))).toBe(false);
      expect(isTask(createValidTask({ list: {} }))).toBe(false);
    });

    it(SPECIFICATION.isTask.invalidTaskPoint, () => {
      expect(
        isTask(
          createValidTask({
            list: [createValidTaskPoint(), null],
          }),
        ),
      ).toBe(false);

      expect(
        isTask(
          createValidTask({
            list: [createValidTaskPoint({ id: 42 })],
          }),
        ),
      ).toBe(false);

      expect(
        isTask(
          createValidTask({
            list: [createValidTaskPoint({ title: false })],
          }),
        ),
      ).toBe(false);

      expect(
        isTask(
          createValidTask({
            list: [createValidTaskPoint({ checked: 'true' })],
          }),
        ),
      ).toBe(false);
    });
  });

  describe('isTaskArray', () => {
    it(SPECIFICATION.isTaskArray.validArray, () => {
      const tasks = [
        createValidTask({ id: '1', status: 'draft' }),
        createValidTask({ id: '2', status: 'saved', list: [] }),
      ];

      expect(isTaskArray(tasks)).toBe(true);
    });

    it(SPECIFICATION.isTaskArray.emptyArray, () => {
      expect(isTaskArray([])).toBe(true);
    });

    it(SPECIFICATION.isTaskArray.nonArray, () => {
      expect(isTaskArray(null)).toBe(false);
      expect(isTaskArray(undefined)).toBe(false);
      expect(isTaskArray({})).toBe(false);
      expect(isTaskArray(createValidTask())).toBe(false);
      expect(isTaskArray('[]')).toBe(false);
    });

    it(SPECIFICATION.isTaskArray.containsInvalidTask, () => {
      const mixedTasks = [createValidTask({ id: '1' }), createValidTask({ id: '2', status: 'invalid' })];

      expect(isTaskArray(mixedTasks)).toBe(false);
      expect(isTaskArray([null])).toBe(false);
    });
  });
});
