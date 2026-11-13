<template>
  <main class="main-page">
    <Head>
      <Title>Nuxt Todo App</Title>
    </Head>

    <ClientOnly>
      <template #fallback>
        <div class="app-loader"></div>
      </template>
      <div class="main-page__title">{{ pageTitle }}</div>
      <div class="main-page__grid">
        <TaskCard
          v-for="(task, idx) in taskList"
          :key="task.id"
          :task="task"
          @remove-task="removeTaskByIndex(idx)"
        />
      </div>

      <div class="main-page__controls">
        <BaseBtn
          class="main-page__create"
          theme="action"
          @click="createTask()"
        >
          <template #icon>
            <SvgIcon name="add" />
          </template>
          Создать задачку
        </BaseBtn>
      </div>
    </ClientOnly>
  </main>
</template>

<script lang="ts" setup>
const router = useRouter();
const taskStore = useTaskStore();
const { tasks: taskList } = storeToRefs(taskStore);
const { removeTaskByIndex, addTask } = taskStore;

const pageTitle = computed(() => {
  if (taskList.value.length > 0) {
    return 'Списочек ваших задачек:';
  }
  return 'У вас нет задачек';
});

function createTask() {
  const { id } = addTask();
  router.push({
    name: PAGE_TASK_ID,
    params: { id },
  });
}
</script>

<style lang="scss" scoped>
.main-page {
  padding: 16px 0;
  .main-page__create {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  &__title {
    margin: 16px 0 24px;
    font-size: 22px;
    font-weight: 600;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    @include media('min800') {
      gap: 28px;
      grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));
    }
    @include media('min1000') {
      gap: 32px;
      grid-template-columns: repeat(auto-fill, minmax(470px, 1fr));
    }
  }
  &__controls {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 16px 0;
    position: sticky;
    bottom: 0;
    background-color: var(--n-00);
    z-index: calc(var(--z-layout-sticky) - 1);
  }
}
</style>
