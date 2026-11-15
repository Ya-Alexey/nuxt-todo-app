<template>
  <div class="task-card">
    <div class="task-card__title">{{ task.title }}</div>

    <div class="task-card__list">
      <template
        v-for="(point, idx) in task.list"
        :key="point.id"
      >
        <TaskPoint
          v-if="idx < MAX_VISIBLE_POINT_COUNT"
          :is-disabled="true"
          :point="point"
          :is-short-view="true"
        />
      </template>
      <div
        v-if="countHiddenPoint > 0"
        class="task-card__note"
      >
        И еще {{ countHiddenPoint }} шт.
      </div>
    </div>

    <div class="task-card__controls">
      <BaseBtn
        theme="action"
        tag="NuxtLink"
        :to="{
          name: PAGE_TASK_ID,
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

      <BaseBtn
        theme="danger"
        @click="toggleConfirm(true)"
      >
        <template #icon>
          <SvgIcon name="delete" />
        </template>
        Удалить
      </BaseBtn>

      <Transition
        name="base-fade"
        @after-leave="resetBodyStyle()"
        @before-enter="freezeScroll()"
      >
        <LazyModalConfirm
          v-if="isShowConfirm"
          :is-active="isShowConfirm"
          @update:is-active="toggleConfirm"
          @success="$emit('removeTask')"
        >
          Вы действительно хотите удалить задачку?
        </LazyModalConfirm>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
const MAX_VISIBLE_POINT_COUNT = 2;

const { task } = defineProps<{
  task: Task;
}>();

defineEmits<{
  removeTask: [];
}>();

const { isActive: isShowConfirm, toggleState: toggleConfirm } = useActiveState();
const countHiddenPoint = computed(() => task.list.length - MAX_VISIBLE_POINT_COUNT);

onBeforeUnmount(() => {
  resetBodyStyle();
});
</script>

<style lang="scss" scoped>
.task-card {
  display: flex;
  flex-direction: column;
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
  &__note {
    padding: 4px;
    font-size: 14px;
  }
  &__controls {
    margin-top: auto;
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
