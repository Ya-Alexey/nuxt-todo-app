<template>
  <div class="task-card">
    <div class="task-card__title">{{ task.title }}</div>

    <div class="task-card__list">
      <TaskPoint
        v-for="point in task.list"
        :key="point.id"
        :is-disabled="true"
      />
    </div>

    <div class="task-card__controls">
      <BaseBtn
        theme="action"
        tag="NuxtLink"
        :to="{
          name: 'task-id',
          params: {
            id: task.id,
          },
        }"
      >
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
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  task: Task;
}>();
</script>

<style lang="scss" scoped>
.task-card {
  padding: 16px 8px;
  border-radius: 8px;
  border: 1px solid var(--n-20);
  box-shadow: 0 1px 2px #3f7ac233;
  &__title {
    font-size: 20px;
    margin-bottom: 16px;
  }
  &__list {
    display: grid;
    row-gap: 8px;
  }
  &__controls {
    padding-top: 16px;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 12px;
    @include media('min640') {
      display: flex;
      justify-content: flex-end;
      column-gap: 16px;
    }
  }
}
</style>
