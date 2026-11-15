interface UseHistoryOptions {
  maxHistory?: number;
  isDisableKeyboardHandler?: Ref<boolean>;
}

/**
 * Основа логики для сохранения истории изменений
 */
export const useHistory = <T>(
  initialState: T,
  { maxHistory = 50, isDisableKeyboardHandler }: UseHistoryOptions = {},
) => {
  const state = ref(deepCopyUsedJson(initialState)) as Ref<T>;
  const history = shallowRef([deepCopyUsedJson(initialState)]) as ShallowRef<T[]>;
  const currentIndex = ref(0);
  const canUndo = computed(() => currentIndex.value > 0);
  const canRedo = computed(() => currentIndex.value < history.value.length - 1);

  const debouncedSaveSnapshot = createDebounceHandler(saveSnapshot);

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  function saveSnapshot() {
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1);
    }

    const [updatedHistory] = insertNewItem(history.value, deepCopyUsedJson(state.value));
    history.value = updatedHistory;

    if (history.value.length > maxHistory) {
      history.value = history.value.slice(1, history.value.length);
    } else {
      currentIndex.value++;
    }
  }

  function undo() {
    if (!canUndo.value) {
      return;
    }
    currentIndex.value--;
    updateStateFromHistory();
  }

  function redo() {
    if (!canRedo.value) {
      return;
    }
    currentIndex.value++;
    updateStateFromHistory();
  }

  function updateStateFromHistory() {
    state.value = deepCopyUsedJson(history.value[currentIndex.value]!);
  }

  function resetHistory() {
    history.value = [deepCopyUsedJson(state.value)];
    currentIndex.value = 0;
  }

  function handleKeydown(evt: KeyboardEvent) {
    if ((!evt.ctrlKey && !evt.metaKey) || isDisableKeyboardHandler?.value) {
      return;
    }
    const evtKey = evt.key.toLowerCase();
    if (evtKey === 'z') {
      evt.preventDefault();
      if (evt.shiftKey) {
        redo(); //  Ctrl+Shift+Z - Mac
      } else {
        undo(); // Ctrl+Z
      }
    } else if (evtKey === 'y') {
      evt.preventDefault();
      redo(); // Ctrl+Y
    }
  }

  return {
    state,
    canUndo,
    canRedo,
    saveSnapshot,
    debouncedSaveSnapshot,
    undo,
    redo,
    resetHistory,
  };
};
