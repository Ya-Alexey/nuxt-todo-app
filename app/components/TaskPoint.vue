<template>
  <div
    class="task-point"
    :class="classes"
  >
    <BaseCheckbox
      :model-value="point.checked"
      :is-disabled="isDisabled"
      class="task-point__main"
    >
      {{ point.title }}
    </BaseCheckbox>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
const { isDisabled = false } = defineProps<{
  isDisabled?: boolean;
  point: TaskPoint;
}>();

const classes = computed(() => ({
  'task-point--is-disabled': isDisabled,
}));
</script>

<style lang="scss" scoped>
.task-point {
  border: 1px solid var(--n-20);
  border-radius: 8px;
  display: grid;
  overflow: hidden;
  &__main {
    padding: 8px;
  }
}
</style>
