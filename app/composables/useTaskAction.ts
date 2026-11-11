export const useTaskAction = () => {
  const taskStore = useTaskStore();
  const { tasks } = storeToRefs(taskStore);
  const { removeTask } = taskStore;

  return {
    tasks,
    removeTask,
  };
};
