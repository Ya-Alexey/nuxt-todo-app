function removeItemByIdx<T>(
  list: T[],
  removedIdx: number,
): [T[], T | undefined] {
  if (removedIdx < 0 || removedIdx >= list.length) {
    return [list, undefined];
  }
  const shallowCopy = [...list];
  const [removedEl] = shallowCopy.splice(removedIdx, 1);
  return [shallowCopy, removedEl];
}

function insertItemByIdx<T>(
  list: T[],
  targetIdx: number,
  insertItem: T,
): [T[], T] {
  const safeIdx = Math.max(0, Math.min(targetIdx, list.length));
  const shallowCopy = [...list];
  shallowCopy.splice(safeIdx, 0, insertItem);

  return [shallowCopy, insertItem];
}

function insertNewItem<T>(list: T[], insertItem: T): [T[], T] {
  const shallowCopy = [...list];
  shallowCopy.splice(list.length, 0, insertItem);

  return [shallowCopy, insertItem];
}

function replaceItemByIdx<T>(
  list: T[],
  targetIdx: number,
  insertItem: T,
): [T[], T] {
  const safeIdx = Math.max(0, Math.min(targetIdx, list.length));
  const shallowCopy = [...list];
  shallowCopy.splice(safeIdx, 1, insertItem);

  return [shallowCopy, insertItem];
}

export { removeItemByIdx, insertItemByIdx, insertNewItem, replaceItemByIdx };
