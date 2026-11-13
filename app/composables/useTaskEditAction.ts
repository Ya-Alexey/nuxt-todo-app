/**
 * Основные действия для редактирования задачки
 */
export const useTaskEditAction = (currentTask: Ref<Task | null>) => {
  let originTask: Task | null = null;
  const router = useRouter();
  const taskStore = useTaskStore();
  const { removeTaskById, updateTaskById, createTaskPoint } = taskStore;

  const isValidTitle = useValidInput(() => currentTask.value?.title || '', {
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
    const [updatedList] = removeItemByIdx(currentTask.value!.list, index);
    currentTask.value!.list = updatedList;
  }

  function updatePoint(newPoint: Partial<TaskPoint>, pointIdx: number) {
    const taskvalue = currentTask.value;
    if (!taskvalue) {
      return;
    }
    const taskList = taskvalue.list;
    const updatedPoint = { ...taskList[pointIdx]!, ...newPoint };
    const [updatedList] = replaceItemByIdx(taskList, pointIdx, updatedPoint);
    taskvalue.list = updatedList;
  }

  function createNewPoint() {
    const taskvalue = currentTask.value;
    if (!taskvalue) {
      return;
    }
    const point = createTaskPoint();
    const [updatedList] = insertNewItem(taskvalue.list, point);
    taskvalue.list = updatedList;
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
    currentTask.value = savedTask;
    updateTaskById(savedTask);
    updateOriginTask(savedTask);
  }

  function updateOriginTask(task: Task) {
    originTask = deepCopyUsedJson(task);
  }

  function resetTask() {
    currentTask.value = deepCopyUsedJson(originTask);
    saveTask();
  }

  function initTask(task: Task) {
    updateOriginTask(task);
    currentTask.value = deepCopyUsedJson(task);
  }

  return {
    isValidTitle,
    removeTask,
    removePoint,
    updatePoint,
    createNewPoint,
    saveTask,
    resetTask,
    initTask,
  };
};
