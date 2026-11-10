<template>
  <main class="main-page">
    <Head>
      <Title>Nuxt Todo App</Title>
    </Head>

    <div class="main-page__grid">
      <TaskCard
        v-for="task in taskList"
        :key="task.id"
        :task="task"
      />
    </div>

    <div class="main-page__controls">
      <BaseBtn
        class="main-page__create"
        theme="action"
      >
        <template #icon>
          <SvgIcon name="add" />
        </template>
        Создать TODO-шечку
      </BaseBtn>
    </div>
  </main>
</template>

<script lang="ts" setup>
const taskList: Task[] = [
  {
    id: 'task-1',
    title: 'Подготовка к недельному спринту',
    status: 'saved',
    list: [
      { id: 'tp-1-1', title: 'Провести ревью бэклога', checked: true },
      { id: 'tp-1-2', title: 'Сформировать цели спринта', checked: true },
      { id: 'tp-1-3', title: 'Распределить задачи по команде', checked: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Запуск рекламной кампании',
    status: 'saved',
    list: [
      {
        id: 'tp-2-1',
        title: 'Согласовать бюджет с финдиректором',
        checked: true,
      },
      { id: 'tp-2-2', title: 'Утвердить баннеры у дизайнера', checked: false },
      {
        id: 'tp-2-3',
        title: 'Настроить таргетинг в личном кабинете',
        checked: false,
      },
      { id: 'tp-2-4', title: 'Запустить тестовый показ', checked: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Обновление документации проекта',
    status: 'saved',
    list: [
      {
        id: 'tp-3-1',
        title: 'Дописать README.md для нового модуля',
        checked: true,
      },
      {
        id: 'tp-3-2',
        title: 'Обновить схему базы данных в Miro',
        checked: true,
      },
    ],
  },
];
</script>

<style lang="scss" scoped>
.main-page {
  padding: 16px 0;
  .main-page__create {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    @include media('min800') {
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));
    }
    @include media('min1000') {
      gap: 24px;
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
