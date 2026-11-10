<template>
  <div class="task-point">
    <BaseCheckbox
      v-model="checked"
      :is-disabled="isDisabled"
      class="task-point__main"
    >
      Описание задачи Lorem ipsum dolor sit amet consectetur, adipisicing elit.
      Officia, nihil!
    </BaseCheckbox>

    <!-- <div class="task-point__controls">
      <BaseBtn theme="action">
        <template #icon>
          <SvgIcon name="edit" />
        </template>
        Редактировать
      </BaseBtn>

      <BaseBtn theme="danger">
        <template #icon>
          <SvgIcon name="delete" />
        </template>
        Удалить
      </BaseBtn>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
const { isDisabled = false } = defineProps<{
  isDisabled?: boolean;
}>();
const checked = ref(false);
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
  &__controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 12px;
    padding: 10px 8px;
    @include media('min640') {
      display: flex;
      justify-content: flex-end;
      column-gap: 16px;
    }
  }
}
</style>
