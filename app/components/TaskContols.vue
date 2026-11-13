<template>
  <div class="task-controls">
    <div
      v-if="$slots.default"
      class="task-controls__top"
    >
      Последнее сохранение:
      <span>
        <slot></slot>
      </span>
    </div>

    <!-- Сохранить -->
    <BaseBtn
      class="task-controls__btn"
      theme="action"
      :disabled="!canSave"
      @click="$emit('save')"
    >
      Сохранить
    </BaseBtn>

    <!-- Сбросить -->
    <BaseBtn
      class="task-controls__btn"
      theme="action"
      @click="$emit('reset')"
    >
      Сбросить
    </BaseBtn>

    <!-- Удалить -->
    <BaseBtn
      class="task-controls__btn"
      theme="danger"
      @click="$emit('delete')"
    >
      Удалить
    </BaseBtn>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  canSave: boolean;
}>();

defineEmits<{
  save: [];
  reset: [];
  delete: [];
}>();
</script>

<style lang="scss" scoped>
.task-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  column-gap: 8px;
  row-gap: 16px;
  padding: 16px 0;
  background-color: var(--n-00);
  &__top {
    width: 100%;
    text-align: right;
  }
  &__btn {
    flex-grow: 1;
    @include media('min800') {
      flex-grow: initial;
    }
  }
}
</style>
