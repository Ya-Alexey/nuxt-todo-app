<template>
  <span
    class="base-textarea"
    :data-replicated-value="inputValue"
  >
    <textarea
      v-model="inputValue"
      v-autofocus="initialAutofocus"
      class="base-textarea__input"
      rows="1"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @blur="$emit('onFocusout')"
    ></textarea>
  </span>
</template>

<script lang="ts" setup>
const {
  placeholder = 'Введите текст',
  initialAutofocus = false,
  maxlength = undefined,
} = defineProps<{
  placeholder?: string;
  initialAutofocus?: boolean;
  maxlength?: number;
}>();

defineEmits<{
  onFocusout: [];
}>();

const inputValue = defineModel<string>('inputValue', {
  required: true,
});
</script>

<style lang="scss" scoped>
.base-textarea {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(1px, 1fr);
  line-height: 130%;
  word-break: break-word;
  &::after {
    content: attr(data-replicated-value) ' ';
    white-space: pre-wrap;
    visibility: hidden;
    font: inherit;
    letter-spacing: inherit;
    grid-area: 1 / 1 / 2 / 2;
    overflow: hidden;
  }
  &__input {
    background-color: transparent;
    resize: none;
    font: inherit;
    letter-spacing: inherit;
    border: none;
    outline: none;
    overflow: hidden;
    grid-area: 1 / 1 / 2 / 2;
    color: inherit;
    padding: 0;
    &::placeholder {
      color: var(--n-70);
      @include transition-default(opacity);
    }
    &:focus {
      &::placeholder {
        opacity: 0.5;
      }
    }
  }
}
</style>
