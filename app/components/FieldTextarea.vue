<template>
  <div
    class="field-textarea"
    :class="classes"
  >
    <label class="field-textarea__inner">
      <BaseTextarea
        v-model:input-value="textareaValue"
        class="field-textarea__input"
        tag="span"
        :placeholder="placeholder"
        :maxlength="limitValue"
        @focusout="onFocusOut"
      />
    </label>

    <LazyLimitMessage
      v-if="limitValue"
      class="field-textarea__limit"
      :limit-value="limitValue"
      :current-value="textareaValue"
    />
  </div>
</template>

<script lang="ts" setup>
const {
  placeholder = 'Введите текст',
  isRequired = false,
  isValid = false,
  limitValue = undefined,
} = defineProps<{
  placeholder?: string;
  limitValue?: number;
  isRequired?: boolean;
  isValid?: boolean;
}>();

const textareaValue = defineModel<string>('textareaValue', {
  required: true,
});

const classes = computed(() => ({
  'field-textarea--is-required': isRequired,
  'field-textarea--is-valid': isRequired && isValid,
}));

function onFocusOut() {
  textareaValue.value = textareaValue.value.trim();
}
</script>

<style lang="scss" scoped>
.field-textarea {
  --color-label: var(--n-80);
  --bg-color: var(--n-00);
  --color-mark: transparent;
  border-radius: 8px;
  border: 1px solid var(--n-20);
  &--is-required {
    --color-mark: var(--a-30);
  }
  &--is-valid {
    --color-mark: var(--a-20);
  }
  &__inner {
    display: block;
    padding: 11px 12px;
    border-radius: 15px;
    background-color: var(--bg-color);
    position: relative;
    z-index: 1;
    &:hover {
      --color-label: var(--n-90);
    }
    &::after {
      content: '';
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--color-mark);
      @include transition-default(background-color);
    }
  }
  &__input {
    color: var(--n-90);
    font-size: inherit;
  }
  &__limit {
    padding: 0 4px 4px;
  }
}
</style>
