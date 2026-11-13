import { defineStore, skipHydrate } from 'pinia';

export const useTaskStore = defineStore('Task', () => {
  const tasks = useLocalStorage('task', getTaskMock(), {
    validate: isTaskArray,
  });

  function removeTaskByIndex(taskIndex: number) {
    const [updatedList] = removeItemByIdx(tasks.value, taskIndex);
    tasks.value = updatedList;
  }

  function removeTaskById(taskId: Task['id']) {
    const taskIndex = findTaskIndexById(taskId);
    removeTaskByIndex(taskIndex);
  }

  function updateTaskById(newTask: Task) {
    const taskId = newTask.id;
    const taskIndex = findTaskIndexById(taskId);
    const [updatedList] = replaceItemByIdx(tasks.value, taskIndex, newTask);
    tasks.value = updatedList;
  }

  function addTask() {
    const date = getRuLocaleDate();
    const task: Task = {
      id: generateId(),
      title: 'Новая задачка',
      status: 'draft',
      createdAt: date,
      updatedAt: date,
      list: [createTaskPoint()],
    };

    const [updatedList] = insertNewItem(tasks.value, task);
    tasks.value = updatedList;
    return task;
  }

  function createTaskPoint() {
    const point: TaskPoint = {
      id: generateId(),
      title: 'Новая TODO-шечка',
      checked: false,
    };
    return point;
  }

  function findTaskIndexById(taskId: Task['id']) {
    return tasks.value.findIndex(({ id }) => id === taskId);
  }

  function getTaskById(taskId: Task['id']) {
    return tasks.value.find(({ id }) => id === taskId);
  }

  return {
    tasks: skipHydrate(tasks),
    getTaskById,
    removeTaskByIndex,
    removeTaskById,
    addTask,
    updateTaskById,
    createTaskPoint,
  };
});
