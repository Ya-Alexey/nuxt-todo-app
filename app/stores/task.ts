import { defineStore } from 'pinia';

export const useTaskStore = defineStore('Task', () => {
  const tasks = shallowRef<Task[]>(getTaskMock());

  function removeTask(taskIndex: number) {
    const [updatedList] = removeItemByIdx(tasks.value, taskIndex);
    tasks.value = updatedList;
  }

  function addTask() {
    const task: Task = {
      id: generateId(),
      title: 'Новая задачка',
      status: 'draft',
      list: [],
    };

    const [updatedList] = insertNewItem(tasks.value, task);
    tasks.value = updatedList;

    return task;
  }

  return {
    tasks,
    removeTask,
    addTask,
  };
});
