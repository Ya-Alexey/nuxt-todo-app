<template>
  <BaseOverlay>
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

useRegisterOverlay({
  id: 'modal-point-title',
  type: 'modal',
  close: onClose,
  closeOnRouteChange: true,
  contentElement: () => confirmEl.value?.$el,
});

function onClose() {
  isActive.value = false;
}

function onSuccess() {
  emit('success');
  onClose();
}
</script>
