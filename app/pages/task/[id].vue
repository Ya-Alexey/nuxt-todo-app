<template>
  <div class="task-page">
    <Head>
      <Title>Todo App | {{ pageTitle }}</Title>
    </Head>
    <ClientOnly>
      <template #fallback>
        <div class="app-loader"></div>
      </template>
      <TaskEditor
        v-if="currentTask"
        :task="currentTask"
      />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const isClient = import.meta.client;
const route = useRoute();
const taskStore = useTaskStore();
const { getTaskById } = taskStore;

const currentTask = ref<Task | null>(null);
const pageTitle = computed(() => currentTask.value?.title || 'Просмотр задачки');

watch(
  () => route.params.id,
  (newId) => {
    if (!isClient) {
      return;
    }
    const task = getTaskById(newId as string);
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      });
    }
    currentTask.value = deepCopyUsedJson(task);
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.task-page {
  padding: 32px 0 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}
</style>
