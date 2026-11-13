<template>
  <TaskPoint
    class="editable-point"
    :is-disabled="isDisabled"
    :point="point"
    @update-cheked="onUpdateChecked"
  >
    <div class="editable-point__controls">
      <BaseBtn
        theme="action"
        @click="toggleModal(true)"
      >
        <template #icon>
          <SvgIcon name="edit" />
        </template>
        Редактировать
      </BaseBtn>

      <BaseBtn
        v-if="canDeletePoint"
        theme="danger"
        @click="emit('removePoint')"
      >
        <template #icon>
          <SvgIcon name="delete" />
        </template>
        Удалить
      </BaseBtn>
    </div>

    <Transition
      name="base-fade"
      @after-leave="resetBodyStyle()"
      @before-enter="freezeScroll()"
    >
      <ModalTextarea
        v-if="isShowModal"
        :title="point.title"
        @save="saveTitle"
        @cancel="onCancelModal()"
      >
        <template
          v-if="unsavePoint"
          #default
        >
          TODO-шечка не сохранена!
          <br />
          При отмене изменений будет удалена!
        </template>
      </ModalTextarea>
    </Transition>
  </TaskPoint>
</template>

<script lang="ts" setup>
const { isDisabled = false, unsavePoint = false } = defineProps<{
  isDisabled?: boolean;
  point: TaskPoint;
  canDeletePoint?: boolean;
  unsavePoint?: boolean;
}>();

const emit = defineEmits<{
  removePoint: [];
  removeUnsavePoint: [];
  updateTitle: [title: TaskPoint['title']];
  updateChecked: [title: TaskPoint['checked']];
}>();

const { isActive: isShowModal, toggleState: toggleModal } = useActiveState();

watch(
  () => unsavePoint,
  (isStart) => {
    if (isStart) {
      toggleModal(true);
    }
  },
  {
    immediate: true,
  },
);

function saveTitle(newTitle: TaskPoint['title']) {
  emit('updateTitle', newTitle);
  toggleModal(false);
}

function onUpdateChecked(newValue: boolean) {
  emit('updateChecked', newValue);
}

function onCancelModal() {
  if (unsavePoint) {
    emit('removeUnsavePoint');
    return;
  }
  toggleModal(false);
}
</script>

<style lang="scss" scoped>
.editable-point {
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
