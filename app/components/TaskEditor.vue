<template>
  <div class="task-editor">
    <!-- Редактируемое название задачки -->
    <FieldTextarea
      v-model:textarea-value="currentTask.title"
      class="task-editor__title"
      :limit-value="MAX_TEXT_FIELD_LENGTH"
      :is-required="true"
      :is-valid="isValidTitle"
      placeholder="Введите название задачки"
      @update:textarea-value="
        debouncedTaskUpdate({
          ...currentTask,
          title: $event,
          status: 'draft',
        })
      "
    />

    <!-- Редактируемые тудушки -->
    <div class="task-editor__list">
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
        @prevent-history="togglePreventHistoryHandler"
      />
    </div>

    <BaseBtn
      class="task-editor__add"
      theme="action"
      @click="addNewPoint()"
    >
      <template #icon>
        <SvgIcon name="add" />
      </template>
      Добавить TODO-шку
    </BaseBtn>

    <TaskContols
      class="task-editor__bottom"
      :can-save="isValidTitle"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @save="saveTask()"
      @reset="resetTask()"
      @redo="redo()"
      @undo="undo"
      @delete="
        showConfirm({
          name: 'task',
          id: currentTask!.id,
        })
      "
    >
      {{ currentTask.updatedAt }}
    </TaskContols>

    <!-- Конфирм подтверждения удаления задчки/тудушки -->
    <Transition
      name="base-fade"
      @after-leave="resetBodyStyle()"
      @before-enter="freezeScroll()"
    >
      <LazyModalConfirm
        v-if="isShowConfirm"
        :is-active="isShowConfirm"
        @update:is-active="onCloseConfirm"
        @success="onSuccessConfirm()"
      >
        {{ confirmMessage }}
      </LazyModalConfirm>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
const { task } = defineProps<{
  task: Task;
}>();

// Блокировка Keyboard-обработчика изменения истории
const { isActive: isPreventHistoryHandler, toggleState: togglePreventHistoryHandler } = useActiveState();

// Основные действия для редактирования задачки
const {
  currentTask,
  isValidTitle,
  removeTask,
  removePoint,
  updatePoint,
  createNewPoint,
  saveTask,
  debouncedTaskUpdate,
  updateLocalTask,
  resetTask,
  undo,
  redo,
  canUndo,
  canRedo,
} = useTaskEditAction(task, isPreventHistoryHandler);

// Вариант конфирма
const { confirmTarget, confirmMessage, targetVariant, isShowConfirm, showConfirm, toggleConfirm } =
  useTaskConfirmVariant();

// Хранение измененного, но несохраненного варианта
const { resetDraft } = useDraftTask(currentTask, (draftTask) =>
  showConfirm({
    name: 'draft',
    task: draftTask,
  }),
);

// ID новосозданной тудушки, сразу открываем в модалке для редактирования
const createdPointId = ref<TaskPoint['id'] | null>(null);

// Единственную тудушку нельзя удалить
const canDeletePoint = computed(() => currentTask.value.list.length > 1);

function onSuccessConfirm() {
  const target = confirmTarget.value;
  if (!target) {
    toggleConfirm(false);
    return;
  }
  if (targetVariant.value.isTask) {
    removeTask((target as TargetTask).id);
    return;
  }
  if (targetVariant.value.isPoint) {
    removePoint((target as TargetPoint).index);
    return;
  }
  if (targetVariant.value.isDraft) {
    updateLocalTask(deepCopyUsedJson((target as TargetDraft).task));
  }
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

function onCloseConfirm(isActive: boolean) {
  if (!isActive && targetVariant.value.isDraft) {
    resetDraft();
    toggleConfirm(false);
    return;
  }
  toggleConfirm(isActive);
}
</script>

<style lang="scss" scoped>
.task-editor {
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
