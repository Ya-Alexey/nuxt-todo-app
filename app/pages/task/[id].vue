<template>
  <div class="task-page">
    <template v-if="currentTask">
      <Head>
        <Title>Todo App | {{ currentTask.title }}</Title>
      </Head>
      <div class="task-page__title">{{ currentTask.title }}</div>

      <div class="task-page__list">
        <TaskPoint
          v-for="(point, idx) in currentTask.list"
          :key="point.id"
          :point="point"
        >
          <div class="task-page__controls">
            <BaseBtn theme="action">
              <template #icon>
                <SvgIcon name="edit" />
              </template>
              Редактировать
            </BaseBtn>

            <BaseBtn
              theme="danger"
              @click="onRemovePoint(idx)"
            >
              <template #icon>
                <SvgIcon name="delete" />
              </template>
              Удалить
            </BaseBtn>
          </div>
        </TaskPoint>
      </div>

      <BaseBtn theme="action">
        <template #icon>
          <SvgIcon name="add" />
        </template>
        Добавить TODO-шку
      </BaseBtn>

      <div class="task-page__bottom">
        <BaseBtn
          class="task-page__btn"
          theme="action"
        >
          Сохранить
        </BaseBtn>
        <BaseBtn
          class="task-page__btn"
          theme="action"
        >
          Отменить
        </BaseBtn>
        <BaseBtn
          class="task-page__btn"
          theme="danger"
        >
          Удалить
        </BaseBtn>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const taskStore = useTaskStore();
const { tasks: taskList } = storeToRefs(taskStore);

const currentTask = ref<Task | null>(null);

watch(
  () => route.params.id,
  (newId) => {
    const task = taskList.value.find(({ id }) => id === newId);
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      });
    }
    currentTask.value = task;
  },
  {
    immediate: true,
  },
);

function onRemovePoint(index: number) {
  const answer = confirm('Вы действительно хотите удалить TODO-шку?');
  if (!answer) {
    return;
  }

  const [updatedList] = removeItemByIdx(currentTask.value!.list, index);
  currentTask.value!.list = updatedList;
}
</script>

<style lang="scss" scoped>
.task-page {
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  &__title {
    margin-bottom: 24px;
    font-size: 22px;
  }
  &__list {
    display: grid;
    row-gap: 16px;
    margin-bottom: 16px;
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
  &__bottom {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    column-gap: 8px;
    padding: 16px 0;
    position: sticky;
    bottom: 0;
    background-color: var(--n-00);
    z-index: calc(var(--z-layout-sticky) - 1);
  }
  &__btn {
    flex-grow: 1;
    @include media('min800') {
      flex-grow: initial;
    }
  }
}
</style>
