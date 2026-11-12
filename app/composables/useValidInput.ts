export const useValidInput = (inputValue: MaybeRefOrGetter<string>, settings: InputValidProps) => {
  return computed(() => checkIsValidInput(toValue(inputValue), settings));
};
