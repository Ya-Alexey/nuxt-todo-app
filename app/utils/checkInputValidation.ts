export interface InputValidProps {
  minLength?: number;
  maxLength?: number;
}

/**
 * тип для составления схемы валидации, по полям формы
 */
export type InputValidRules<TForm extends Record<keyof TForm, string>> = Record<keyof TForm, InputValidProps>;

export function checkIsValidInput(inputValue: string, { maxLength, minLength }: InputValidProps = {}) {
  const invalidLength = hasInvalidLength(inputValue, {
    maxLength,
    minLength,
  });
  return !invalidLength;
}

function hasInvalidLength(inputValue: string, { minLength = 0, maxLength }: InputValidProps = {}) {
  const valueLength = inputValue.trim().length;
  const invalidMinLength = valueLength < minLength;
  const invalidMaxLength = maxLength !== undefined && valueLength > maxLength;
  if (invalidMinLength || invalidMaxLength) {
    return true;
  }
  return false;
}
