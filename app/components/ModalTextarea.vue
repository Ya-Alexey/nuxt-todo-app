<template>
  <BaseOverlay class="modal-textarea">
    <div
      ref="innerEl"
      class="modal-textarea__inner"
    >
      <div class="modal-textarea__title">Описание вашей TODO-шки</div>
      <FieldTextarea
        v-model:textarea-value="localTitle"
        class="modal-textarea__input"
        :limit-value="MAX_TEXT_FIELD_LENGTH"
        :is-required="true"
        :is-valid="isValidTitle"
        placeholder="Описание вашей TODO-шки"
        :has-inner-outline="true"
      />
      <div class="modal-textarea__controls">
        <div
          v-if="$slots.default"
          class="modal-textarea__warn"
        >
          <slot></slot>
        </div>
        <BaseBtn
          theme="action"
          :disabled="!isValidTitle"
          @click="onSave()"
        >
          Сохранить
        </BaseBtn>
        <BaseBtn
          theme="danger"
          @click="onClose()"
        >
          Отменить
        </BaseBtn>
      </div>
    </div>
  </BaseOverlay>
</template>

<script lang="ts" setup>
const { title } = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  save: [value: string];
  cancel: [];
}>();

const innerEl = useTemplateRef('innerEl');
const localTitle = ref(title);

const isValidTitle = useValidInput(localTitle, {
  maxLength: MAX_TEXT_FIELD_LENGTH,
  minLength: 2,
});

useFocusTrap(innerEl, {
  focusFirstEl: true,
});

useRegisterOverlay({
  id: 'modal-point-title',
  type: 'modal',
  close: onClose,
  closeOnRouteChange: true,
  contentElement: innerEl,
});

function onClose() {
  emit('cancel');
}

function onSave() {
  if (!isValidTitle.value) {
    return;
  }
  emit('save', localTitle.value);
}
</script>

<style lang="scss" scoped>
.modal-textarea {
  overflow: auto;
  justify-content: flex-start;
  overscroll-behavior: contain;
  .modal-textarea__input {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }
  &__inner {
    margin: auto;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    max-width: 380px;
    width: 100%;
    background-color: var(--n-10);
    padding: 16px 8px;
    border-radius: 8px;
    box-shadow: 0 2px 6px #1b5ee566;
  }
  &__controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 8px;
    row-gap: 8px;
  }
  &__warn {
    grid-column: 1/-1;
    color: var(--a-30);
    font-size: 12px;
  }
}
</style>
