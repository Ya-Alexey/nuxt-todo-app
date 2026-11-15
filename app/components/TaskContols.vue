<template>
  <div class="task-controls">
    <!-- Отменить -->
    <BaseBtn
      :disabled="!canUndo"
      @click="$emit('undo')"
    >
      <template #icon>
        <SvgIcon name="undo" />
      </template>
      Отменить
    </BaseBtn>

    <!-- Повторить -->
    <BaseBtn
      :disabled="!canRedo"
      @click="$emit('redo')"
    >
      <template #icon>
        <SvgIcon name="redo" />
      </template>
      Повторить
    </BaseBtn>

    <div
      v-if="$slots.default"
      class="task-controls__caption"
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
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  save: [];
  reset: [];
  delete: [];
  undo: [];
  redo: [];
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
  background-color: #f9f9f9;
  &__caption {
    width: 100%;
    text-align: right;
    font-size: 14px;
  }
  &__btn {
    flex-grow: 1;
    @include media('min800') {
      flex-grow: initial;
    }
  }
}
</style>
