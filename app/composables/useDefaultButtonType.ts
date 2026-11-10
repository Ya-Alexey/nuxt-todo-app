import type { ButtonHTMLAttributes } from 'vue';

/**
 * дефолтный атрибут type для тэга button
 */
export const useDefaultButtonType = (
  isButtonTag: MaybeRefOrGetter<boolean>,
) => {
  const attrs = useAttrs();

  const defaultBtnType = computed<ButtonHTMLAttributes['type'] | undefined>(
    () => {
      if (toValue(isButtonTag) && attrs.type === undefined) {
        return 'button';
      }
      return;
    },
  );

  return defaultBtnType;
};
