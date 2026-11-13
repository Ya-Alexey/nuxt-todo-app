<template>
  <div
    ref="rootEl"
    class="base-confirm"
  >
    <div class="base-confirm__message">
      <slot>Подтвердите действие</slot>
    </div>
    <div class="base-confirm__controls">
      <BaseBtn
        theme="action"
        @click="$emit('success')"
      >
        Да
      </BaseBtn>
      <BaseBtn
        theme="danger"
        @click="$emit('reject')"
      >
        Нет
      </BaseBtn>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  success: [];
  reject: [];
}>();
</script>

<style lang="scss" scoped>
.base-confirm {
  max-width: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  padding: 16px;
  border: 1px solid var(--n-20);
  background-color: var(--n-10);
  border-radius: 8px;
  box-shadow: 0 2px 6px #1b5ee566;
  &__controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 8px;
  }
}
</style>
