<template>
  <div class="task-page">
    <template v-if="currentTask">
      <Head>
        <Title>Todo App | {{ currentTask.title }}</Title>
      </Head>

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
          @remove-point="
            showConfirm({
              name: 'point',
              index: idx,
            })
          "
          @update-title="onUpdatePoint({ title: $event }, idx)"
          @update-checked="onUpdatePoint({ checked: $event }, idx)"
        />
      </div>

      <BaseBtn
        theme="action"
        @click="addNewPoint()"
      >
        <template #icon>
          <SvgIcon name="add" />
        </template>
        Добавить TODO-шку
      </BaseBtn>

      <div class="task-page__bottom">
        <BaseBtn
          class="task-page__btn"
          theme="action"
          :disabled="!isValidTitle"
          @click="onSaveTask()"
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
          @click="
            showConfirm({
              name: 'task',
              id: currentTask!.id,
            })
          "
        >
          Удалить
        </BaseBtn>
      </div>
    </template>

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
const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();
const { removeTaskById, updateTaskById, createTaskPoint, getTaskById } = taskStore;

const currentTask = ref<Task | null>(null);

watch(
  () => route.params.id,
  (newId) => {
    const task = getTaskById(newId as string);
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

const isValidTitle = useValidInput(() => currentTask.value?.title || '', {
  maxLength: MAX_TEXT_FIELD_LENGTH,
  minLength: 2,
});

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
  onRemovePoint(target.index);
}

function removeTask(taskId: Task['id']) {
  removeTaskById(taskId);
  router.push({
    name: 'index',
  });
}

function onRemovePoint(index: number) {
  const [updatedList] = removeItemByIdx(currentTask.value!.list, index);
  currentTask.value!.list = updatedList;
}

function onUpdatePoint(newPoint: Partial<TaskPoint>, pointIdx: number) {
  const taskvalue = currentTask.value;
  if (!taskvalue) {
    return;
  }
  const taskList = taskvalue.list;
  const updatedPoint = { ...taskList[pointIdx]!, ...newPoint };
  const [updatedList] = replaceItemByIdx(taskList, pointIdx, updatedPoint);
  taskvalue.list = updatedList;
}

function addNewPoint() {
  const taskvalue = currentTask.value;
  if (!taskvalue) {
    return;
  }
  const point = createTaskPoint();
  const [updatedList] = insertNewItem(taskvalue.list, point);
  taskvalue.list = updatedList;
}

function onSaveTask() {
  if (!isValidTitle || !currentTask.value) {
    return;
  }
  updateTaskById(currentTask.value);
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
