export interface TargetTask {
  name: 'task';
  id: Task['id'];
}

export interface TargetPoint {
  name: 'point';
  index: number;
}

export interface TargetDraft {
  name: 'draft';
  task: Task;
}

export type ConfirmTarget = TargetTask | TargetPoint | TargetDraft;
type ConfirmTargetKeys = ConfirmTarget['name'];

type TargetVariants<T extends ConfirmTargetKeys = ConfirmTargetKeys> = {
  [Prop in T as `is${Capitalize<string & Prop>}`]: boolean;
};

const CONFIRM_MESSAGE_VARIANT = {
  task: 'Вы действительно хотите удалить задачку?',
  point: 'Вы действительно хотите удалить TODO-шечку?',
  draft: 'У вас есть несохраненный вариант задачки, восстановить?',
} as const satisfies Record<ConfirmTargetKeys, string>;

/**
 * Вариант конфирма для редактора задачки
 */
export const useTaskConfirmVariant = () => {
  const { isActive: isShowConfirm, toggleState: toggleConfirm } = useActiveState();
  const confirmTarget = ref<ConfirmTarget | null>(null);

  const confirmMessage = computed(() => {
    const currentTarget = confirmTarget.value;
    if (!currentTarget) {
      return 'Подтвердите действие';
    }
    return CONFIRM_MESSAGE_VARIANT[currentTarget.name];
  });

  const targetVariant = computed<TargetVariants>(() => {
    const targetName = confirmTarget.value?.name || '';
    return {
      isTask: targetName === 'task',
      isDraft: targetName === 'draft',
      isPoint: targetName === 'point',
    };
  });

  function setConfirmTarget(target: ConfirmTarget) {
    confirmTarget.value = target;
  }

  function showConfirm(target: ConfirmTarget) {
    setConfirmTarget(target);
    toggleConfirm(true);
  }

  return {
    confirmTarget: readonly(confirmTarget),
    isShowConfirm,
    confirmMessage,
    targetVariant,
    toggleConfirm,
    showConfirm,
  };
};
