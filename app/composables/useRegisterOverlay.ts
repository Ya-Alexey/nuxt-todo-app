export const useRegisterOverlay = (overlay: OverlayInstance) => {
  const { register, unregister } = useOverlayManager();

  onBeforeUnmount(() => {
    unregister(overlay.id);
  });

  onMounted(() => {
    register(overlay);
  });
};
