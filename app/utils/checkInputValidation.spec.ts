import { describe, expect, it } from 'vitest';
import { checkIsValidInput } from './checkInputValidation';

// ==========================================
// ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (checkInputValidation)
// ==========================================
const SPECIFICATION = {
  defaultRules: {
    withoutOptions: 'Должен считать валидной любую строку (включая пустую), если правила не переданы',
    emptyObjectOptions: 'Должен считать валидной строку, если передан пустой объект правил {}',
  },
  minLength: {
    validLength: 'Должен возвращать true, если длина строки больше или равна minLength',
    tooShort: 'Должен возвращать false, если длина строки меньше minLength',
    zeroMinLength: 'Должен корректно работать при minLength = 0',
  },
  maxLength: {
    validLength: 'Должен возвращать true, если длина строки меньше или равна maxLength',
    tooLong: 'Должен возвращать false, если длина строки превышает maxLength',
    zeroMaxLength: 'Должен разрешать только пустую строку (или строку из пробелов) при maxLength = 0',
  },
  combinedRange: {
    insideRange: 'Должен возвращать true, если длина строки находится строго в диапазоне [minLength, maxLength]',
    outsideRange: 'Должен возвращать false, если длина строки выходит за нижнюю или верхнюю границу диапазона',
  },
  whitespaceTrimming: {
    ignoreLeadingTrailingSpaces: 'Должен обрезать пробелы по краям (trim) перед подсчетом длины',
    spacesOnlyFailMinLength: 'Должен возвращать false для строки из одних пробелов при minLength > 0',
    spacesOnlyPassMaxLength: 'Должен считать строку из пробелов имеющей длину 0 при проверке maxLength',
  },
} as const;

// ==========================================
// РЕАЛИЗАЦИЯ ТЕСТОВ
// ==========================================
describe('checkInputValidation', () => {
  describe('Правила по умолчанию', () => {
    it(SPECIFICATION.defaultRules.withoutOptions, () => {
      expect(checkIsValidInput('')).toBe(true);
      expect(checkIsValidInput('abc')).toBe(true);
      expect(checkIsValidInput('   ')).toBe(true);
    });

    it(SPECIFICATION.defaultRules.emptyObjectOptions, () => {
      expect(checkIsValidInput('', {})).toBe(true);
      expect(checkIsValidInput('hello', {})).toBe(true);
    });
  });

  describe('Ограничение minLength', () => {
    it(SPECIFICATION.minLength.validLength, () => {
      expect(checkIsValidInput('abc', { minLength: 3 })).toBe(true);
      expect(checkIsValidInput('abcd', { minLength: 3 })).toBe(true);
    });

    it(SPECIFICATION.minLength.tooShort, () => {
      expect(checkIsValidInput('ab', { minLength: 3 })).toBe(false);
      expect(checkIsValidInput('', { minLength: 1 })).toBe(false);
    });

    it(SPECIFICATION.minLength.zeroMinLength, () => {
      expect(checkIsValidInput('', { minLength: 0 })).toBe(true);
      expect(checkIsValidInput('a', { minLength: 0 })).toBe(true);
    });
  });

  describe('Ограничение maxLength', () => {
    it(SPECIFICATION.maxLength.validLength, () => {
      expect(checkIsValidInput('abc', { maxLength: 3 })).toBe(true);
      expect(checkIsValidInput('ab', { maxLength: 3 })).toBe(true);
      expect(checkIsValidInput('', { maxLength: 3 })).toBe(true);
    });

    it(SPECIFICATION.maxLength.tooLong, () => {
      expect(checkIsValidInput('abcd', { maxLength: 3 })).toBe(false);
    });

    it(SPECIFICATION.maxLength.zeroMaxLength, () => {
      expect(checkIsValidInput('', { maxLength: 0 })).toBe(true);
      expect(checkIsValidInput('   ', { maxLength: 0 })).toBe(true);
      expect(checkIsValidInput('a', { maxLength: 0 })).toBe(false);
    });
  });

  describe('Комбинированный диапазон [minLength, maxLength]', () => {
    const rules = { minLength: 3, maxLength: 5 };

    it(SPECIFICATION.combinedRange.insideRange, () => {
      expect(checkIsValidInput('abc', rules)).toBe(true);
      expect(checkIsValidInput('abcd', rules)).toBe(true);
      expect(checkIsValidInput('abcde', rules)).toBe(true);
    });

    it(SPECIFICATION.combinedRange.outsideRange, () => {
      expect(checkIsValidInput('ab', rules)).toBe(false);
      expect(checkIsValidInput('abcdef', rules)).toBe(false);
    });
  });

  describe('Обработка пробелов (trim)', () => {
    it(SPECIFICATION.whitespaceTrimming.ignoreLeadingTrailingSpaces, () => {
      expect(checkIsValidInput('  abc  ', { minLength: 3, maxLength: 3 })).toBe(true);
      expect(checkIsValidInput('   ab   ', { minLength: 3 })).toBe(false);
    });

    it(SPECIFICATION.whitespaceTrimming.spacesOnlyFailMinLength, () => {
      expect(checkIsValidInput('     ', { minLength: 1 })).toBe(false);
    });

    it(SPECIFICATION.whitespaceTrimming.spacesOnlyPassMaxLength, () => {
      expect(checkIsValidInput('     ', { maxLength: 2 })).toBe(true);
    });
  });
});
