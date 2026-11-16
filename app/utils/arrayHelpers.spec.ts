import { describe, expect, it } from 'vitest';
import { removeItemByIdx, insertItemByIdx, insertNewItem, replaceItemByIdx } from './arrayHelpers';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (arrayHelpers)
// ==========================================
const SPECIFICATION = {
  removeItemByIdx: {
    byValidIndex: 'Должен удалять элемент по валидному индексу и возвращать новый массив с удаленным элементом',
    firstAndLast: 'Должен корректно удалять первый и последний элементы массива',
    outOfBounds: 'Должен возвращать исходный массив без изменений и undefined, если индекс вне границ',
  },
  insertItemByIdx: {
    byValidIndex: 'Должен вставлять элемент по указанному индексу со сдвигом остальных элементов',
    clampIndex: 'Должен поправить индекс в границы массива при выходе за пределы [0, length]',
    emptyArray: 'Должен корректно вставлять элемент в пустой массив',
  },
  insertNewItem: {
    appendImmutable: 'Должен добавлять новый элемент в конец массива иммутабельно',
    emptyArray: 'Должен корректно работать с пустым массивом',
  },
  replaceItemByIdx: {
    byValidIndex: 'Должен заменяет элемент по валидному индексу и возвращать новый массив',
    negativeIndex: 'Должен заменять первый элемент, если передан отрицательный индекс (clamp до 0)',
    outOfBoundsAppend: 'Должен добавлять элемент в конец массива, если targetIdx >= list.length',
  },
} as const;

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('arrayHelpers utilities', () => {
  describe('removeItemByIdx', () => {
    it(SPECIFICATION.removeItemByIdx.byValidIndex, () => {
      const original = ['a', 'b', 'c'];
      const [result, removed] = removeItemByIdx(original, 1);

      expect(result).toEqual(['a', 'c']);
      expect(removed).toBe('b');
      expect(result).not.toBe(original);
      expect(original).toEqual(['a', 'b', 'c']);
    });

    it(SPECIFICATION.removeItemByIdx.firstAndLast, () => {
      expect(removeItemByIdx([10, 20, 30], 0)).toEqual([[20, 30], 10]);
      expect(removeItemByIdx([10, 20, 30], 2)).toEqual([[10, 20], 30]);
    });

    it(SPECIFICATION.removeItemByIdx.outOfBounds, () => {
      const original = [1, 2, 3];

      expect(removeItemByIdx(original, -1)).toEqual([original, undefined]);
      expect(removeItemByIdx(original, 3)).toEqual([original, undefined]);
      expect(removeItemByIdx([], 0)).toEqual([[], undefined]);
    });
  });

  describe('insertItemByIdx', () => {
    it(SPECIFICATION.insertItemByIdx.byValidIndex, () => {
      const original = ['a', 'c'];
      const [result, inserted] = insertItemByIdx(original, 1, 'b');

      expect(result).toEqual(['a', 'b', 'c']);
      expect(inserted).toBe('b');
      expect(result).not.toBe(original);
      expect(original).toEqual(['a', 'c']);
    });

    it(SPECIFICATION.insertItemByIdx.clampIndex, () => {
      expect(insertItemByIdx([1, 2], -5, 0)).toEqual([[0, 1, 2], 0]);
      expect(insertItemByIdx([1, 2], 99, 3)).toEqual([[1, 2, 3], 3]);
    });

    it(SPECIFICATION.insertItemByIdx.emptyArray, () => {
      expect(insertItemByIdx([], 0, 'first')).toEqual([['first'], 'first']);
    });
  });

  describe('insertNewItem', () => {
    it(SPECIFICATION.insertNewItem.appendImmutable, () => {
      const original = [1, 2];
      const [result, inserted] = insertNewItem(original, 3);

      expect(result).toEqual([1, 2, 3]);
      expect(inserted).toBe(3);
      expect(result).not.toBe(original);
      expect(original).toEqual([1, 2]);
    });

    it(SPECIFICATION.insertNewItem.emptyArray, () => {
      expect(insertNewItem([], 'item')).toEqual([['item'], 'item']);
    });
  });

  describe('replaceItemByIdx', () => {
    it(SPECIFICATION.replaceItemByIdx.byValidIndex, () => {
      const original = ['a', 'b', 'c'];
      const [result, replacedWith] = replaceItemByIdx(original, 1, 'B');

      expect(result).toEqual(['a', 'B', 'c']);
      expect(replacedWith).toBe('B');
      expect(result).not.toBe(original);
      expect(original).toEqual(['a', 'b', 'c']);
    });

    it(SPECIFICATION.replaceItemByIdx.negativeIndex, () => {
      expect(replaceItemByIdx(['a', 'b'], -10, 'X')).toEqual([['X', 'b'], 'X']);
    });

    it(SPECIFICATION.replaceItemByIdx.outOfBoundsAppend, () => {
      expect(replaceItemByIdx(['a', 'b'], 5, 'Z')).toEqual([['a', 'b', 'Z'], 'Z']);
      expect(replaceItemByIdx([], 0, 'Z')).toEqual([['Z'], 'Z']);
    });
  });
});
