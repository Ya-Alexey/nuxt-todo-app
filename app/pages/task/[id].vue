<template>
  <div class="task-page">
    <Head>
      <Title>Todo App | {{ pageTitle }}</Title>
    </Head>
    <ClientOnly>
      <template #fallback>
        <div class="app-loader"></div>
      </template>
      <template v-if="currentTask">
        <FieldTextarea
          v-model:textarea-value="currentTask.title"
          class="task-page__title"
          :limit-value="MAX_TEXT_FIELD_LENGTH"
          :is-required="true"
          :is-valid="isValidTitle"
          placeholder="Введите название задачки"
        />

        <div class="task-page__list">
          <EditablePoint
            v-for="(point, idx) in currentTask.list"
            :key="point.id"
            :point="point"
            :can-delete-point="canDeletePoint"
            :unsave-point="point.id === createdPointId"
            @remove-point="
              showConfirm({
                name: 'point',
                index: idx,
              })
            "
            @remove-unsave-point="removeUnsavePoint(idx)"
            @update-title="onUpdatePoint({ title: $event }, idx)"
            @update-checked="onUpdatePoint({ checked: $event }, idx)"
          />
        </div>

        <BaseBtn
          class="task-page__add"
          theme="action"
          @click="addNewPoint()"
        >
          <template #icon>
            <SvgIcon name="add" />
          </template>
          Добавить TODO-шку
        </BaseBtn>

        <TaskContols
          class="task-page__bottom"
          :can-save="isValidTitle"
          @save="saveTask()"
          @reset="resetTask()"
          @delete="
            showConfirm({
              name: 'task',
              id: currentTask!.id,
            })
          "
        >
          {{ currentTask.updatedAt }}
        </TaskContols>
      </template>
    </ClientOnly>

    <Transition
      name="base-fade"
      @after-leave="resetBodyStyle()"
      @before-enter="freezeScroll()"
    >
      <LazyModalConfirm
        v-if="isShowConfirm"
        :is-active="isShowConfirm"
        @update:is-active="toggleConfirm"
        @success="onSuccessConfirm()"
      >
        {{ confirmMessage }}
      </LazyModalConfirm>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
const isClient = import.meta.client;
const route = useRoute();
const taskStore = useTaskStore();
const { getTaskById } = taskStore;

const currentTask = ref<Task | null>(null);
const createdPointId = ref<TaskPoint['id'] | null>(null);
const pageTitle = computed(() => currentTask.value?.title || 'Просмотр задачки');

const { isValidTitle, removeTask, removePoint, updatePoint, createNewPoint, saveTask, resetTask, initTask } =
  useTaskEditAction(currentTask);

watch(
  () => route.params.id,
  (newId) => {
    if (!isClient) {
      return;
    }
    const task = getTaskById(newId as string);
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      });
    }
    initTask(task);
  },
  {
    immediate: true,
  },
);

const canDeletePoint = computed(() => {
  const pointsLength = currentTask.value?.list.length || 0;
  return pointsLength > 1;
});

const { isActive: isShowConfirm, toggleState: toggleConfirm } = useActiveState();

const { deletingTarget, confirmMessage, setDeletingTarget } = useTaskConfirmVariant();

function showConfirm(target: DeletingTarget) {
  setDeletingTarget(target);
  toggleConfirm(true);
}

function onSuccessConfirm() {
  const target = deletingTarget.value;
  if (!target) {
    toggleConfirm(false);
    return;
  }
  if (target.name === 'task') {
    removeTask(target.id);
    return;
  }
  removePoint(target.index);
}

function addNewPoint() {
  const point = createNewPoint();
  createdPointId.value = point?.id || null;
}

function onUpdatePoint(newPoint: Partial<TaskPoint>, pointIdx: number) {
  createdPointId.value = null;
  updatePoint(newPoint, pointIdx);
}

function removeUnsavePoint(pointIndex: number) {
  createdPointId.value = null;
  removePoint(pointIndex);
}
</script>

<style lang="scss" scoped>
.task-page {
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
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
  &__add {
    margin-bottom: 32px;
  }
  &__bottom {
    margin-top: auto;
    position: sticky;
    bottom: 0;
    border-top: 1px solid var(--n-70);
    z-index: calc(var(--z-layout-sticky) - 1);
  }
}
</style>
