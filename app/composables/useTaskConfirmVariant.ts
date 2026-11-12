interface TargetTask {
  name: 'task';
  id: Task['id'];
}

interface TargetPoint {
  name: 'point';
  index: number;
}

export type DeletingTarget = TargetTask | TargetPoint;

export const useTaskConfirmVariant = () => {
  const CONFIRM_MESSAGE_VARIANT = {
    task: 'Вы действительно хотите удалить задачку?',
    point: 'Вы действительно хотите удалить TODO-шечку?',
  } as const;

  const deletingTarget = ref<DeletingTarget | null>(null);

  const confirmMessage = computed(() => {
    const currentTarget = deletingTarget.value;
    if (!currentTarget) {
      return 'Подтвердите действие';
    }
    return CONFIRM_MESSAGE_VARIANT[currentTarget.name];
  });

  function setDeletingTarget(target: DeletingTarget) {
    deletingTarget.value = target;
  }

  return {
    deletingTarget: readonly(deletingTarget),
    confirmMessage,
    setDeletingTarget,
  };
};
