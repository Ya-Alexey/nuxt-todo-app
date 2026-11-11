<template>
  <BaseOverlay @click-overaly="onClose()">
    <BaseConfirm
      ref="confirmEl"
      @reject="onClose()"
      @success="onSuccess()"
    >
      <slot></slot>
    </BaseConfirm>
  </BaseOverlay>
</template>

<script lang="ts" setup>
const CONFIRM_MODAL_ID = 'confirm-modal-id';

const emit = defineEmits<{
  success: [];
}>();

const isActive = defineModel<boolean>('isActive', {
  required: true,
});

const confirmEl = useTemplateRef('confirmEl');

useFocusTrap(() => confirmEl.value?.$el, {
  focusFirstEl: true,
});

const { register, unregister } = useOverlayManager();

const modalOverlay = {
  id: CONFIRM_MODAL_ID,
  type: 'modal',
  close: onClose,
  closeOnRouteChange: true,
  contentElement: () => confirmEl.value?.$el,
} as const satisfies OverlayInstance;

onBeforeUnmount(() => {
  unregister(CONFIRM_MODAL_ID);
});

onMounted(() => {
  register(modalOverlay);
});

function onClose() {
  isActive.value = false;
}

function onSuccess() {
  emit('success');
  onClose();
}
</script>
