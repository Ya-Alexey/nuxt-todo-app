/**
 * Логика хранения несохраненного варианта
 * @param task - измененные, но не сохраненные варианты будут с полем `status: draft`
 */
export const useDraftTask = (task: Ref<Task>, startDraftAction: (draftTask: Task) => void) => {
  const draftTask = useLocalStorage<Task | null>('draft-task', null, {
    validate: isTask,
  });

  watch(task, updateDraft);

  // Если черновик есть, будет предложение его восстановить
  watch(
    draftTask,
    (newDraft) => {
      const canRestoreDraft = newDraft !== null && newDraft.id === task.value.id && newDraft.status === 'draft';
      if (!canRestoreDraft) {
        return;
      }
      startDraftAction(newDraft);
    },
    {
      immediate: true,
      once: true,
    },
  );

  function updateDraft(newTask: Task) {
    if (newTask.status === 'draft') {
      draftTask.value = newTask;
      return;
    }
    resetDraft();
  }

  function resetDraft() {
    draftTask.value = null;
  }

  return {
    resetDraft,
  };
};
