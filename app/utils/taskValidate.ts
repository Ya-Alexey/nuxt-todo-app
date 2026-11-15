function isTaskPoint(item: unknown): item is TaskPoint {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const point = item as Record<string, unknown>;
  return typeof point.id === 'string' && typeof point.title === 'string' && typeof point.checked === 'boolean';
}

function isTask(item: unknown): item is Task {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const task = item as Record<string, unknown>;

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    (task.status === 'draft' || task.status === 'saved') &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string' &&
    Array.isArray(task.list) &&
    task.list.every(isTaskPoint)
  );
}

function isTaskArray(data: unknown): data is Task[] {
  return Array.isArray(data) && data.every(isTask);
}

export { isTaskArray, isTask };
