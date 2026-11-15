/**
 * Основные действия для редактирования задачки
 */
export const useTaskEditAction = (initTask: Task, isDisableKeyboardHandler?: Ref<boolean>) => {
  const router = useRouter();
  const taskStore = useTaskStore();
  const {
    state: currentTask,
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useHistory(initTask, {
    isDisableKeyboardHandler,
  });

  const { removeTaskById, updateTaskById, createTaskPoint } = taskStore;
  let originTask: Task = deepCopyUsedJson(currentTask.value);

  const debouncedTaskUpdate = createDebounceHandler(updateLocalTask);

  const isValidTitle = useValidInput(() => currentTask.value.title, {
    maxLength: MAX_TEXT_FIELD_LENGTH,
    minLength: 2,
  });

  function removeTask(taskId: Task['id']) {
    removeTaskById(taskId);
    router.push({
      name: 'index',
    });
  }

  function removePoint(index: number) {
    const [updatedList] = removeItemByIdx(currentTask.value.list, index);
    updateLocalTask({
      list: updatedList,
      status: 'draft',
    });
  }

  function updatePoint(newPoint: Partial<TaskPoint>, pointIdx: number) {
    const taskvalue = currentTask.value;
    if (!taskvalue) {
      return;
    }
    const taskList = taskvalue.list;
    const updatedPoint = { ...taskList[pointIdx]!, ...newPoint };
    const [updatedList] = replaceItemByIdx(taskList, pointIdx, updatedPoint);
    updateLocalTask({
      list: updatedList,
      status: 'draft',
    });
  }

  function createNewPoint() {
    const taskvalue = currentTask.value;
    if (!taskvalue) {
      return;
    }
    const point = createTaskPoint();
    const [updatedList] = insertNewItem(taskvalue.list, point);
    updateLocalTask({
      list: updatedList,
      status: 'draft',
    });
    return point;
  }

  function saveTask() {
    if (!isValidTitle || !currentTask.value) {
      return;
    }
    const savedTask: Task = {
      ...currentTask.value,
      status: 'saved',
      updatedAt: getRuLocaleDate(),
    };
    updateLocalTask(savedTask);
    updateTaskById(savedTask);
    updateOriginTask(savedTask);
    resetHistory();
  }

  function updateOriginTask(task: Task) {
    originTask = deepCopyUsedJson(task);
  }

  function resetTask() {
    currentTask.value = deepCopyUsedJson(originTask);
    saveTask();
  }

  function updateLocalTask(newTask: Partial<Task>) {
    currentTask.value = {
      ...currentTask.value,
      ...newTask,
    };
    saveSnapshot();
  }

  return {
    isValidTitle,
    currentTask,
    updateLocalTask,
    removeTask,
    removePoint,
    updatePoint,
    createNewPoint,
    saveTask,
    resetTask,
    undo,
    redo,
    canUndo,
    canRedo,
    debouncedTaskUpdate,
  };
};
